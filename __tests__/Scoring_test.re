open Jest;
open Expect;
open Scoring;

let newb = TestData.players->Js.Dict.unsafeGet("Newbie_McNewberson___");
let master = TestData.players->Js.Dict.unsafeGet("Grandy_McMaster______");

test("K Factor is calculated correctly", () => {
  // let newbKFactor = getKFactor(newb.matchCount);
  let masterKFactor = getKFactor(master.matchCount);
  // expect(newbKFactor)|>toBe(800);
  expect(masterKFactor) |> toBe(8);
});
test("Ratings are calculated correctly", () => {
  let origRatings = (newb.rating, master.rating);
  let matchCounts = (newb.matchCount, master.matchCount);
  let calcRatingsForPair = calcNewRatings(origRatings, matchCounts);
  let newbWon = calcRatingsForPair((1.0, 0.0));
  // not really a good example for this next one because they don't change:
  let masterWon = calcRatingsForPair((0.0, 1.0));
  let draw = calcRatingsForPair((0.5, 0.5));
  expect((newbWon, masterWon, draw))
  |> toEqual(((1600, 2592), (800, 2600), (1200, 2596)));
});
test("Ratings never go below 100", () => {
  // The white player begins with a rating of 100 and loses.
  let (newRatingWhite, _) =
    calcNewRatings((100, 100), (69, 69), (0.0, 1.0));
  expect(newRatingWhite) |> toBe(100);
});