/**
 * Sam Grundman's Super Awesome Gulp Web Development Toolset
 */
'use strict';

const fs = require('fs')
const packageJson = JSON.parse(fs.readFileSync('./package.json'))

function camelCase() {
	return (
		Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments).join('-')
	).split(/\s+|\/|-/).filter((e) => {
		return e !== '' && e !== null && e !== undefined
	}).map((n, i) => {
		if (i === 0) return n
		return n.charAt(0).toUpperCase() + n.slice(1)
	}).join('')
}

function getTask(task) {
	try {
		console.log(`looking for ./gulp-tasks/${task}.js`);
		return require(`./gulp-tasks/${task}.js`)(gulp, plugins, options);
	} catch(e) {
		// no catch
	}
}

const argv = require('yargs')
	.usage("\n\x1b[1mUsage:\x1b[0m gulp \x1b[36m<command>\x1b[0m \x1b[34m[options]\x1b[0m")
	.command('init', 'Initialize app', {
		name: {
			describe: 'Name for your app',
			required: true,
			alias: 'n',
		},
	})
	.command(['serve', '*'], 'Compile files and start server', {
		port: {
			describe: 'The server port to listen to',
			type: 'number',
			default: 3000,
			alias: 'p'
		}
	})
	.command('compile', 'Compile all files and output to docs folder')
	.command('generate:component', 'Generate a new component', {
		name: {
			describe: 'Name for your new component',
			required: true,
			alias: 'n',
		},
		section: {
			describe: 'Section under which to add component',
			default: '',
			alias: 's',
		},
	})
	.command('generate:page', 'Generate a new page', {
		name: {
			describe: 'Name for your new page',
			required: true,
			alias: 'n',
		},
		section: {
			describe: 'Section under which to add page',
			default: '',
			alias: 's',
		},
	})
	.command('lint', 'Lint all JavaScript and Sass/SCSS files')
	.command('transfer-files', 'Transfer all static assets and resources to docs folder')
	.command('watch', 'Watch files for changes to recompile')
	.help('?')
	.epilog(' ©2017 Samuel B Grundman')
	.argv

const gulp = require('gulp');
const path = require('path');
const fileExists = require('file-exists');

const plugins = require('gulp-load-plugins')({
	rename: {
		'gulp-autoprefixer': 'prefixCSS',
		'gulp-run-command': 'cli',
		'gulp-sass-lint': 'lintSass',
		'gulp-htmlmin': 'compileHTML',
		'gulp-eslint': 'lintES',
		'gulp-babel': 'compileJS',
		'gulp-jsdom': 'dom',
		'gulp-order': 'sort',
		'gulp-sass': 'compileSass',
		'gulp-file': 'newFile',
	},
	postRequireTransforms:{
		cli(cli) {
			return cli.default
		},
	},
});

