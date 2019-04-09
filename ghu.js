const {resolve, join} = require('path');
const {ghu, babel, includeit, pug, less, cssmin, jszip, mapfn, read, remove, uglify, wrap, write} = require('ghu');

const NAME = 'jquery-fracs';

const ROOT = resolve(__dirname);
const SRC = join(ROOT, 'src');
const BUILD = join(ROOT, 'build');
const DIST = join(ROOT, 'dist');

ghu.defaults('release');

ghu.before(runtime => {
    runtime.pkg = Object.assign({}, require('./package.json'));
    runtime.comment = `${runtime.pkg.name} v${runtime.pkg.version} - ${runtime.pkg.homepage}`;
    runtime.commentJs = `/*! ${runtime.comment} */\n`;

    console.log(runtime.comment);
});

ghu.task('clean', 'delete build folder', () => {
    return remove(`${BUILD}, ${DIST}`);
});

ghu.task('build:scripts', runtime => {
    return read(`${SRC}/*.js`)
        .then(includeit())
        .then(babel({presets: ['@babel/preset-env']}))
        .then(wrap(runtime.commentJs))
        .then(write(mapfn.p(SRC, DIST), {overwrite: true}))
        .then(write(mapfn.p(SRC, BUILD).s('.js', `-${runtime.pkg.version}.js`), {overwrite: true}))
        .then(uglify())
        .then(wrap(runtime.commentJs))
        .then(write(mapfn.p(SRC, DIST).s('.js', '.min.js'), {overwrite: true}))
        .then(write(mapfn.p(SRC, BUILD).s('.js', `-${runtime.pkg.version}.min.js`), {overwrite: true}));
});

ghu.task('build:demo', runtime => {
    return Promise.all([
        read(`${SRC}/demo/*.pug`)
            .then(pug({pkg: runtime.pkg}))
            .then(write(mapfn.p(SRC, BUILD).s('.pug', ''), {overwrite: true})),
        read(`${SRC}/demo/*.less`)
            .then(includeit())
            .then(less())
            .then(cssmin())
            .then(write(mapfn.p(SRC, BUILD).s('.less', '.css'), {overwrite: true})),
        read(`${SRC}/demo/*.js`)
            .then(includeit())
            .then(babel({presets: ['@babel/preset-env']}))
            .then(uglify())
            .then(wrap(runtime.commentJs))
            .then(write(mapfn.p(SRC, BUILD), {overwrite: true})),

        read(`${ROOT}/node_modules/jquery/dist/jquery.min.js`)
            .then(write(`${BUILD}/demo/jquery.min.js`, {overwrite: true}))
    ]);
});

ghu.task('build:test', runtime => {
    return Promise.all([
        read(`${SRC}/test/*.pug`)
            .then(pug({pkg: runtime.pkg}))
            .then(write(mapfn.p(SRC, BUILD).s('.pug', ''), {overwrite: true})),
        read(`${SRC}/test/*.less`)
            .then(includeit())
            .then(less())
            .then(cssmin())
            .then(write(mapfn.p(SRC, BUILD).s('.less', '.css'), {overwrite: true})),
        read(`${SRC}/test/*.js`)
            .then(includeit())
            .then(babel({presets: ['@babel/preset-env']}))
            // .then(uglify())
            .then(wrap(runtime.commentJs))
            .then(write(mapfn.p(SRC, BUILD), {overwrite: true})),

        read(`${ROOT}/node_modules/scar/dist/scar.min.js`)
            .then(write(`${BUILD}/test/scar.min.js`, {overwrite: true})),
        read(`${ROOT}/node_modules/jquery/dist/jquery.min.js`)
            .then(write(`${BUILD}/test/jquery.min.js`, {overwrite: true}))
    ]);
});

ghu.task('build:copy', () => {
    return Promise.all([
        read(`${ROOT}/*.md`)
            .then(write(mapfn.p(ROOT, BUILD), {overwrite: true}))
    ]);
});

ghu.task('build', ['build:scripts', 'build:demo', 'build:test', 'build:copy']);

ghu.task('zip', ['build'], runtime => {
    return read(`${BUILD}/**/*`)
        .then(jszip({dir: BUILD, level: 9}))
        .then(write(`${BUILD}/${NAME}-${runtime.pkg.version}.zip`, {overwrite: true}));
});

ghu.task('release', ['clean', 'zip']);
