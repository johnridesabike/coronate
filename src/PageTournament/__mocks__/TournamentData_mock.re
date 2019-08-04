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

open Tournament;
let tournamentReducer = (_, action) => action;

type action('a) =
  | Set(string, 'a)
  | Del(string)
  | SetAll(Map.String.t('a));

let playersReducer = (state, action) => {
  Map.String.(
    switch (action) {
    | Set(id, player) => state->set(id, player)
    /*You should delete all avoid-pairs with the id too.*/
    | Del(id) => state->remove(id)
    | SetAll(state) => state
    }
  );
};

type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: action(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
};

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, setTourney) =
    React.useReducer(
      tournamentReducer,
      tournamentData->Map.String.getExn(tourneyId),
    );
  let roundList = tourney.roundList;
  let (players, playersDispatch) =
    React.useReducer(
      playersReducer,
      playerData->Map.String.keep((id, _) =>
        tourney.playerIds |> Js.Array.includes(id)
      ),
    );
  let getPlayer = Player.getPlayerMaybe(players);
  /* `players` includes players in past matches who may have left
     `activePlayers` is only players to be matched in future matches. */
  let activePlayers =
    Map.String.(
      players->reduce(empty, (acc, key, player) =>
        if (tourney.playerIds |> Js.Array.includes(key)) {
          acc->set(key, player);
        } else {
          acc;
        }
      )
    );

  let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
  let isItOver = roundList |> Array.length >= roundCount;
  let isNewRoundReady =
    Js.Array.(
      roundList |> length === 0
        ? true
        : Data.Rounds.isRoundComplete(
            roundList,
            activePlayers,
            (roundList |> length) - 1,
          )
    );
  children({
    activePlayers,
    getPlayer,
    isItOver,
    isNewRoundReady,
    players,
    playersDispatch,
    roundCount,
    tourney,
    setTourney,
  });
};