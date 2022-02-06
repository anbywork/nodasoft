const {src, dest, task, series, parallel, watch} = require('gulp');

const BUILD_FOLDER = 'build';
const SOURCE_FOLDER = 'src';

const PATH = {
  src: {
    html: SOURCE_FOLDER + '/**/*.html',
    scss: [
      'node_modules/normalize.css/normalize.css',
      SOURCE_FOLDER + '/styles/main.scss',
    ],
    js: SOURCE_FOLDER + '/js/**/*',

  },
  clean: './' + BUILD_FOLDER + '/',
  build: {
    html: BUILD_FOLDER + '/',
    css: BUILD_FOLDER + '/styles/',
  },
  watch: {
    html: SOURCE_FOLDER + '/**/*.html',
    scss: SOURCE_FOLDER + '/styles/**/*.scss',
  },
};

const packages = {
  gulpRm: require('gulp-rm'),

  fileInclude: require('gulp-file-include'),

  concat: require('gulp-concat'),
  sass: require('gulp-sass'),
  sassGlob: require('gulp-sass-glob'),
  autoPrefix: require('gulp-autoprefixer'),
  cleanCSS: require('gulp-clean-css'),
  sourcemaps: require('gulp-sourcemaps'),
  groupMedia:  require('gulp-group-css-media-queries'),
  gulpRename: require('gulp-rename'),
  gulpUtil: require('gulp-util'),
  notifier: require('node-notifier'),

  fileSystem: require('fs'),
  browserSync: require('browser-sync').create(),
};

const statsLog = {
  colors: true,
  reasons: true
};

task('clean', ()=> {
    return src(PATH.clean + '**/*', {read: false})
      .pipe(packages.gulpRm());
});


task('html',()=> {
  return src(PATH.src.html)
    .pipe(packages.fileInclude({
      prefix: '@@',
      basepath: 'src/'
    }))
    .pipe(dest(PATH.build.html))
    .pipe(packages.browserSync.reload({stream: true}));
});

task('sassToCss', ()=> {
  return src(PATH.src.scss)
    .pipe(packages.sourcemaps.init())
    .pipe(packages.concat('main.css'))
    .pipe(packages.sassGlob())
    .pipe(packages.sass().on('error', packages.sass.logError))
    .pipe(packages.groupMedia())
    .pipe(packages.autoPrefix({
      overrideBrowserslist: ['last 5 versions'],
      cascade: true,
    }))
    .pipe(dest(PATH.build.css))
    .pipe(packages.cleanCSS({compatibility: 'ie8'}))
    .pipe(packages.gulpRename('main.min.css'))
    .pipe(packages.sourcemaps.write())
    .pipe(dest(PATH.build.css))
    .pipe(packages.browserSync.reload({stream: true}));
});

task('sassToCssProd', ()=> {
  return src(PATH.src.scss)
    .pipe(packages.concat('main.css'))
    .pipe(packages.sassGlob())
    .pipe(packages.sass().on('error', packages.sass.logError))
    .pipe(packages.groupMedia())
    .pipe(packages.autoPrefix({
      overrideBrowserslist: ['last 5 versions'],
      cascade: true,
    }))
    .pipe(dest(PATH.build.css))
    .pipe(packages.cleanCSS({compatibility: 'ie8'}))
    .pipe(packages.gulpRename('main.min.css'))
    .pipe(dest(PATH.build.css))
});

task('browserSync', ()=> {
  packages.browserSync.init({
    server: {
      baseDir: "./" + BUILD_FOLDER
    },
    port: 3000,
    open: true
  });
});



task('watch', ()=> {
  watch(PATH.watch.html, series('html'));
  watch(PATH.watch.scss, series('sassToCss'));
});


task('default', series('clean', parallel('html', 'sassToCss'), parallel('watch', 'browserSync')));
task('build', series('clean', parallel('html', 'sassToCssProd')));


