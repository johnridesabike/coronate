/**
 * The round structure is currently just nested arrays. Because arrays are
 * awkward to manipulate, the functions are consolidated here. In the future,
 * I may replace the arrays with a different data type, so hopefully it will be
 * simple to rewrite this module if necessary (versus rewriting every
 * component).
 */
open Belt;

module Round = {
  type t = array(Data_Match.t);

  let fromArray = x => x;

  let toArray = x => x;

  let empty: t = [||];

  let encode = Json.Encode.array(Data_Match.encode);

  let decode = Json.Decode.array(Data_Match.decode);

  let size = Js.Array2.length;

  let addMatches = Array.concat;

  /* flatten all of the ids from the matches to one array.*/
  let getMatched = round =>
    Array.reduce(round, [||], (acc, Data_Match.{whiteId, blackId, _}) =>
      Array.concat(acc, [|whiteId, blackId|])
    );

  let getMatchById = (round: t, id) =>
    Array.getBy(round, x => x.Data_Match.id === id);

  let removeMatchById = (round: t, id) =>
    Array.keep(round, x => x.Data_Match.id !== id);

  let setMatch = (round: t, match) => {
    round
    ->Array.getIndexBy((Data_Match.{id, _}) => id === match.Data_Match.id)
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
  let wasSuccessful = rounds[key] = round;
  wasSuccessful ? Some(rounds) : None;
};

let setMatch = (rounds, key, match) =>
  rounds
  ->get(key)
  ->Option.flatMap(Round.setMatch(_, match))
  ->Option.flatMap(set(rounds, key));

let rounds2Matches = (roundList, ~lastRound=?, ()) => {
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
      let unmatched = Map.removeMany(players, matched);
      let results = Array.map(round, match => match.Data_Match.result);
      Map.size(unmatched) === 0
      && !Js.Array2.includes(results, Data_Match.Result.NotSet);
    }
  | None => true
  };

let addRound = roundList => Array.concat(roundList, [|[||]|]);

let delLastRound = roundList =>
  Js.Array2.slice(roundList, ~start=0, ~end_=-1);

let updateByeScores = (rounds, byeValue) =>
  Array.map(rounds, Array.map(_, Data_Match.scoreByeMatch(~byeValue)));
