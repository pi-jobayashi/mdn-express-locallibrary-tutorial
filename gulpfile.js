const gulp = require("gulp");
const sass = require("gulp-sass");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync");
const server = browserSync.create();

sass.compiler = require("node-sass");


const paths = {
  styles: {
    src: "./public/stylesheets/*.scss",
    dest: "./public/stylesheets"
  }
}
// const clean = () => del(['dist']);

function clean(cb) {
  console.log("clean up, clean up, everybody clean up");
  cb();
}

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(concat("style.min.css"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.styles.dest));
};

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: "./bin/www"
    }
  });
  done();
}

const watch = () => gulp.watch(paths.styles.src, gulp.series(styles, reload));

const dev = gulp.series(clean, styles, watch);
exports.default = dev;