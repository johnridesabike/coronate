open Belt;
open Data;

let log2 = (num) => log(num) /. log(2.0);
/*
  I'm depreciating `DemoData`, but currently merging it with `TestData` so
  tests can keep working.
 */
open TestData;
let configData = {
  ...config,
  avoidPairs:
    config.avoidPairs |> Js.Array.concat(DemoData.config.avoidPairs),
};
let tournamentData =
  tournaments->Map.String.merge(DemoData.tournaments, (_, _, a) => a);
let playerData = players->Map.String.merge(DemoData.players, (_, _, a) => a);

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount |> float_of_int |> log2 |> ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

open Tournament;
type t = {
  activePlayers: Map.String.t(Player.t),
  getPlayer: string => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Map.String.t(Player.t),
  playersDispatch: TournamentDataReducers.actionPlayer => unit,
  roundCount: int,
  tourney: Tournament.t,
  tourneyDispatch: TournamentDataReducers.actionTournament => unit,
};

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, tourneyDispatch) =
    React.useReducer(
      TournamentDataReducers.tournamentReducer,
      tournamentData->Map.String.getExn(tourneyId),
    );
  let roundList = tourney.roundList;
  let (players, playersDispatch) =
    React.useReducer(
      TournamentDataReducers.playersReducer,
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
        : isRoundComplete(roundList, activePlayers, (roundList |> length) - 1)
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
    tourneyDispatch,
  });
};