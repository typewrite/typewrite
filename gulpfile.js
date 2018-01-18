const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('cleanDist', () => {
	gulp.src(['dist', '!.gitignore']).pipe(clean());
});

gulp.task('scripts', () => {
	const tsResult = tsProject.src()
	.pipe(tsProject());

	return tsResult.js.pipe(gulp.dest('dist'));

	// return gulp.src(['src/**/**/*.ts'])
	// 	.pipe(sourcemaps.init())
	// 	.pipe(ts())
	// 	.pipe(sourcemaps.write())
	// 	.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
	gulp.watch('src/**/**/*.ts', ['scripts']);
});

gulp.task('dev', ['watch']);
gulp.task('build', done => {
	runSequence('cleanDist', 'scripts', () => {
		done();
	})
});
gulp.task('default', ['watch']);