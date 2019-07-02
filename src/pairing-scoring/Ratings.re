open Scoring;
type eloRank = {
  .
  [@bs.meth] "getExpected": (int, int) => int,
  [@bs.meth] "updateRating": (int, float, int) => int,
};

[@bs.new] [@bs.module "elo-rank"]
external createEloRank: int => eloRank = "default";

let getKFactor = matchCount => {
  let ne = matchCount > 0 ? matchCount : 1;
  800 / ne;
};

let floor = 100;

let keepAboveFloor = rating => rating > floor ? rating : floor;

let calcNewRatings =
    (origRatings: matchStat, matchCounts: matchStat, result: matchStatFloat) => {
  let whiteElo = getKFactor(matchCounts.white)->createEloRank;
  let blackElo = getKFactor(matchCounts.black)->createEloRank;
  let scoreExpected: matchStat = {
    white: whiteElo##getExpected(origRatings.white, origRatings.black),
    black: blackElo##getExpected(origRatings.black, origRatings.white),
  };
  let result: matchStat = {
    white:
      whiteElo##updateRating(
        scoreExpected.white,
        result.white,
        origRatings.white,
      )
      ->keepAboveFloor,
    black:
      blackElo##updateRating(
        scoreExpected.black,
        result.black,
        origRatings.black,
      )
      ->keepAboveFloor,
  };
  result;
};