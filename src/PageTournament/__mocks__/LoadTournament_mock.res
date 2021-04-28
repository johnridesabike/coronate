/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Data

let log2 = num => log(num) /. log(2.0)

let tournamentData = TestData.tournaments

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil
  roundCount != neg_infinity ? int_of_float(roundCount) : 0
}

let tournamentReducer = (_, action) => action

type t = LoadTournament.t = {
  activePlayers: Data.Id.Map.t<Data.Player.t>,
  getPlayer: Data.Id.t => Data.Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Data.Id.Map.t<Data.Player.t>,
  playersDispatch: Db.action<Data.Player.t> => unit,
  roundCount: int,
  tourney: Data.Tournament.t,
  setTourney: Data.Tournament.t => unit,
}

@react.component
let make = (~children, ~tourneyId, ~windowDispatch as _=?) => {
  let (tourney, setTourney) = React.useReducer(
    tournamentReducer,
    Map.getExn(tournamentData, tourneyId),
  )
  let {playerIds, roundList, _} = tourney
  let {items: players, dispatch: playersDispatch, _} = Db.useAllPlayers()
  /* `activePlayers` is only players to be matched in future matches. */
  let activePlayers = players->Map.keep((id, _) => Set.has(playerIds, id))
  let roundCount = activePlayers->Map.size->calcNumOfRounds
  let isItOver = Data.Rounds.size(roundList) >= roundCount
  let isNewRoundReady =
    Data.Rounds.size(roundList) == 0
      ? true
      : Rounds.isRoundComplete(roundList, activePlayers, Data.Rounds.size(roundList) - 1)

  children({
    activePlayers: activePlayers,
    getPlayer: Player.getMaybe(players),
    isItOver: isItOver,
    isNewRoundReady: isNewRoundReady,
    players: players,
    playersDispatch: playersDispatch,
    roundCount: roundCount,
    tourney: tourney,
    setTourney: setTourney,
  })
}
