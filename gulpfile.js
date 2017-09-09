var gulp = require('gulp');
var del = require('del');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var es = require('event-stream');
var series = require('stream-series');
var fs = require('fs');

var config = require('./gulp.config')();
var styleConfig = {};

// load gulp-* plugins.  Cleaner Code is better - Thanks uncle Bob
var $ = require('gulp-load-plugins')({lazy:true});

 // Default task
gulp.task('help', $.taskListing);
gulp.task('default', ['help'], function() {
	log($.util.colors.green('Available build targets: --output dev [default], --output prod, --output asis'));
});

// Main dev task without actually hosting the site
gulp.task('build', ['setBuildTarget','cleanAll','loadStyleConfig','inject'], function(doneCallBack) {
	doneCallBack();
});

gulp.task('setBuildTarget', function(doneCallBack) {
	if (args.output) {
		var output = args.output;
		if (output === 'prod') {
			config.changeToProd();
		}
		else if (output === 'asis') {
			config.changeToASIS();
		}
		else {
			config.changeToDev();
		}
	}
	else {
		config.changeToDev();
	}
	doneCallBack();
});

// Serve up development and testing
gulp.task('serve', ['build'], function() {
	log('Starting browserSync');

	config.serving = true;

	var sync =  browserSync({
			server: config.dest,
			index: 'index.html'
		});
	gulp.watch(config.sassToCompile, ['sass']);
	gulp.watch([].concat(
		config.jsToVet,config.views,
		config.src + '*.html',
		config.styleConfigFile),
		['reloadBrowser']);
});

gulp.task('vet', function(doneCallBack) {
	log('Analysing Javascript for code issues and code style');

	return gulp
		.src(config.jsToVet)
		.pipe($.if(args.verbose,$.print()))
		.pipe($.jshint())
		.pipe($.jscs())
		.pipe($.jscsStylish.combineWithHintResults())
		.pipe($.jshint.reporter('jshint-stylish'))
		.pipe($.jshint.reporter('fail'));
});

gulp.task('inject', ['sass', 'processJs', 'moveToBuild', 'createViewsInCache'], function() {
	log('Injecting the css, processData and Javascript');
	return injectProcessedSources();
});

gulp.task('createViewsInCache', function() {

	//console.log($);
	return gulp
		.src(config.views)
		.pipe($.angularTemplatecache({
			module:'viewCache',
			root: 'views',
			standalone: true
		}))
		.pipe(gulp.dest(config.dest));
});

gulp.task('sass', ['loadStyleConfig','sassConfig'], function() {
	log('Processing SASS');

	return gulp
		.src(config.sassToCompile)
		.pipe($.jsonSass())
		.pipe($.sass({
			includePaths: config.bootstrapPath
		}).on('error',$.sass.logError))
		.pipe($.concat('mainStyles.css'))
		.pipe(
			$.if(doMinify(), $.minifyCss({
				compatibility: 'ie8'
			})))
		.pipe(gulp.dest(config.temp + 'css'))
		.pipe($.if(config.serving, gulp.dest(config.dest)))
		.pipe($.if(config.serving, browserSync.stream({match: '**/*.css'})));
});

gulp.task('processJs', ['resourcJs','vendorJs', 'appJs'],function (doneCallBack) {
	doneCallBack();
});

gulp.task('resourcJs', function() {
	log('Processed resources scripts');

	return gulp
		.src(config.resourcesJs)
		.pipe($.print())
		.pipe($.concat('resources.js'))
		.pipe(gulp.dest(config.temp + 'js'));
});

gulp.task('vendorJs', function() {
	log('Processed vendor scripts');

	return gulp
		.src(config.vendorJs)
		.pipe($.print())
		.pipe($.concat('lib.js'))
		.pipe(gulp.dest(config.temp + 'js'));
});

gulp.task('appJs', function() {
	var sassConfig = 'var sassConfig = ' + JSON.stringify(styleConfig) + ';';

	log('Output is prod: ' + args.output === 'prod');

	return gulp
		.src(config.angularJs)
		.pipe($.file('sassConfig.js', sassConfig))
		.pipe($.concat('main.js'))
		.pipe($.if(doMinify(), $.uglify({mangle:false})))
		.pipe(gulp.dest(config.temp + 'js'));
});

gulp.task('cleanAll', function(doneCallBack) {
	try {
		del.sync([config.dest + '**',config.temp + '**']);
	}
	catch (e) {
		// Failed to clean, happens if files are open
		log($.util.colors.red('CleanAll Error: ' + e.message));
	}
	doneCallBack();
});

gulp.task('moveImages', function() {
	log('Moving and compressing the images to the destination');

	return gulp
		.src(config.images)
		//.pipe($.imagemin({optimizationLevel: 4}))
		.pipe(gulp.dest(config.dest));
});

gulp.task('moveAssets', function() {
    log('Moving Assets');

    return gulp
        .src(config.assets)
        .pipe(gulp.dest(config.dest));
});

gulp.task('sassConfig', function() {
	var sassConfig = JSON.stringify(styleConfig);
	return gulp
		.src(config.src + '*.js')
		.pipe($.file('_sass_config.json', sassConfig))
		.pipe($.jsonSass())
		.pipe(gulp.dest(config.temp + 'config/'));
});

gulp.task('loadStyleConfig', function(doneCallBack) {
	var jsonString = fs.readFileSync(config.styleConfigFile, 'utf8');
	styleConfig = JSON.parse(jsonString);
	doneCallBack();
});

gulp.task('moveToBuild', ['sass','processJs','moveCss',
	'moveProcessData', 'moveJs', 'moveImages', 'moveFonts','moveAssets'], function() {
	return moveToDestination(config.tempSources,'Moving from temp to destination');
});

gulp.task('moveFonts', function() {
	return moveToDestination(config.fonts, 'Moving the fonts to the destination');
});

gulp.task('moveCss', function() {
	return moveToDestination(config.temp + 'css/**/*.css', 'Moving CSS');
});

gulp.task('moveProcessData', function() {
	return moveToDestination(config.src + 'data/*.js', 'Moving ProcessedData');
});

gulp.task('moveJs', function() {
	return moveToDestination(config.temp + 'js/*.js', 'Moving Javascript');
});

gulp.task('reloadBrowser', ['build'],function () {
	log('Reloading the browser ... ');
	return browserSync.reload();
});
////////////////////////////////////////////////////////////////////
function injectProcessedSources() {
	var sources = gulp.src(config.injectSources);

	return gulp
		.src(config.src + '*.html')
		.pipe($.inject(sources, {ignorePath:'builds/develop/',addRootSlash: false}))
		.pipe(gulp.dest(config.dest));
}

function moveToDestination(sources, message) {
	log(message);

	return gulp
		.src(sources)
		.pipe(gulp.dest(config.dest));
}



function doMinify()
{
	if (args.output === 'prod' || args.output === 'asis') {
		return true;
	}
	return false;
}

function log(message)
{
	'use strict';

	var item;

	if (typeof (message) === 'object') {
		for (item in message) {
			if (message.hasOwnProperty(item)) {
				$.util.log($.util.colors.blue(message[item]));
			}
		}
	}
	else {
		$.util.log($.util.colors.blue(message));
	}
}
