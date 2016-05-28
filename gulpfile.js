var gulp = require('gulp');
var minify = require('gulp-minify');
var header = require('gulp-header');
var fs = require('fs');

gulp.task('default', function () {

});

gulp.task('build', function () {
	gulp.src('src/*.js')
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			}
		}))
		.pipe(header( "/*\n" + fs.readFileSync('LICENSE', 'utf8') + "*/\n\n\n" ))
		.pipe(gulp.dest('dist'))
});