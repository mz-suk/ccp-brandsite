const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const browsersync = require("browser-sync").create();
const del = require("del");
const replace = require("gulp-replace");

const assets = "./assets/";
const static = "./bui/";

function browser(done) {
  browsersync.init({
    port: 3333,
    server: {
      baseDir: "./",
    },
  });
  done();
}
function browserReload(done) {
  browsersync.reload();
  done();
}

function cssTask(task, maps) {
  return gulp
    .src(assets + "style/" + task + ".scss", { sourcemaps: maps })
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(assets + "css/", { sourcemaps: maps }));
}

function watchFiles() {
  gulp.watch(
    assets + "style/**/*",
    gulp.series(() => cssTask("*", true))
  );

  gulp.watch([assets + "style/**/*", "./html/**/*"], browserReload);
}

function imageTask(task) {
  var task = task !== null ? task : "";
  return gulp
    .src(assets + "img/" + task + "**/*", { since: gulp.lastRun(imageTask) })
    .pipe(
      imagemin([
        // imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        // imagemin.svgo({
        //	 plugins: [
        //		 {
        //			 removeViewBox: false,
        //			 collapseGroups: true
        //		 }
        //	 ]
        // })
      ])
    )
    .pipe(gulp.dest(static + "img/" + task));
}

function buildMoveImg() {
  return gulp.src(assets + "img/**/*").pipe(gulp.dest(static + "img/"));
}
function buildMoveFont() {
  return gulp.src(assets + "font/**/*").pipe(gulp.dest(static + "font/"));
}
function buildConvertCss() {
  console.log("buildConvertCss");

  return gulp
    .src(assets + "css/*")
    .pipe(replace("../../assets/", "../"))
    .pipe(gulp.dest(static + "css/"));
}

exports.clear = gulp.series(() => del(static));
exports.default = gulp.parallel(watchFiles, browser);
exports.css = gulp.series(() => cssTask("*", true));
exports.build = gulp.series(
  () => del(static),
  gulp.parallel(() => imageTask(null))
);
// exports.build = gulp.series(() => del(static), gulp.parallel(buildMoveImg, buildMoveFont, buildConvertCss));
