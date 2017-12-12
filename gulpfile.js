var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    addsrc = require('gulp-add-src'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $ = gulpLoadPlugins(),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    source = './src',
    target = './dist';

gulp.task('scripts', function() {
    gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        source +'/js/**/*.js'
    ])
    .pipe(uglify())
    .pipe(concat('script.js'))
    .pipe(gulp.dest(target + '/js'));
});

gulp.task('sass', function() {
    gulp.src([
        source + '/styles/main.scss'
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(addsrc.prepend('node_modules/bootstrap/dist/css/bootstrap.css'))
    .pipe(minifyCSS())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(target + '/css'))
    .pipe(browserSync.stream());;
});

gulp.task('fonts', function() {
    gulp.src([
        'node_modules/bootstrap/dist/fonts/*',
        source + '/fonts/*'
    ])
    .pipe(gulp.dest(target +'/fonts'));
});

gulp.task('images', function () {
    return gulp.src(source + '/images/**/*')
        .pipe($.cache($.imagemin([
            $.imagemin.gifsicle({interlaced: true}),
            $.imagemin.jpegtran({progressive: true}),
            $.imagemin.optipng({optimizationLevel: 5})
        ])))
        .pipe(gulp.dest(target + '/images/'))
        .pipe($.size());
});

gulp.task('watch', function() {
    gulp.run('default');

    gulp.watch(source + '/styles/**/*.scss', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        gulp.run('sass');
    });

    gulp.watch(source + '/js/**/*.js', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        gulp.run('scripts');
    });
});


gulp.task('build', ['clean', 'sass', 'images', 'scripts'], function() {
    return gulp.src('./index.html')
        .pipe($.usemin({
            html: [
                $.htmlmin({
                    collapseWhitespace: true
                })
            ],
            css: [
                $.replace('../../', ''),
                $.cssnano(),
                $.rev()
            ],
            js: [
                $.uglify(),
                $.rev()
            ]
        }))
        .pipe(gulp.dest(target));
});

gulp.task('clean', function() {
    return del([target]);
});

gulp.task('serve', ['sass', 'scripts', 'images', 'fonts'], function() {
    browserSync.init({
        server: './'
    });
    gulp.watch(source + '/js/**/*.js', ['scripts']);
    gulp.watch(source + '/scss/**/*.scss', ['sass']);
    gulp.watch('index.html').on('change', browserSync.reload);
});

gulp.task('default', function() {
    gulp.task('default', ['serve']);
});