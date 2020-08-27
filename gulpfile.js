/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

function typescript() {
  return gulp.src('src/**/*.ts').pipe(tsProject()).js.pipe(gulp.dest('build'));
}

function copyMailTemplates(cb) {
  gulp.src('./resources/**/**.hbs').pipe(gulp.dest('build/resources'));
  cb();
}

exports.default = gulp.series(typescript, copyMailTemplates);
