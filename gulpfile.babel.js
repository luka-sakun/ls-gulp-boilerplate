import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
const postcssPresetEnv = require("postcss-preset-env");
const imagemin = require("gulp-imagemin");
const spritesmith = require("gulp.spritesmith");
const buffer = require("vinyl-buffer");
const { series, parallel, src, dest, watch } = require("gulp");
const gulpWebServer = require("gulp-webserver");
const babel = require("gulp-babel");
const browserify = require("gulp-browserify");
const path = require("path");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const sassGlob = require("gulp-sass-glob");
const twig = require("gulp-twig");
import config from "./config";
import configLocal from "./config.local";
import * as twigData from "./src/templates/data.json";
const svgSprite = require("gulp-svg-sprite");

const ENV = process.env.ENV; // Environment: 'development' | 'production'
const CONFIG = {
  ...config,
  ...configLocal,
};
const HASH = `${Date.now()}`;
const PATH_SRC = CONFIG.pathSrc;
const PATH_DEST =
  ENV === "production" ? CONFIG.pathDrupalTheme : CONFIG.pathBuild;

console.log("-----------------------");
console.log("PATH_DEST", PATH_DEST);
console.log("ENV", ENV);
console.log("-----------------------");

const runServer = (cb) => {
  src(PATH_DEST, { allowEmpty: true }).pipe(
    gulpWebServer({
      host: CONFIG.host,
      port: CONFIG.port,
      open: CONFIG.openOnServerRun ? CONFIG.openOnServerRun : "/",
      directoryListing: true,
      livereload: {
        enable: CONFIG.isLivereload,
      },
    })
  );

  cb();
};

const buildPngSprite = (cb) => {
  if (!CONFIG.hasPngSprite) {
    cb();
    return;
  }

  const spriteData = src(`${PATH_SRC}/png-icons/*.png`, {
    allowEmpty: true,
    dot: true,
  })
    .pipe(
      spritesmith({
        imgName: "sprite.png",
        cssName: "sprite.scss",
        imgPath: `../images/sprite.png?${HASH}`,
        padding: 10,
        algorithm: "binary-tree",
        retinaSrcFilter: [`${PATH_SRC}/png-icons/*@2x.png`],
        retinaImgName: `sprite@2x.png`,
        retinaImgPath: `../images/sprite@2x.png?${HASH}`,
        cssVarMap: function (sprite) {
          sprite.name = "icon-" + sprite.name;
        },
      })
    )
    .on("finish", () => {
      spriteData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(dest(`${PATH_DEST}/images/`))
        .on("finish", () => {
          spriteData.css.pipe(dest(`${PATH_SRC}/styles/helpers`));
          cb();
        });
    });
};

const buildSvgSprite = (cb) => {
  const examplePageConfig =
    ENV === "production" ? {} : { example: { dest: "svg-sprite.html" } };

  src(`${PATH_SRC}/svg-icons/**/*.svg`)
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            ...examplePageConfig,
            dest: "",
            sprite: "./images/sprite.svg",
          },
        },
        svg: {
          // General options for created SVG files
          xmlDeclaration: true, // Add XML declaration to SVG sprite
        },
      })
    )
    .pipe(dest(`${PATH_DEST}`));
  cb();
};

const buildCSS = (cb) => {
  const postcssPlugins = [
    postcssPresetEnv({
      autoprefixer: {
        grid: true,
      },
      features: {
        "double-position-gradients": true,
        "hexadecimal-alpha-notation": true,
        "media-query-ranges": true,
      },
    }),
  ];

  src(`${PATH_SRC}/styles/*.scss`, { allowEmpty: true, dot: true })
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: ["node_modules"],
      }).on("error", sass.logError)
    )
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write("./sourcemaps"))
    .pipe(dest(`${PATH_DEST}/styles/`));
  cb();
};

const buildHTML = (cb) => {
  src(`${PATH_SRC}/templates/*.twig`, { allowEmpty: true, dot: true })
    .pipe(
      twig({
        errorLogToConsole: true,
        // data: twigData ? twigData : {},
        data: {
          hash: HASH,
          lastUpdated: new Date().toUTCString(),
        },
      })
    )
    .pipe(dest(`${PATH_DEST}`));

  cb();
};

const buildJS = (cb) => {
  const sources = [`${PATH_SRC}/scripts/*.js`];

  if (ENV === "production") {
    sources.push(`!${PATH_SRC}/scripts/slice-only.js`);
  }

  src(sources, { allowEmpty: true, dot: true })
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(browserify())
    .pipe(sourcemaps.write("./sourcemaps"))
    .pipe(dest(`${PATH_DEST}/scripts/`));

  cb();
};

const copyImages = function (cb) {
  src("src/images/**/*").pipe(dest(`${PATH_DEST}/images/`));
  cb();
};

const copySvgIcons = function (cb) {
  src("src/svg-icons/**/*.svg").pipe(dest(`${PATH_DEST}/svg-icons/`));
  cb();
};

const copyTempFiles = function (cb) {
  src("src/temp-files/**/*").pipe(dest(`${PATH_DEST}/temp-files/`));
  cb();
};

const watchResourcesToCopy = (cb) => {
  watch([`${PATH_SRC}/images/**/*`], { events: ["all"] }, copyImages);
  watch([`${PATH_SRC}/svg-icons/**/*.svg`], { events: ["all"] }, copySvgIcons);
  watch([`${PATH_SRC}/temp-files/**/*`], { events: ["all"] }, copyTempFiles);
  cb();
};

const watchPngSprite = (cb) => {
  watch(
    [`${PATH_SRC}/png-icons/**/*.png`],
    { events: ["all"] },
    buildPngSprite
  );
  cb();
};

const watchSvgSprite = (cb) => {
  watch(
    [`${PATH_SRC}/svg-icons/**/*.svg`],
    { events: ["all"] },
    buildSvgSprite
  );
  cb();
};

const watchSCSS = (cb) => {
  watch([`${PATH_SRC}/styles/**/*.scss`], { events: ["all"] }, buildCSS);
  cb();
};

const watchTwig = (cb) => {
  watch([`${PATH_SRC}/templates/**/*.*`], { events: ["all"] }, buildHTML);
  cb();
};

const watchJS = (cb) => {
  watch([`${PATH_SRC}/scripts/**/*.*`], { events: ["all"] }, buildJS);
  cb();
};

exports.buildSvgSprite = series(buildSvgSprite);

exports.buildDrupalTheme = series(
  buildPngSprite,
  buildSvgSprite,
  buildJS,
  buildCSS,
  copyImages,
  copySvgIcons
);

exports.buildSlices = series(
  buildPngSprite,
  buildSvgSprite,
  buildCSS,
  buildHTML,
  buildJS,
  parallel(copyImages, copySvgIcons, copyTempFiles)
);

exports.default = series(
  buildPngSprite,
  buildSvgSprite,
  buildCSS,
  buildHTML,
  buildJS,
  parallel(
    runServer,
    copyImages,
    copySvgIcons,
    copyTempFiles,
    watchSCSS,
    watchPngSprite,
    watchSvgSprite,
    watchTwig,
    watchJS,
    watchResourcesToCopy
  )
);
