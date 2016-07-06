var gulp = require('gulp'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	less = require('gulp-less'),
	concat = require('gulp-concat'),
	webpack = require('gulp-webpack'),
	webpackConfig = require('./webpack.config.js');
gulp.task('taskLess', function() {
	gulp.src('src/less/*.less')
		.pipe(less())
		.pipe(minifycss())
		.pipe(rename({
			suffix : '.min'
		}))
		.pipe(gulp.dest('src/css_min/'));
});

gulp.task('buildjsx', function(){
	return gulp.src('./')
		.pipe(webpack(webpackConfig))
		.pipe(gulp.dest('./build/jsx_build'))
});

gulp.task('startWatch', function(){
	gulp.watch('src/less/*.less', ['taskLess']);
	gulp.watch('build/jsx/*.js', ['buildjsx']);
});

