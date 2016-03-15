/*
  Copyright 2016 Google Inc. All Rights Reserved.

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
/* eslint-env node */

'use strict';

const gulp = require('gulp');
const spawn = require('child_process').spawn;
const mocha = require('gulp-mocha');

gulp.task('test:manual', function() {
  spawn('node', ['test/server/index.js'], {
    stdio: 'inherit'
  });
});

gulp.task('test:automated', ['default'], function() {
  // This task requires you to have chrome driver in your path
  // You can do this with:
  // npm install -g chromedriver
  return gulp.src('test/automated-suite.js', {read: false})
    .pipe(mocha());
});
