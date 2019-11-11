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
  external fromArray: array(Data_Match.t) => t = "%identity";
  external toArray: t => array(Data_Match.t) = "%identity";
  let empty = [||];

  let encode = Json.Encode.array(Data_Match.encode);
  let decode = Json.Decode.array(Data_Match.decode);

  let size = Js.Array2.length;

  let addMatches = Array.concat;
  /* flatten all of the ids from the matches to one list.*/
  let getMatched = (round: t) => {
    Array.reduce(round, [||], (acc, {Data_Match.whiteId, blackId}) =>
      Array.concat(acc, [|whiteId, blackId|])
    );
  };
  let getMatchById = (round: t, id) => Array.getBy(round, x => x.id === id);
  let removeMatchById = (round: t, id) => Array.keep(round, x => x.id !== id);
  let setMatch = (round: t, match) => {
    round
    ->Array.getIndexBy(({id}) => id === match.Data_Match.id)
    ->Option.map(__x => round[__x] = match)
    ->Option.flatMap(wasSuccessful => wasSuccessful ? Some(round) : None);
  };

  let moveMatch = (round, matchId, direction) => {
    switch (getMatchById(round, matchId)) {
    | None => None
    | Some(match) =>
      let oldIndex = Js.Array2.indexOf(round, match);
      let newIndex = oldIndex + direction >= 0 ? oldIndex + direction : 0;
      Some(Utils.Array.swap(round, oldIndex, newIndex));
    };
  };
};

type t = array(Round.t);

external fromArray: array(Round.t) => t = "%identity";
external toArray: t => array(Round.t) = "%identity";
let empty: t = [|[||]|];

let encode = Json.Encode.array(Round.encode);
let decode = Json.Decode.array(Round.decode);

let size = Js.Array2.length;

let getLastKey = (rounds: t) => Array.length(rounds) - 1;
let get = (rounds, id) => rounds[id];
let set = (rounds: t, key, round) => {
  let wasSuccessful = rounds[key] = round;
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
let rounds2Matches = (roundList: t, ~lastRound=?, ()) => {
  let rounds = {
    switch (lastRound) {
    | None => roundList
    | Some(num) => Array.slice(roundList, ~offset=0, ~len=num + 1)
    };
  };
  Array.reduce(rounds, [||], Array.concat);
};

let isRoundComplete = (roundList, players, roundId) =>
  switch (roundList[roundId]) {
  | Some(round) =>
    /* If it's not the last round, it's complete.*/
    if (roundId < Array.size(roundList) - 1) {
      true;
    } else {
      let matched = Round.getMatched(round);
      let unmatched = Map.String.removeMany(players, matched);
      let results = Array.map(round, match => match.Data_Match.result);
      Belt.Map.String.size(unmatched) === 0
      && !Js.Array2.includes(results, Data_Match.Result.NotSet);
    }
  | None => true
  };

let addRound = (roundList: t): t => Array.concat(roundList, [|[||]|]);

let delLastRound = (roundList: t): t =>
  Js.Array2.slice(roundList, ~start=0, ~end_=-1);

let updateByeScores = (rounds: t, newValue): t =>
  Array.map(rounds, Array.map(_, Data_Match.scoreByeMatch(_, newValue)));