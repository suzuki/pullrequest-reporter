'use strict';

var gulp    = require('gulp');
var espower = require('gulp-espower');
var mocha   = require('gulp-mocha');
var plumber = require('gulp-plumber');

var paths = {
  test: './test/*.js',
  powered_test: './powered_test/*.js',
  powered_test_dist: './powered_test/'
};

gulp.task('power-assert', function() {
  return gulp.src(paths.test)
    .pipe(espower())
    .pipe(gulp.dest(paths.powered_test_dist));
});

gulp.task('test', ['power-assert'], function() {
  gulp.src(paths.powered_test)
    .pipe(plumber())
    .pipe(mocha());
});

gulp.task('default', function() {
  gulp.watch(paths.test, ['test']);
});
