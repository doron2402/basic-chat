var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var del = require('del');
var rename = require('gulp-rename'); 
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var react = require('gulp-react');
var sass = require('gulp-sass');
var gzip = require('gulp-gzip');

var paths = {
  client: ['./lib/client/**/*.js', './lib/client/**/*.jsx'],
  jsDist: './public/js/',
  cssDist: './public/css/',
  scss: './lib/scss/**/*.scss',
  app: './lib/app/**/*.js'
};
 
gulp.task('cleanJS', function(cb) {
  del([paths.jsDist], cb);
});

gulp.task('cleanCSS', function(cb) {
  del([paths.cssDist], cb);
});

gulp.task('sass', ['cleanCSS'], function () {
    gulp.src(paths.scss)
      .pipe(sass({ 
        errLogToConsole: true,
        style: 'compressed',
        includePaths: [
          './bower_components/bootstrap-sass/assets/stylesheets/'
        ]
      }))
      .pipe(gulp.dest(paths.cssDist));
});
 
gulp.task('client', ['cleanJS'], function() {
  return gulp.src(paths.client, { read: false })
    .pipe(browserify({ 
      transform: ['reactify', 'debowerify'],
      extensions: ['.jsx', '.js'],
      debug: true,
    }))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('public/js'));
});
 
gulp.task('watch', function() {
  gulp.watch(paths.client, ['client', 'lint']);
  gulp.watch(paths.scss, ['sass']);
});

gulp.task('lint', function () {
  gulp.src([paths.app].concat(paths.client))
    .pipe(react())
    .pipe(jshint())
    .on('error', function(err) {
      console.error('JSX ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(jshint.reporter('default'));
});

gulp.task('app', function () {
  nodemon({ script: 'scripts/server.js', ext: 'html js', watch: paths.app })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!');
    });
});
 
gulp.task('default', ['watch', 'client', 'app', 'sass', 'lint']);
