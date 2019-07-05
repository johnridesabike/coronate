// In JS these should serve as indices in tuples.
[@bs.deriving jsConverter]
type color =
  | [@bs.as 0] White
  | [@bs.as 1] Black;

// TODO: temporary until JS conversion is complete
let white = 0;
let black = 1;

let win = 1.0;
let loss = 0.0;
let draw = 0.5;

// This is used in by matches to indicate a dummy player. The
// `getPlayerMaybe()` method returns a special dummy player profile when
// fetching this ID.
// This ID conforms to the NanoID regex.
let dummy_id = "________DUMMY________";
type id = string;

let isNanoId = str => str |> Js.Re.test_([%re "/^[A-Za-z0-9_-]{21}$/"]);

type avoidPair = (id, id);

[@bs.deriving jsConverter]
type player = {
  firstName: string,
  id,
  lastName: string,
  matchCount: int,
  rating: int,
  type_: string // used for CSS styling etc
};

type matchRatings = {
  whiteRating: int,
  blackRating: int,
};

type matchScores = {
  whiteScore: float,
  blackScore: float,
};

type matchStatId = {
  whiteId: id,
  blackId: id,
};

[@bs.deriving jsConverter]
type match = {
  id,
  newRating: matchRatings,
  origRating: matchRatings,
  playerIds: matchStatId,
  result: matchScores,
};

type roundList = array(array(match));

[@bs.deriving jsConverter]
type tournament = {
  byeQueue: array(id),
  date: Js.Date.t,
  id,
  name: string,
  playerIds: array(id),
  roundList,
  tieBreaks: array(int),
};

type db_options = {
  avoidPairs: array(avoidPair),
  byeValue: float,
  lastBackup: Js.Date.t,
};
type db_tourneys = Js.Dict.t(tournament);
type db_players = Js.Dict.t(player);

type db =
  | Tourneys(db_tourneys)
  | Players(db_players)
  | Options(db_options);

/*
 Helpers
 */

/*******************************************************************************
 * Player functions
 ******************************************************************************/
// These are useful for passing to `filter()` methods.
let isDummyId = playerId => playerId == dummy_id;

// This is the dummy profile that `getPlayerMaybe()` returns for bye rounds.
let dummyPlayer = {
  id: dummy_id,
  firstName: "Bye",
  lastName: "Player",
  type_: "dummy",
  matchCount: 0,
  rating: 0,
};

// If `getPlayerMaybe()` can't find a profile (e.g. if it was deleted) then it
// outputs this instead. The ID will be the same as missing player's ID.
let makeMissingPlayer = id => {
  id,
  firstName: "Anonymous",
  lastName: "Player",
  type_: "missing",
  matchCount: 0,
  rating: 0,
};

// This function should always be used in components that *might* not be able to
// display current player information. This includes bye rounds with "dummy"
// players, or scoreboards where a player may have been deleted.
let getPlayerMaybe = (playerDict, id) => {
  id === dummy_id
    ? dummyPlayer
    : {
      switch (playerDict->Js.Dict.get(id)) {
      | None => makeMissingPlayer(id)
      | Some(player) => player
      };
    };
};

/*******************************************************************************
 * Round functions
 ******************************************************************************/

// This flattens a list of rounds to a list of matches.
// The optional `lastRound` parameter will slice the rounds to only the last
// index specified. For example: if you just want to see the scores through
// round 2 and not include round 3.
let rounds2Matches = (~roundList: roundList, ~lastRound=?, ()) => {
  let rounds = {
    switch (lastRound) {
    | None => roundList
    | Some(num) => roundList->Js.Array.slice(~start=0, ~end_=num + 1)
    };
  };
  rounds
  |> Js.Array.reduce((acc, round) => acc |> Js.Array.concat(round), [||]);
};

// This creates a filtered version of `players` with only the players that are
// not matched for the specified round.
let getUnmatched = (roundList, players, roundId) => {
  let matchList = {
    switch (roundList->Belt.Array.get(roundId)) {
    | None => [||]
    | Some(round) => round
    };
  };
  // flatten all of the ids from the matches to one list.
  let matchedIds =
    matchList
    |> Js.Array.reduce(
         (acc, match: match) =>
           acc
           |> Js.Array.concat([|
                match.playerIds.whiteId,
                match.playerIds.blackId,
              |]),
         [||],
       );
  let unmatched = Js.Dict.empty();
  Js.Dict.values(players)
  |> Js.Array.forEach(player =>
       if (!(matchedIds |> Js.Array.includes(player.id))) {
         unmatched->Js.Dict.set(player.id, player);
       }
     );
  unmatched;
};

let isRoundComplete = (roundList, players, roundId) => {
  roundId < Js.Array.length(roundList) - 1
    // If it's not the last round, it's complete.
    ? true
    : {
      let unmatched = getUnmatched(roundList, players, roundId);
      let results =
        roundList[roundId]
        |> Js.Array.map(match =>
             match.result.whiteScore +. match.result.blackScore
           );
      Js.Dict.keys(unmatched)
      |> Js.Array.length == 0
      && !(results |> Js.Array.includes(0.0));
    };
};