const options = {
	compileJS:{
		comments: false,
		minified: true,
		babelrc: false,
		compact: true,
		plugins: [
			'transform-exponentiation-operator',
//			'transform-remove-console',
		],
		presets: [
			'es2015',
		],
	},
	compileSass: {
		importer: require('@mightyplow/sass-dedup-importer'),
		outputStyle: 'compressed',
		includePaths: [
			'node_modules',
			'src/scss',
		],
	},
	stripCssComments: {
		preserve: false,
	},
	compileHTML: {
		collapseWhitespace: true,
		decodeEntities: true,
		keepClosingSlash: true,
		removeComments: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		useShortDoctype: true,
	},
	lintES: {
		parserOptions: {
			sourceType: 'module',
			ecmaVersion: 7,
		},
		env: {
			browser: true,
			es6: true,
		},
		rules: {

'strict': [
	2, 'global',
],
'indent': [
	2, 'tab',
],
'space-before-function-paren': 0,
'comma-dangle': 0,
'no-console': 0,
'no-undef': 0,
'no-tabs': 0,
'no-var': 2,
'semi': 0,

		},
	},
	lintSass: {
		files: {
			ignore: '**/*.min.css',
		},
		rules: {

'extends-before-mixins': 1,
'extends-before-declarations': 1,
'placeholder-in-extend': 1,
'mixins-before-declarations': 1,
'one-declaration-per-line': 1,
'empty-line-between-blocks': 1,
'single-line-per-selector': 1,
'no-attribute-selectors': 0,
'no-color-hex': 0,
'no-color-keywords': 0,
'no-color-literals': 1,
'no-combinators': 0,
'no-css-comments': 1,
'no-debug': 1,
'no-disallowed-properties': 1,
'no-duplicate-properties': [
	1, { exclude: [
		'display',
	]}
],
'no-empty-rulesets': 1,
'no-extends': 0,
'no-ids': 1,
'no-important': 1,
'no-invalid-hex': 1,
'no-mergeable-selectors': 1,
'no-misspelled-properties': 1,
'no-qualifying-elements': 0,
'no-trailing-whitespace': 1,
'no-trailing-zero': 1,
'no-transition-all': 0,
'no-universal-selectors': 0,
'no-url-domains': 1,
'no-url-protocols': 1,
'no-vendor-prefixes': 1,
'no-warn': 1,
'property-units': 1,
'declarations-before-nesting': 1,
'force-attribute-nesting': 0,
'force-element-nesting': 0,
'force-pseudo-nesting': 0,
'class-name-format': 1,
'function-name-format': 1,
'id-name-format': 1,
'mixin-name-format': 1,
'placeholder-name-format': 1,
'variable-name-format': 1,
'attribute-quotes': 1,
'bem-depth': 1,
'border-zero': 1,
'brace-style': 1,
'clean-import-paths': 1,
'empty-args': 1,
'hex-length': [
	2, { style: 'long' }
],
'hex-notation': [
	1, { style: 'uppercase' }
],
'indentation': [
	2, { size: 'tab' }
],
'leading-zero': [
	2, { include: true }
],
'max-line-length': 0,
'max-file-line-count': 0,
'nesting-depth': [
	1, { "max-depth": 4 }
],
'property-sort-order': 0,
'pseudo-element': 1,
'quotes': [
	1, { style: 'single' }
],
'shorthand-values': 1,
'url-quotes': 1,
'variable-for-property': 1,
'zero-unit': 1,
'space-after-comma': 1,
'space-before-colon': 1,
'space-after-colon': 1,
'space-before-brace': 1,
'space-before-bang': 1,
'space-after-bang': 1,
'space-between-parens': 1,
'space-around-operator': 1,
'trailing-semicolon': 2,
'final-newline': 2

		},
	},
	prefixCSS:{
		// more options at https://github.com/postcss/autoprefixer#options
		browsers: [
			// browser strings detailed at https://github.com/ai/browserslist#queries
			'last 2 Firefox versions',
			'last 2 Chrome versions',
			'Safari >= 10',
			'ie_mob >= 11',
			'ie >= 11',
		],
		cascade: false,
	},
	dest: 'docs/',
	rmLines:{
		css:{
			filters:[
				/^\s*$/,
				/^\s*@import\b/,
			],
		},
		js:{
			filters:[
				/^[\'"]use strict[\'"];$/,
				/^\s*$/,
			],
		},
	},
	concat:{
		css:{
			path: 'min.css',
		},
		js:{
			path: 'min.js',
		},
	},
	webserver:{
		path: `/${packageJson.name}/`,
		directoryListing: false,
		defaultFile: 'index.html',
		fallback: 'index.html',
		livereload: true,
		port: argv.port,
	},
	sort:{
		css:[
			'scss/**/*.{sa,sc,c}ss',
			'main.scss',
			'components/**/*.{sa,sc,c}ss',
			'**/*.{sa,sc,c}ss',
		],
		js:[
			'js/**/*.js',
			'**/module.js',
			'{components,pages}/**/*.js',
			'app.js',
		],
	},
	replaceString: {
		js: {
			pattern:/\/\* app\.json \*\//,
			replacement: () => {
				// Read app.json to build site!
				let site = require('./src/app.json');
				if (!site.modules) site.modules = ['ngRoute'];
				let requires = '';
				[
					{
						prop:'pages',
						pref:'page',
					},
					{
						prop:'components',
						pref:'comp',
					},
				].forEach((p) => {
					if (!site[p.prop]) site[p.prop] = []
					site[p.prop].forEach((c) => {
						site.modules.push(c.module || camelCase(p.pref, c.path));
						['module','routes','ctrl'].forEach((k) => {
							let file = `${p.prop}/${c.path}`;
							if (file.substr(-1) !== '/') file += '/';
							file += `${k}.js`;
							console.log(`checking for file ${file}`);
							try {
								fs.accessSync(`./src/${file}`);
								requires += `\nrequire('../src/${file}')`;
							} catch (e) {}
						});
					});
				});
				return `const modules = ${JSON.stringify(site.modules, null, '\t')}${requires}`;
			},
			options:{
				notReplaced: false,
			},
		},
	},
	webpack:{
		output:{
			filename:'[name].js',
		},
		module:{
			loaders:[
				{ test:/\.json$/, loader:'json-loader' },
			],
		},
	},
	ssi:{
		root: 'src',
	},
};

plugins.named = require('vinyl-named');
plugins.webpack = require('webpack-stream');
plugins.replaceString = require('@yodasws/gulp-pattern-replace');

function runTasks(task) {
	const fileType = task.fileType || 'static';
	let stream = gulp.src(task.src);
	const tasks = task.tasks;

	// Output Linting Results
	;[
		'lintSass',
		'lintES'
	].forEach((task) => {
		if (tasks.indexOf(task) != -1) {
			let option = options[task] || {};
			if (option[fileType]) option = option[fileType];
			stream = stream.pipe(plugins[task](option));
			stream = stream.pipe(plugins[task].format());
		}
	});

	// Init Sourcemaps
	// stream = stream.pipe(plugins.sourcemaps.init());

	// Run each task
	if (tasks.length) for (let i=0, k=tasks.length; i<k; i++) {
		if (['lintSass', 'lintES'].indexOf(tasks[i]) !== -1) continue;
		let option = options[tasks[i]] || {};
		if (option[fileType]) option = option[fileType];
		stream = stream.pipe(plugins[tasks[i]](option));
	}

	// Write Sourcemap
	// stream = stream.pipe(plugins.sourcemaps.write());

	// Output Files
	return stream.pipe(gulp.dest(task.dest || options.dest));
}

[
	{
		name: 'compile:sass',
		src: [
			'src/**/*.{sa,sc,c}ss',
			'!src/scss/*.{sa,sc,c}ss',
			'!src/txt/**/*.{sa,sc,c}ss',
			'!**/*.min.css',
			'!**/min.css',
		],
		tasks: [
			'lintSass',
			'sort',
			'concat',
			'compileSass',
			'stripCssComments',
			'rmLines',
			'prefixCSS',
		],
		fileType: 'css',
	},
	{
		name: 'build:js',
		src: [
			'src/app.js',
		],
		tasks: [
			'lintES',
			'replaceString',
		],
		dest: 'build/',
		fileType: 'js',
	},
	{
		name: 'webpack:js',
		src: [
			'build/app.js',
		],
		tasks: [
			'named',
			'webpack',
		],
		dest: 'bundle/',
		fileType: 'js',
	},
	{
		name: 'minify:js',
		src: [
			'bundle/app.js',
		],
		tasks: [
			'compileJS',
			'rmLines',
		],
		fileType: 'js',
	},
	{
		name: 'compile:html',
		src: [
			'src/**/*.html',
			'!src/etcsl/**/*.html',
			'!**/includes/**/*.html'
		],
		tasks: [
			'ssi',
			'compileHTML',
		],
		fileType: 'html',
	},
	{
		name: 'transfer:assets',
		src: [
			'./src/**/*.jp{,e}g',
			'./src/**/*.json',
			'./src/**/*.gif',
			'./src/**/*.png',
			'./src/**/*.ttf',
		],
		tasks: [],
	},
].forEach((task) => {
	gulp.task(task.name, () => runTasks(task));
});

gulp.task('lint:sass', () => (
	gulp.src([
		'src/**/*.{sa,sc,c}ss',
		'!**/*.min.css',
		'!**/min.css'
	])
		.pipe(plugins.lintSass(options.lintSass))
		.pipe(plugins.lintSass.failOnError())
		.pipe(plugins.lintSass.format())
));

gulp.task('lint:js', () => (
	gulp.src([
		'src/**/*.js',
		'!**/*.min.js',
		'!**/min.js'
	])
		.pipe(plugins.lintES(options.lintES))
		.pipe(plugins.lintES.failOnError())
		.pipe(plugins.lintES.format())
));

gulp.task('lint', gulp.parallel('lint:sass', 'lint:js'));

gulp.task('transfer:res', gulp.parallel(
	() => (
		gulp.src([
			'./node_modules/angular/angular.min.js{,.map}',
			'./node_modules/angular-route/angular-route.min.js{,.map}',
			'./node_modules/jquery/dist/jquery.min.{js,map}',
		])
		.pipe(gulp.dest(path.join(options.dest, 'res')))
	),
	() => (
		gulp.src([
			'./node_modules/font-awesome/fonts/fontawesome-webfont.*',
		])
		.pipe(gulp.dest(path.join(options.dest, 'fonts')))
	),
));

gulp.task('transfer-files', gulp.parallel('transfer:assets', 'transfer:res'));

gulp.task('bundle:js', gulp.series(
	'build:js',
	'webpack:js',
));

gulp.task('compile:js', gulp.series(
	'bundle:js',
	'minify:js',
));

gulp.task('transliterate', getTask('transliterate'));

gulp.task('compile', gulp.parallel('compile:html', 'compile:js', 'compile:sass', 'transfer-files', 'transliterate'));

gulp.task('watch', () => {
	gulp.watch('./src/**/*.{sa,sc,c}ss', gulp.series('compile:sass'));
	gulp.watch([
		'src/**/*.html',
		'!src/etcsl/**/*.html',
	], gulp.series('compile:html'));
	gulp.watch([
		'src/etcsl/**/*.html',
	], gulp.series('transliterate'));
	gulp.watch('./src/**/*.js', gulp.series('compile:js'));
});

gulp.task('serve', () => (
	gulp.src(options.dest)
		.pipe(plugins.webserver(options.webserver))
));

gulp.task('generate:page', gulp.series(
	(done) => {
		argv.sectionCC = argv.section ? camelCase(argv.section) + '/' : '';
		argv.nameCC = camelCase(argv.name);
		argv.module = camelCase('page', argv.sectionCC, argv.nameCC);
		done();
	},
	gulp.parallel(
		() => {
			const str = `[ng-view='${argv.module}'] {\n\t/* SCSS Goes Here */\n}\n`;
			return plugins.newFile(`${argv.nameCC}.scss`, str, { src: true })
				.pipe(gulp.dest(`./src/pages/${argv.sectionCC}${argv.nameCC}`));
		},
		() => {
			const str = `<h2>${argv.name}</h2>\n`;
			return plugins.newFile(`${argv.nameCC}.html`, str, { src: true })
				.pipe(gulp.dest(`./src/pages/${argv.sectionCC}${argv.nameCC}`));
		},
		() => {
			const str = `'use strict';\n\nangular.module('${argv.module}', [\n\t'ngRoute',\n])\n`;
			return plugins.newFile('module.js', str, { src: true })
				.pipe(gulp.dest(`./src/pages/${argv.sectionCC}${argv.nameCC}`));
		},
		() => {
			const str = `'use strict';\n
angular.module('${argv.module}')
.config(['$routeProvider', function($routeProvider) {
\t$routeProvider.when('/${argv.sectionCC}${argv.nameCC}/', {
\t\ttemplateUrl: 'pages/${argv.sectionCC}${argv.nameCC}/${argv.nameCC}.html',
\t\tcontrollerAs: '$ctrl',
\t\tcontroller() {
\t\t\tangular.element('[ng-view]').attr('ng-view', '${argv.module}')
\t\t},
\t})
}])\n`
			return plugins.newFile(`routes.js`, str, { src: true })
				.pipe(gulp.dest(`./src/pages/${argv.sectionCC}${argv.nameCC}`))
		},
		// TODO: Add to app.json
		() => {
			let site = require('./src/app.json')
			if (!site.pages) site.pages = []
			site.pages.push({
				path: `${argv.sectionCC}${argv.nameCC}`,
				module: argv.module,
			})
			return plugins.newFile(`app.json`, JSON.stringify(site, null, '\t'), { src: true })
				.pipe(gulp.dest(`./src`))
		},
	),
	plugins.cli([
		`git status`,
	]),
));

gulp.task('generate:component', gulp.series(
	(done) => {
		argv.sectionCC = argv.section ? camelCase(argv.section) + '/' : ''
		argv.module = camelCase('comp', argv.sectionCC, argv.name)
		done()
	},
	gulp.parallel(
		() => {
			return plugins.newFile(`${argv.name}.html`, '', { src: true })
				.pipe(gulp.dest(`./src/components/${argv.sectionCC}${argv.name}`))
		},
		() => {
			const str = `${argv.name} {\n\t/* SCSS Goes Here */\n}\n`
			return plugins.newFile(`${argv.name}.scss`, str, { src: true })
				.pipe(gulp.dest(`./src/components/${argv.sectionCC}${argv.name}`))
		},
		() => {
			const str = `'use strict';\n\nangular.module('${argv.module}', [])\n`
			return plugins.newFile('module.js', str, { src: true })
				.pipe(gulp.dest(`./src/components/${argv.sectionCC}${argv.name}`))
		},
		() => {
			const str = `'use strict';\n
angular.module('${argv.module}')
.component('${argv.module}', {
\ttemplateUrl: 'components/${argv.sectionCC}${argv.name}/${argv.name}.html',
\tcontrollerAs: '$ctrl',
\tcontroller() {\n\t}
})\n`
			return plugins.newFile('ctrl.js', str, { src: true })
				.pipe(gulp.dest(`./src/components/${argv.sectionCC}${argv.name}`))
		},
		// TODO: Add to app.json
		() => {
			let site = require('./src/app.json')
			if (!site.components) site.components = []
			site.components.push({
				path: `${argv.sectionCC}${argv.name}`,
				module: argv.module,
			})
			return plugins.newFile(`app.json`, JSON.stringify(site, null, '\t'), { src: true })
				.pipe(gulp.dest(`./src`))
		}
	),
	plugins.cli([
		`git status`,
	]),
));

gulp.task('init:win', () => {
});

gulp.task('init', gulp.series(
	plugins.cli([
		`mkdir -pv ./src`,
		`mkdir -pv ./docs`,
		`mkdir -pv ./build`,
		`mkdir -pv ./bundle`,
		`mkdir -pv ./src/pages`,
		`mkdir -pv ./src/includes`,
		`mkdir -pv ./src/includes/header`,
	]),

	(done) => {
		if (fileExists.sync('src/index.html')) {
			done();
			return;
		}
		const str = `<!DOCTYPE html>
<html lang="en-US" ng-app="${camelCase(argv.name)}">
<head>
<!--#include file="includes/head-includes.html" -->
<title>${argv.name}</title>
</head>
<body ng-cloak>
<!--#include file="includes/header/header.html" -->
<main ng-view></main>
</body>
</html>\n`
		return plugins.newFile(`index.html`, str, { src: true })
			.pipe(gulp.dest(`./src`))
	},

	(done) => {
		if (fileExists.sync('src/main.scss')) {
			done();
			return;
		}
		const str = `* { box-sizing: border-box; }\n
:root { font-family: 'Trebuchet MS', 'Open Sans', 'Helvetica Neue', sans-serif; }\n
html {\n\theight: 100%;\n\twidth: 100%;\n\tbackground: whitesmoke;\n}\n
body {\n\tmargin: 0 auto;\n\twidth: 100%;\n\tmax-width: 1200px;\n\tmin-height: 100%;\n\tbackground: white;\n\tborder: 0 none;\n
	@media (min-width: 1201px) {\n\t\tborder: solid black;\n\t\tborder-width: 0 1px;\n\t}\n
	> * {\n\t\tpadding: 5px calc(5px * 2.5);\n\t}\n}\n
h1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n\tmargin: 0;\n}\n
a:link,\na:visited {\n\tcolor: dodgerblue;\n}\n`
		return plugins.newFile(`main.scss`, str, { src: true })
			.pipe(gulp.dest(`./src`))
	},

	(done) => {
		if (fileExists.sync('src/app.js')) {
			done();
			return;
		}
		const str = `/* app.json */\nangular.module('${camelCase(argv.name)}', modules)
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$locationProvider.html5Mode(false)
	$routeProvider.when('/', {\n\t\ttemplateUrl: 'pages/home.html',
		controllerAs: '$ctrl',\n\t\tcontroller() {
			angular.element('[ng-view]').attr('ng-view', 'pageHome')
		},
	})\n\t.otherwise({redirectTo: '/'})
}])\n`
		return plugins.newFile(`app.js`, str, { src: true })
			.pipe(gulp.dest(`./src`))
	},

	(done) => {
		if (fileExists.sync('src/app.json')) {
			done();
			return;
		}
		const site = {
			"name": packageJson.name,
			"components":[
			],
			"sections":[
			],
			"modules":[
				'ngRoute',
			],
			"pages":[
			],
		}
		return plugins.newFile(`app.json`, JSON.stringify(site, null, '\t'), { src: true })
			.pipe(gulp.dest(`./src`))
	},

	(done) => {
		if (fileExists.sync('src/includes/header/header.html')) {
			done();
			return;
		}
		const str = `<header>\n\t<h1>${argv.name}</h1>\n</header>\n<nav hidden>\n\t<a href=".">Home</a>\n</nav>\n`;
		return plugins.newFile(`header.html`, str, { src: true })
			.pipe(gulp.dest(`./src/includes/header`));
	},

	(done) => {
		if (fileExists.sync('src/includes/header/header.scss')) {
			done();
			return;
		}
		const str = `$header-color: black;\n$header-bg: lightgreen;\n$header-second-color: black;\n
body > header {\n\tcolor: $header-color;\n\tbackground: $header-bg;\n
\th1 {\n\t\tmargin: 0;\n\t}\n\n\th2 {\n\t\tcolor: $header-second-color;\n\t}\n}\n
body > nav:not([hidden]) {\n\tdisplay: flex;\n\tflex-flow: row wrap;\n\tjustify-content: space-between;
\talign-content: flex-start;\n\talign-items: flex-start;\n
\t> *:not([hidden]) {\n\t\tdisplay: block;\n\t}\n}\n`;
		return plugins.newFile(`header.scss`, str, { src: true })
			.pipe(gulp.dest(`./src/includes/header`));
	},

	(done) => {
		if (fileExists.sync('src/includes/head-includes.html')) {
			done();
			return;
		}
		const str = `<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<base href="/${packageJson.name}/"/>
<link rel="stylesheet" href="min.css"/>
<script src="res/jquery.min.js"></script>
<script src="res/angular.min.js"></script>
<script src="res/angular-route.min.js"></script>
<script src="app.js"></script>\n`;
		return plugins.newFile(`head-includes.html`, str, { src: true })
			.pipe(gulp.dest(`./src/includes`));
	},

	(done) => {
		if (fileExists.sync('src/pages/home.html')) {
			done();
			return;
		}
		const str = `<h2>Home</h2>\n`;
		return plugins.newFile(`home.html`, str, { src: true })
			.pipe(gulp.dest(`./src/pages`));
	},

	plugins.cli([
		`git status`,
	]),
));

gulp.task('compile:scss', gulp.series('compile:sass'));
gulp.task('compile:css', gulp.series('compile:sass'));

gulp.task('default', gulp.series(
	'lint',
	'compile',
	gulp.parallel(
		'serve',
		'watch',
	),
));