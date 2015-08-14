var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    del = require('del'),
    connect = require('connect'),
    static = require('serve-static');


gulp.task('serve', function () { connect().use(static('build', {index: 'index.html'})).listen(1337); });

var files = ['src/app.js'];
gulp.task('js', ['clean.js'], function() {
  var Compiler = babelify.configure({ optional: [
    'es7.exponentiationOperator',
    'es6.spec.blockScoping',
    'es7.classProperties',
    'es7.comprehensions',
    'es7.decorators'
  ]});

  browserify(files).transform(Compiler).bundle().pipe(source('bundle.js')).pipe(gulp.dest('build/'));
});

gulp.task('watch', function() {
  gulp.watch('src/partials/*.html', ['html.partials']);
  gulp.watch('src/index.html', ['html']);
  gulp.watch('src/**/*.js', ['js']);
});

gulp.task('html', ['clean.html'], function () {
  gulp.src('src/index.html').pipe(gulp.dest('build/'))
});

gulp.task('html.partials', function () {
  gulp.src('src/partials/*.html').pipe(gulp.dest('build/partials/'));
});

gulp.task('material', ['clean.css'], function () {
  gulp.src('node_modules/angular-material/angular-material.css').pipe(gulp.dest('build/'));
});

gulp.task('clean.css',  del.bind(null, ['build/angular-material.css']));
gulp.task('clean.html', del.bind(null, ['build/index.html']));
gulp.task('clean.js',   del.bind(null, ['build/bundle.js']));

gulp.task('default', ['serve', 'watch', 'js', 'html', 'material']);
console.log('*********\nlisten on http://localhost:1337/\n*********');
