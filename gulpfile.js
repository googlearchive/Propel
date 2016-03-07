/*
  Copyright 2015 Google Inc. All Rights Reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

/* eslint-env node */

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const babelify = require('babelify');
const minimist = require('minimist');
const requireDir = require('require-dir');

requireDir('./gulp-tasks');

const commandLineArgs = minimist(process.argv.slice(2));

const build = function(entry) {
  const bundler = browserify({
    entries: ['src/' + entry]
    // Disable source maps until we can get them into a separate file again.
    // debug: true
  }).transform(babelify.configure({
    blacklist: ['regenerator'],
    optional: ['asyncToGenerator']
  }));

  bundler.plugin('browserify-header');
  // TODO: Find a minifier that can cope with ES6
  // bundler.plugin('minifyify', {
  //   map: entry + '.map.json',
  //   output: 'dist/' + entry + '.map.json'
  // });

  return bundler
    .bundle()
    .pipe(source(entry))
    .pipe(gulp.dest('dist'));
};

gulp.task('build-client', function() {
  return build('client.js');
});

gulp.task('build-worker', function() {
  return build('worker.js');
});

gulp.task('lint', function() {
  let stream = gulp.src(['src/**/*.js', 'demo/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());

  const failOnError = commandLineArgs['throw-error'] ? true : false;
  if (failOnError) {
    stream = stream.pipe(eslint.failAfterError());
  }

  return stream;
});

gulp.task('default', ['lint', 'build-client', 'build-worker']);

gulp.task('watch', ['default'], function() {
  gulp.watch(['src/**/*.js', 'demo/**/*.js'], ['lint']);
  gulp.watch(['src/**/*.js'], ['build-client', 'build-worker']);
});
