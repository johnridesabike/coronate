[@bs.deriving abstract]
type scoreData = {
    colorScores: array(float),
    colors: array(int),
    id: string,
    isDummy: bool,
    opponentResults: Js.Dict.t(float),
    ratings: array(int),
    results: array(float),
    resultsNoByes: array(float)
};

[@bs.module "ramda"] external ascend : ('b => 'a) => 'a => 'a => int = "ascend";
[@bs.module "ramda"] external sort : (('a, 'a) => int) => Js.Array.t('a) => Js.Array.t('a) = "sort";

let add = a => b => a + b;
let arraySum = arr => Js.Array.reduce(add, 0, arr);
let addFloat = a => b => a +. b;
let arraySumFloat = arr => Js.Array.reduce(addFloat, 0.0, arr);
let last = arr => arr[Js.Array.length(arr) - 1];

let isNotDummy = scoreDict => oppId => {
    let opponent = Js.Dict.get(scoreDict, oppId);
    switch opponent {
    | None => true
    | Some(opponent) => !opponent->isDummyGet
    }
};

let getPlayerScore = scoreDict => id => {
    let player = Js.Dict.get(scoreDict, id);
    switch player {
    | None => 0.0
    | Some(player) => arraySumFloat(player->resultsGet)
    }
};

let getOpponentScores = scoreDict => id => {
    let player = Js.Dict.get(scoreDict, id);
    switch player {
    | None => [| |]
    | Some(player) =>
        Js.Dict.keys(player->opponentResultsGet)
            |> Js.Array.filter(isNotDummy(scoreDict))
            |> Js.Array.map(getPlayerScore(scoreDict))
    }
};

// USCF § 34E1
let getMedianScore = scoreDict => id =>
    getOpponentScores(scoreDict, id)
        |> sort(ascend((x) => x))
        |> Js.Array.slice(~start=1, ~end_=-1)
        |> arraySumFloat;

// USCF § 34E2.
let getSolkoffScore = scoreDict => id =>
    getOpponentScores(scoreDict, id) |> arraySumFloat;

// turn the regular score list into a "running" score list
let runningReducer = acc => score => Js.Array.concat([|last(acc) +. score|], acc);

// USCF § 34E3.
let getCumulativeScore = scoreDict => id => {
    let person = Js.Dict.get(scoreDict, id);
    switch person {
    | None => 0.0
    | Some(person) =>
        person->resultsNoByesGet
            |> Js.Array.reduce(runningReducer, [|0.0|])
            |> arraySumFloat
    }
};

// USCF § 34E4.
let getCumulativeOfOpponentScore = scoreDict => id => {
    let person = Js.Dict.get(scoreDict, id);
    switch person {
    | None => 0.0
    | Some(person) =>
        Js.Dict.keys(person->opponentResultsGet)
            |> Js.Array.filter(isNotDummy(scoreDict))
            |> Js.Array.map(getCumulativeScore(scoreDict))
            |> arraySumFloat
    };
};

// USCF § 34E6
let getColorBalanceScore = scoreDict => id => {
    let person = Js.Dict.get(scoreDict, id);
    switch person {
    | None => 0.0
    | Some(person) => arraySumFloat(person->colorScoresGet)
    }
};

[@bs.deriving abstract]
type tieBreakData = {
    func: Js.Dict.t(scoreData) => string => float,
    id: int,
    name: string
};

let tieBreakMethods = [|
    tieBreakData(
        ~func=getMedianScore,
        ~id=0,
        ~name="Median"
    ),
    tieBreakData(
        ~func=getSolkoffScore,
        ~id=1,
        ~name="Solkoff"
    ),
    tieBreakData(
        ~func=getCumulativeScore,
        ~id=2,
        ~name="Cumulative score"
    ),
    tieBreakData(
        ~func=getCumulativeOfOpponentScore,
        ~id=3,
        ~name="Cumulative of opposition"
    ),
    tieBreakData(
        ~func=getColorBalanceScore,
        ~id=4,
        ~name="Most black"
    )
|];

let getNamefromIndex = index => tieBreakMethods[index]->nameGet;
let getTieBreakNames = idList => Js.Array.map(getNamefromIndex, idList);