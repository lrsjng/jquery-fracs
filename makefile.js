/*jshint node: true */
'use strict';


var path = require('path'),

	pkg = require('./package.json'),

	root = path.resolve(__dirname),
	src = path.join(root, 'src'),
	build = path.join(root, 'build'),

	jshint = {
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
		browser: true,

		// Globals
		predef: [
			'jQuery'
		]
	},

	mapSrc = function (blob) {

		return blob.source.replace(src, build).replace(/\.less$/, '.css').replace(/\.jade$/, '');
	},

	mapRoot = function (blob) {

		return blob.source.replace(root, build);
	};


module.exports = function (make) {

	var Event = make.Event,
		$ = make.fQuery,
		moment = make.moment,
		stamp, replacements;


	make.version('>=0.9.0');
	make.defaults('release');


	make.before(function () {

		stamp = moment();

		replacements = {
			pkg: pkg,
			stamp: stamp.format('YYYY-MM-DD HH:mm:ss')
		};

		Event.info({ method: 'before', message: pkg.version + ' ' + replacements.stamp });
	});


	make.target('check-version', [], 'add git info to dev builds').async(function (done, fail) {

		if (!/\+$/.test(pkg.version)) {
			done();
			return;
		}

		$.git(root, function (err, result) {

			pkg.version += result.revListOriginMasterHead.length + '.' + result.revParseHead.slice(0, 7);
			Event.info({
				method: 'check-version',
				message: 'version set to ' + pkg.version
			});
			done();
		});
	});


	make.target('clean', [], 'delete build folder').sync(function () {

		$.rmfr($.I_AM_SURE, build);
	});


	make.target('lint', [], 'lint all JavaScript files with JSHint').sync(function () {

		$(src + ': *.js, ! inc/**')
			.jshint(jshint);
	});


	make.target('build', ['check-version'], 'build all updated files').sync(function () {

		var scriptName = 'jquery.fracs';
		$(src + ': ' + scriptName + '.js')
			.handlebars(replacements)
			.write($.OVERWRITE, path.join(build, scriptName + '-' + pkg.version + '.js'))
			.uglifyjs()
			.write($.OVERWRITE, path.join(build, scriptName + '-' + pkg.version + '.min.js'));

		scriptName = 'jquery.outline';
		$(src + ': ' + scriptName + '.js')
			.handlebars(replacements)
			.write($.OVERWRITE, path.join(build, scriptName + '-' + pkg.version + '.js'))
			.uglifyjs()
			.write($.OVERWRITE, path.join(build, scriptName + '-' + pkg.version + '.min.js'));

		$(src + ': demo/main.less, test/main.less')
			.less()
			.handlebars(replacements)
			.write($.OVERWRITE, mapSrc);

		$(src + ': **, ! *.js, ! **/*.less, ! inc/**')
			.handlebars(replacements)
			.write($.OVERWRITE, mapSrc);

		$(root + ': README*, LICENSE*')
			.handlebars(replacements)
			.write($.OVERWRITE, mapRoot);
	});


	make.target('release', ['clean', 'build'], 'create a zipball').async(function (done, fail) {

		$(build + ': **').shzip({
			target: path.join(build, pkg.name + '-' + pkg.version + '.zip'),
			dir: build,
			callback: done
		});
	});
};
