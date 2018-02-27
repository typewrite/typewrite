const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const tsProjectSrc = ts.createProject('tsconfig.json');

gulp.task('cleanDist', () => {
	gulp.src(['dist/*', '!dist/.gitignore']).pipe(clean());
});

gulp.task('build:src', () => {
	return tsProjectSrc.src()
        .pipe(sourcemaps.init())
        .pipe(tsProjectSrc()).js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
});

gulp.task('watch', ['build:src'], () => {
	gulp.watch('src/**/**/*.ts', ['build:src']);
});

gulp.task('dev', ['watch']);
gulp.task('build', done => {
	runSequence('cleanDist', 'build:src', () => {
		done();
	})
});
gulp.task('default', ['watch']);