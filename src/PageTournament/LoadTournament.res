/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open! Belt
open Data
module Id = Data.Id

// Removed calcNumOfRounds function - now using tournament.totalRounds instead

let emptyTourney = Tournament.make(~id=Id.random(), ~name="")

let tournamentReducer = (_, action) => action

type t = {
  activePlayers: Id.Map.t<Player.t>,
  getPlayer: Id.t => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Id.Map.t<Player.t>,
  playersDispatch: Db.action<Player.t> => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
}

type loadStatus = NotLoaded | Loaded | Error

let isLoadedDone = x =>
  switch x {
  | NotLoaded => false
  | Loaded | Error => true
  }

@react.component
let make = (~children, ~tourneyId, ~windowDispatch) => {
  let tourneyId = Id.toString(tourneyId)
  let (tourney, setTourney) = React.useReducer(tournamentReducer, emptyTourney)
  let {name, playerIds, roundList, totalRounds, _} = tourney
  let {items: players, dispatch: playersDispatch, loaded: arePlayersLoaded} = Db.useAllPlayers()
  let (tourneyLoaded, setTourneyLoaded) = React.useState(() => NotLoaded)
  Hooks.useLoadingCursorUntil(isLoadedDone(tourneyLoaded) && arePlayersLoaded)

  let actualWindowDispatch = switch windowDispatch {
  | Some(dispatch) => dispatch
  | None => _ => ()
  }
  React.useEffect2(() => {
    actualWindowDispatch(Window.SetTitle(name))
    Some(() => actualWindowDispatch(SetTitle("")))
  }, (name, actualWindowDispatch))

  /* Initialize the tournament from the database. */
  React.useEffect1(() => {
    let didCancel = ref(false)
    Db.tournaments
    ->LocalForage.Map.getItem(~key=tourneyId)
    ->Promise.thenResolve(value =>
      switch value {
      | _ if didCancel.contents => ()
      | None => setTourneyLoaded(_ => Error)
      | Some(value) =>
        setTourney(value)
        setTourneyLoaded(_ => Loaded)
      }
    )
    ->Promise.catch(_ => {
      if !didCancel.contents {
        setTourneyLoaded(_ => Error)
      }
      Promise.resolve()
    })
    ->ignore
    Some(() => didCancel := true)
  }, [tourneyId])

  /* Save the tournament to DB. */
  React.useEffect3(() => {
    switch tourneyLoaded {
    | NotLoaded | Error => ()
    | Loaded =>
      /*
       * If the tournament wasn't loaded then the id won't match. IDK why this
       * is necessary. If you remove this and someone enters the URL for a
       * nonexistant tournament, then you can corrupt the database.
       */
      if Id.eq(Id.fromString(tourneyId), tourney.id) {
        Db.tournaments->LocalForage.Map.setItem(~key=tourneyId, ~v=tourney)->ignore
      }
    }
    None
  }, (tourneyLoaded, tourneyId, tourney))
  switch (tourneyLoaded, arePlayersLoaded) {
  | (Loaded, true) =>
    /* `activePlayers` is only players to be matched in future matches. */
    let activePlayers = Map.keep(players, (id, _) => Set.has(playerIds, id))
    let roundCount = totalRounds
    let isItOver = Rounds.size(roundList) >= roundCount
    let isNewRoundReady =
      Rounds.size(roundList) == 0
        ? true
        : Rounds.isRoundComplete(roundList, activePlayers, Rounds.size(roundList) - 1)
    children({
      activePlayers,
      getPlayer: Player.getMaybe(players, ...),
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      setTourney,
    })
  | (Error, _) =>
    <Window.Body windowDispatch={actualWindowDispatch}>
      {React.string("Error: tournament couldn't be loaded.")}
    </Window.Body>
  | (NotLoaded, false) | (NotLoaded, true) | (Loaded, false) =>
    <Window.Body windowDispatch={actualWindowDispatch}> {React.string("Loading...")} </Window.Body>
  }
}
