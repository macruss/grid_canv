var gulp   = require('gulp');
var tsc    = require('gulp-tsc');
var server = require('gulp-server-livereload');
var jade   = require('gulp-jade');
var stylus = require('gulp-stylus');


gulp.task('webserver', function() {
  gulp.src('dist/')
    .pipe(server({
      livereload: true
    }));
});

gulp.task('compile', function(){
  gulp.src(['./src/*.ts'])
    .pipe(tsc())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('templates', function() {
 
  gulp.src('./src/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('./dist/'))
});


gulp.task('stylus', function () {
  gulp.src('./src/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./dist/'));
});


gulp.task('default', function() {  
  gulp.run('webserver');

  gulp.watch('src/*.ts', ['compile']);
  gulp.watch('src/*.jade', ['templates']);
  gulp.watch('src/*.styl', ['stylus']);
});
