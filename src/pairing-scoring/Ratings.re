type matchStat = {
    white: int,
    black: int
};

type eloRank = Js.t({
    .
    [@bs.meth] getExpected: int => int => int,
    [@bs.meth] updateRating: int => int => int => int
});

[@bs.new][@bs.module "elo-rank"] external createEloRank : int => eloRank = "default";

let getKFactor = (matchCount) => {
    let ne = matchCount > 0 ? matchCount : 1;
    800 / ne;
}

let floor = 100;

let keepAboveFloor = (rating) => rating > floor ? rating : floor;

let calcNewRatings = (origRatings, matchCounts, result) => {
    let whiteElo = getKFactor(matchCounts.white) -> createEloRank;
    let blackElo = getKFactor(matchCounts.black) -> createEloRank;
    let scoreExpected = {
        white: whiteElo##getExpected(origRatings.white, origRatings.black),
        black: blackElo##getExpected(origRatings.black, origRatings.white)
    };
    {
        white: whiteElo##updateRating(
            scoreExpected.white,
            result.white,
            origRatings.white
        ) -> keepAboveFloor,
        black: blackElo##updateRating(
            scoreExpected.black,
            result.black,
            origRatings.black
        ) -> keepAboveFloor
    }
}