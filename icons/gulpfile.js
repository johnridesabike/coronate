/* eslint-disable camelcase */
const favicons = require("gulp-favicons");
const gulp = require("gulp");

gulp.src(
    "./icon_full_inkscape.png"
).pipe(
    favicons({
        appDescription: null,                     // Your application's description. `string`
        appName: null,                            // Your application's name. `string`
        appShortName: null,                       // Your application's short_name. `string`. Optional. If not set, appName will be used
        appleStatusBarStyle: "default", // Style for Apple status bar: "black-translucent", "default", "black". `string`
        background: "#81ffbc",                       // Background colour for flattened icons. `string`
        developerName: null,                      // Your (or your developer's) name. `string`
        developerURL: null,                       // Your (or your developer's) URL. `string`
        dir: "auto",                              // Primary text direction for name, short_name, and description
        display: "standalone",                    // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
        icons: {
            android: true,              // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            appleStartup: true,         // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            coast: true,                // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            favicons: true,             // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            firefox: true,              // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            windows: true,              // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
            yandex: true                // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
        },
        lang: "en-US",                            // Primary language for name and short_name
        loadManifestWithCredentials: false,       // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
        logging: false,                           // Print logs to console? `boolean`
        orientation: "any",                       // Default orientation: "any", "natural", "portrait" or "landscape". `string`
        path: "/",                                // Path for overriding default icons path. `string`
        pixel_art: false,                         // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
        scope: "/",                               // set of URLs that the browser considers within your app
        start_url: "/",              // Start URL when launching the application from a device. `string`
        theme_color: "#ededf0",                      // Theme color user for example in Android's task switcher. `string`
        version: "1.0"                           // Your application's version string. `string`
    })
).pipe(gulp.dest("./output"));
