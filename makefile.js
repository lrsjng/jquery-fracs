/*jshint node: true */
'use strict';


module.exports = function (make) {


	var path = require('path'),
		pkg = require('./package.json'),

		$ = make.fQuery,

		root = path.resolve(__dirname),
		src = path.join(root, 'src'),
		dist = path.join(root, 'dist'),
		build = path.join(root, 'build');


	make.version('=0.11.0');
	make.defaults('release');


	make.target('clean', [], 'delete build folder').sync(function () {

		$.DELETE(build);
		$.DELETE(dist);
	});


	make.target('lint', [], 'lint all JavaScript files with JSHint').sync(function () {

		var options = {
				// Enforcing Options
				bitwise: true,
				curly: true,
				eqeqeq: true,
				forin: true,
				latedef: true,
				newcap: true,
				noempty: true,
				plusplus: true,
				trailing: true,
				undef: true,

				// Environments
				browser: true
			},
			global = {
				'jQuery': true
			};

		$(src + ': *.js').log(-3)
			.jshint(options, global);
	});


	make.target('build', ['clean', 'lint'], 'build all updated files').sync(function () {

		var header = '/* ' + pkg.displayName + ' ' + pkg.version + ' - ' + pkg.homepage + ' */\n';
		var env = {pkg: pkg};

		$(src + ': *.js')
			.includify()
			.handlebars(env)
			.wrap(header)
			.WRITE($.map.p(src, dist))
			.WRITE($.map.p(src, build).s('.js', '-' + pkg.version + '.js'))
			.uglifyjs()
			.wrap(header)
			.WRITE($.map.p(src, dist).s('.js', '.min.js'))
			.WRITE($.map.p(src, build).s('.js', '-' + pkg.version + '.min.js'));

		$(src + ': demo/*.less, test/*.less')
			.less()
			.handlebars(env)
			.WRITE($.map.p(src, build).s('.less', '.css'));

		$(src + ': **, ! *.js, ! **/*.less')
			.handlebars(env)
			.WRITE($.map.p(src, build));

		$(root + ': README*, LICENSE*')
			.handlebars(env)
			.WRITE($.map.p(root, build));
	});


	make.target('release', ['build'], 'create a zipball').async(function (done, fail) {

		$(build + ': **').shzip({
			target: path.join(build, pkg.name + '-' + pkg.version + '.zip'),
			dir: build,
			callback: done
		});
	});
};
