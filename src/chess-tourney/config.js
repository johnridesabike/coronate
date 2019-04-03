import * as scores from "./scores";
import config from "./default-config.json";
/**
 * `tieBreak` is Used for tiebreaks. USCF recommends using these methods
 * in-order: modified median, solkoff, cumulative, and cumulative of opposition.
 * */
config.tieBreak.forEach(function (method) {
    // Dumb question... does assigning functions like this harm security?
    method.func = scores[method.funcName];
});

export default Object.freeze(config);