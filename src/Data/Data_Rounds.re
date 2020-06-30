/**
 * The round structure is currently just nested arrays. Because arrays are
 * awkward to manipulate, the functions are consolidated here. In the future,
 * I may replace the arrays with a different data type, so hopefully it will be
 * simple to rewrite this module if necessary (versus rewriting every
 * component).
 */
open Belt;
module Match = Data_Match;
module Id = Data_Id;

module Round = {
  type t = array(Match.t);

  let fromArray = x => x;

  let toArray = x => x;

  let empty: t = [||];

  let encode = Json.Encode.array(Match.encode);

  let decode = Json.Decode.array(Match.decode);

  let size = Js.Array2.length;

  let addMatches = Array.concat;

  /* flatten all of the ids from the matches to one array.*/
  let getMatched = round =>
    Array.reduce(round, [||], (acc, Match.{whiteId, blackId, _}) =>
      Array.concat(acc, [|whiteId, blackId|])
    );

  let getMatchById = (round: t, id) =>
    Array.getBy(round, x => Id.eq(x.Match.id, id));

  let removeMatchById = (round: t, id) =>
    Array.keep(round, x => !Id.eq(x.Match.id, id));

  let setMatch = (round: t, match) => {
    let round = Array.copy(round);
    round
    ->Array.getIndexBy((Match.{id, _}) => Id.eq(id, match.Match.id))
    ->Option.map(x => round[x] = match)
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

let fromArray = x => x;

let toArray = x => x;

let empty: t = [|[||]|];

let encode = Json.Encode.array(Round.encode);

let decode = Json.Decode.array(Round.decode);

let size = Js.Array2.length;

let getLastKey = rounds => Array.length(rounds) - 1;

let get = Array.get;

let set = (rounds, key, round) => {
  let rounds = Array.copy(rounds);
  let wasSuccessful = rounds[key] = round;
  wasSuccessful ? Some(rounds) : None;
};

let setMatch = (rounds, key, match) =>
  rounds
  ->get(key)
  ->Option.flatMap(Round.setMatch(_, match))
  ->Option.flatMap(set(rounds, key));

let rounds2Matches = roundList => Array.reduce(roundList, [||], Array.concat);

/*
 let rounds2Matches = (roundList, ~lastRound=?, ()) => {
   let rounds =
     switch (lastRound) {
     | None => roundList
     | Some(num) => Array.slice(roundList, ~offset=0, ~len=num + 1)
     };
   Array.reduce(rounds, [||], Array.concat);
 };
 */

let isRoundComplete = (roundList, players, roundId) =>
  switch (roundList[roundId]) {
  | Some(round) =>
    /* If it's not the last round, it's complete.*/
    if (roundId < Array.size(roundList) - 1) {
      true;
    } else {
      let matched = Round.getMatched(round);
      let unmatched = Map.removeMany(players, matched);
      let results = Array.map(round, match => match.Match.result);
      Map.size(unmatched) == 0
      && !Js.Array2.includes(results, Match.Result.NotSet);
    }
  | None => true
  };

let addRound = roundList => Array.concat(roundList, [|[||]|]);

let delLastRound = roundList =>
  Js.Array2.slice(roundList, ~start=0, ~end_=-1);

let updateByeScores = (rounds, byeValue) =>
  Array.map(rounds, Array.map(_, Match.scoreByeMatch(~byeValue)));
