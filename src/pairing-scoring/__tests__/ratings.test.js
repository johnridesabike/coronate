import {curry} from "ramda";
import data from "../../test-data";
import {getKFactor, calcNewRatings} from "../";

const newb = data.players["Newbie_McNewberson___"];
const master = data.players["Grandy_McMaster______"];

it("K Factor is calculated correctly", function () {
    const newbKFactor = getKFactor(newb.matchCount);
    const masterKFactor = getKFactor(master.matchCount);
    expect(Math.ceil(newbKFactor)).toBe(800);
    expect(Math.ceil(masterKFactor)).toBe(8);
});
it("Ratings are calculated correctly", function () {
    const origRatings = [newb.rating, master.rating];
    const matchCounts = [newb.matchCount, master.matchCount];
    const calcRatings = curry(calcNewRatings)(origRatings, matchCounts);
    const newbWon = calcRatings([1, 0]);
    expect(newbWon).toEqual([1600, 2592]);
    // not really a good example for this next one because they don't change:
    const masterWon = calcRatings([0, 1]);
    expect(masterWon).toEqual([800, 2600]);
    const draw = calcRatings([0.5, 0.5]);
    expect(draw).toEqual([1200, 2596]);
});
it("Ratings never go below 100", function () {
    // The white player begins with a rating of 100 and loses.
    const newRatings = calcNewRatings([100, 100], [69, 69], [0, 1]);
    expect(newRatings[0]).toBe(100);
});

