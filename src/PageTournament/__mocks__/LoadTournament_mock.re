open Belt;
open Data;

let log2 = num => log(num) /. log(2.0);
/*
  I'm depreciating `DemoData`, but currently merging it with `TestData` so
  tests can keep working.
 */
open TestData;
let configData = {
  ...config,
  avoidPairs:
    config.avoidPairs->Set.mergeMany(DemoData.config.avoidPairs->Set.toArray),
};
let tournamentData =
  tournaments->Map.String.merge(DemoData.tournaments, (_, _, a) => a);
let playerData = players->Map.String.merge(DemoData.players, (_, _, a) => a);

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount |> float_of_int |> log2 |> ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

let tournamentReducer = (_, action) => action;

type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: Db.action(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
};

type loadStatus =
  | NotLoaded
  | Loaded
  | Error;

let isLoadedDone = status =>
  switch (status) {
  | NotLoaded => false
  | Loaded
  | Error => true
  };

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, setTourney) =
    React.useReducer(
      tournamentReducer,
      tournamentData->Map.String.getExn(tourneyId),
    );
  let {Tournament.playerIds, roundList} = tourney;
  let (players, playersDispatch, _) = Db.useAllPlayers();
  /* `activePlayers` is only players to be matched in future matches. */
  let activePlayers =
    players->Map.String.keep((id, _) => playerIds->List.has(id, (===)));
  let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
  let isItOver = Array.length(roundList) >= roundCount;
  let isNewRoundReady =
    Js.Array.(
      length(roundList) === 0
        ? true
        : Rounds.isRoundComplete(
            roundList,
            activePlayers,
            length(roundList) - 1,
          )
    );
  children({
    activePlayers,
    getPlayer: Player.getPlayerMaybe(players),
    isItOver,
    isNewRoundReady,
    players,
    playersDispatch,
    roundCount,
    tourney,
    setTourney,
  });
};