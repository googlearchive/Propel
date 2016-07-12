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
const requireDir = require('require-dir');
const runSequence = require('run-sequence');

requireDir('./gulp-tasks');

global.config = {
  env: 'prod',
  src: 'src',
  dest: 'dist'
};

gulp.task('default', function(cb) {
  runSequence(
    'clean',
    'build',
    cb);
});

gulp.task('watch', function(cb) {
  global.config.env = 'dev';

  runSequence(
    'default',
    'start-watching',
    cb
  );
});
