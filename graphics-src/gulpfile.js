/* eslint-disable max-len */
/* eslint-disable camelcase */
const favicons = require("favicons").stream;
const gulp = require("gulp");
const log = require("fancy-log");
const photon = require("photon-colors");

gulp.task("svg-to-web-icons", function () {
  return gulp
    .src("./icon-src.svg")
    .pipe(
      favicons({
        appDescription: "A free, easy-to-use Swiss chess tournament manager.", // Your application's description. `string`
        appName: "Coronate: chess tournament manager", // Your application's name. `string`
        appShortName: "Coronate", // Your application's short_name. `string`. Optional. If not set, appName will be used
        appleStatusBarStyle: "default", // Style for Apple status bar: "black-translucent", "default", "black". `string`
        background: photon.INK_70, // Background colour for flattened icons. `string`
        developerName: "John Jackson", // Your (or your developer's) name. `string`
        developerURL: "https://johnridesa.bike/", // Your (or your developer's) URL. `string`
        dir: "auto", // Primary text direction for name, short_name, and description
        display: "standalone", // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
        html: "test.html",
        icons: {
          android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          coast: false, // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          favicons: true, // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          firefox: false, // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          windows: true, // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
          yandex: true, // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
        },
        lang: "en-US", // Primary language for name and short_name
        loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
        logging: false, // Print logs to console? `boolean`
        orientation: "any", // Default orientation: "any", "natural", "portrait" or "landscape". `string`
        path: "/", // Path for overriding default icons path. `string`
        pipeHtml: true,
        pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
        // replace: true,
        scope: "/", // set of URLs that the browser considers within your app
        start_url: ".", // Start URL when launching the application from a device. `string`
        theme_color: "#363959", // Theme color user for example in Android's task switcher. `string`
        version: "1.0", // Your application's version string. `string`
      })
    )
    .on("error", log)
    .pipe(gulp.dest("../public"));
});
