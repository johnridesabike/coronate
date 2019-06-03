let svg2Png = require("svg-to-png");
svg2Png.convert(
    __dirname + "/icon_full_inkscape.svg",
    __dirname + "/",
    {
        defaultHeight: 512,
        defaultWidth: 512
    }
);
