import numeral from "numeral";

// let's make a custom numeral format. I don't really know how this works.
numeral.register("format", "half", {
    regexps: {
        format: /(1\/2)/,
        unformat: /(1\/2)/
    },
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    format: function (value, format, roundingFunction) {
        /** @type {number | string} */
        let whole = Math.floor(value);
        /** @type {number | string} */
        let remainder = value - whole;
        if (remainder === 0.5) {
            remainder = "½";
        } else if (remainder === 0) {
            remainder = "";
        }
        if (whole === 0 && remainder) {
            whole = "";
        }
        // let output = numeral._.numberToFormat(value, format, roundingFunction);
        // return output;
        return String(whole) + remainder;
    },
    /** @param {string} value */
    unformat: function (value) {
        return Number(value); // doesn't work... todo?
    }
});
