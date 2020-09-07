import path from "path";

const config = {
  pathSrc: path.resolve(__dirname, "src"),
  pathBuild: path.resolve(__dirname, "slices"),
  pathDrupalTheme: path.resolve(__dirname, ""),
  openOnServerRun: "index.html", //file which will be opened in browser when server is run
  isLivereload: true, // is live reload turned on
  host: "localhost", //local server host
  port: 8282,
  hasPngSprite: true,
  hasSvgSprite: true,
};

export default config;
