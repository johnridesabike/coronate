/*
   The round structure is currently just nested arrays. Because arrays are
   awkward to manipulate, the functions are consolidated here. In the future,
   I may replace the arrays with a different data type, so hopefully it will be
   simple to rewrite this module if necessary (versus rewriting every component).
 */
open Belt;
module Round = {
  type t = array(Data_Match.t);

  let encode = data => data |> Json.Encode.(array(Data_Match.encode));
  let decode = json => json |> Json.Decode.(array(Data_Match.decode));

  let addMatches = (round, matches) => {
    round |> Js.Array.concat(matches);
  };
  /* flatten all of the ids from the matches to one list.*/
  let getMatched = (round: t) => {
    round->Array.reduce([||], (acc, {Data_Match.whiteId, blackId}) =>
      acc->Array.concat([|whiteId, blackId|])
    );
  };
};

type t = array(Round.t);

let encode = data => data |> Json.Encode.(array(Round.encode));
let decode = json => json |> Json.Decode.(array(Round.decode));

let getLastKey = (rounds: t) => Array.length(rounds) - 1;
let get = (rounds: t, key) => rounds->Array.get(key);
let set = (rounds: t, key, round) => {
  rounds->Array.setExn(key, round)
  rounds;
};

/*
 This flattens a list of rounds to a list of matches.
 The optional `lastRound` parameter will slice the rounds to only the last
 index specified. For example: if you just want to see the scores through
 round 2 and not include round 3.
 */
let rounds2Matches = (~roundList: t, ~lastRound=?, ()) => {
  let rounds = {
    switch (lastRound) {
    | None => roundList
    | Some(num) => roundList |> Js.Array.slice(~start=0, ~end_=num + 1)
    };
  };
  rounds
  |> Js.Array.reduce((acc, round) => acc |> Js.Array.concat(round), [||]);
};

let isRoundComplete = (roundList, players, roundId) =>
  switch (roundList->Array.get(roundId)) {
  | Some(round) =>
    /* If it's not the last round, it's complete.*/
    if (roundId < Js.Array.length(roundList) - 1) {
      true;
    } else {
      let matched = Round.getMatched(round);
      let unmatched = players->Map.String.removeMany(matched);
      let results = round |> Js.Array.map(match => match.Data_Match.result);
      Belt.Map.String.size(unmatched) === 0
      && !(results |> Js.Array.includes(Data_Match.Result.NotSet));
    }
  | None => true
  };

let addRound = roundList => roundList |> Js.Array.concat([|[||]|]);

let delLastRound = roundList =>
  roundList |> Js.Array.slice(~start=0, ~end_=-1);