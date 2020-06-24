/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp');
const ts = require('gulp-typescript');
const sass = require('gulp-sass');

const tsProject = ts.createProject('tsconfig.json');

function typescript() {
  return gulp.src('src/**/*.ts').pipe(tsProject()).js.pipe(gulp.dest('build'));
}

function copyTemplates(cb) {
  gulp.src('./src/resources/**/**.pug').pipe(gulp.dest('build/resources'));
  cb();
}

function styles(cb) {
  gulp
    .src('./src/resources/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build/resources/styles'));
  cb();
}

exports.default = gulp.series(typescript, copyTemplates, styles);
