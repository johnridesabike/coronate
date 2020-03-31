open Jest;
open Expect;
open Scoring;
open Data.Player;

let players = TestData.players->Data.Id.Map.fromStringArray;

let newb = players->Belt.Map.getExn(TestData.newbieMcNewberson);
let master = players->Belt.Map.getExn(TestData.grandyMcMaster);

test("K Factor is calculated correctly", () => {
  // let newbKFactor = getKFactor(newb.matchCount);
  let masterKFactor =
    Ratings.EloRank.getKFactor(~matchCount=master.matchCount);
  // expect(newbKFactor)|>toBe(800);
  expect(masterKFactor) |> toBe(8);
});

test("Ratings are calculated correctly", () => {
  let calcRatingsForPair =
    Ratings.calcNewRatings(
      ~whiteRating=newb.rating,
      ~blackRating=master.rating,
      ~whiteMatchCount=newb.matchCount,
      ~blackMatchCount=master.matchCount,
    );
  let newbWon = calcRatingsForPair(~result=Data.Match.Result.WhiteWon);
  // not really a good example for this next one because they don't change:
  let masterWon = calcRatingsForPair(~result=Data.Match.Result.BlackWon);
  let draw = calcRatingsForPair(~result=Data.Match.Result.Draw);
  expect((newbWon, masterWon, draw))
  |> toEqual(((1600, 2592), (800, 2600), (1200, 2596)));
});

test("Ratings never go below 100", () => {
  // The white player begins with a rating of 100 and loses.
  let (newRatingWhite, _) =
    Ratings.calcNewRatings(
      ~whiteRating=100,
      ~blackRating=100,
      ~whiteMatchCount=69,
      ~blackMatchCount=69,
      ~result=Data.Match.Result.BlackWon,
    );
  expect(newRatingWhite) |> toBe(100);
});

Skip.test("Tie break scores calculate correctly", () => {
  expect(true) |> toBe(true)
});

Skip.test("The players are ranked correctly", () => {
  expect(true) |> toBe(true)
});
