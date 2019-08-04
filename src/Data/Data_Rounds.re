/*
   The round structure is currently just nested arrays. Because arrays are
   awkward to manipulate, the functions are consolidated here. In the future,
   I may replace the arrays with a different data type, so hopefully it will be
   simple to rewrite this module if necessary (versus rewriting every
   component).
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
  let getMatchById = (round: t, id) => round->Array.getBy(x => x.id === id);
  let removeMatchById = (round: t, id) => round->Array.keep(x => x.id !== id);
  let setMatch = (round: t, match) => {
    round
    ->Array.getIndexBy(({id}) => id === match.Data_Match.id)
    ->Option.map(index => round->Array.set(index, match))
    ->Option.flatMap(wasSuccessful => wasSuccessful ? Some(round) : None);
  };
};

type t = array(Round.t);

let encode = data => data |> Json.Encode.(array(Round.encode));
let decode = json => json |> Json.Decode.(array(Round.decode));

let getLastKey = (rounds: t) => Array.length(rounds) - 1;
let get = (rounds: t, key): option(Round.t) => rounds->Array.get(key);
let set = (rounds: t, key, round) => {
  let wasSuccessful = rounds->Array.set(key, round);
  wasSuccessful ? Some(rounds) : None;
};
let setMatch = (rounds: t, key, match): option(t) =>
  rounds
  ->get(key)
  ->Option.flatMap(__x => Round.setMatch(__x, match))
  ->Option.flatMap(set(rounds, key));

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

let addRound = (roundList: t): t => roundList |> Js.Array.concat([|[||]|]);

let delLastRound = (roundList: t): t =>
  roundList |> Js.Array.slice(~start=0, ~end_=-1);

let updateByeScores = (rounds: t, newValue): t =>
  rounds |> Js.Array.map(Js.Array.map(Data_Match.scoreByeMatch(newValue)));