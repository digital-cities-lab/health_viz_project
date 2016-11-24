var gulp = require('gulp');

var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var csv2json = require('gulp-csv2json');
var rename = require('gulp-rename');
var jsonmin = require('gulp-jsonmin');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();


gulp.task('default', ['usemin', 'copy', 'images', 'datamin']);

//csv to json
gulp.task('csv2json', function () {
    return gulp.src('data/*.csv')
        .pipe(csv2json({}))
        .pipe(rename({extname: '.json'}))
        .pipe(gulp.dest('data'));
});

gulp.task('clean', function () {
    return gulp.src(['doc/assets/css', 'doc/assets/js'], {read: false})
        .pipe(clean());
});
gulp.task('usemin', ['clean'], function() {
    return gulp.src('*.html')
        .pipe(usemin({
            css: [minifyCss, rev],
            js: [uglify, rev]
        }))
        .pipe(gulp.dest('docs/'));
});

gulp.task('copy', function() {
    return gulp.src('assets/font/*')
        .pipe(newer('assets/font/*'))
        .pipe(gulp.dest('docs/assets/font'));
});

// Minify any new images
gulp.task('images', function() {
    // Add the newer pipe to pass through newer images only
    return gulp.src('assets/img/*')
        .pipe(newer('assets/img/*'))
        .pipe(imagemin())
        .pipe(gulp.dest('docs/assets/img'));
});

gulp.task('datamin', function() {
    return gulp.src('data/*.json')
        .pipe(newer('data/*.json'))
        .pipe(jsonmin())
        .pipe(gulp.dest('docs/data'));
});

