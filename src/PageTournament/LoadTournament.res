open Belt
open Data
module Id = Data.Id

let log2 = num => log(num) /. log(2.0)

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil
  roundCount != neg_infinity ? int_of_float(roundCount) : 0
}

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

type loadStatus =
  | NotLoaded
  | Loaded
  | Error

let isLoadedDone = x =>
  switch x {
  | NotLoaded => false
  | Loaded
  | Error => true
  }

@react.component
let make = (~children, ~tourneyId, ~windowDispatch=_ => ()) => {
  let tourneyId = Id.toString(tourneyId)
  let (tourney, setTourney) = React.useReducer(tournamentReducer, emptyTourney)
  let {name, playerIds, roundList, _} = tourney
  let {items: players, dispatch: playersDispatch, loaded: arePlayersLoaded} = Db.useAllPlayers()
  let (tourneyLoaded, setTourneyLoaded) = React.useState(() => NotLoaded)
  Hooks.useLoadingCursorUntil(isLoadedDone(tourneyLoaded) && arePlayersLoaded)

  React.useEffect2(() => {
    windowDispatch(Window.SetTitle(name))
    Some(() => windowDispatch(Window.SetTitle("")))
  }, (name, windowDispatch))

  /* Initialize the tournament from the database. */
  React.useEffect1(() => {
    let didCancel = ref(false)
    Db.tournaments
    ->LocalForage.Map.getItem(~key=tourneyId)
    ->Promise.Js.fromBsPromise
    ->Promise.Js.toResult
    ->Promise.tapOk(value =>
      switch value {
      | _ if didCancel.contents => ()
      | None => setTourneyLoaded(_ => Error)
      | Some(value) =>
        setTourney(value)
        setTourneyLoaded(_ => Loaded)
      }
    )
    ->Promise.getError(_ =>
      if !didCancel.contents {
        setTourneyLoaded(_ => Error)
      }
    )
    Some(() => didCancel := true)
  }, [tourneyId])

  /* Save the tournament to DB. */
  React.useEffect3(() => {
    switch tourneyLoaded {
    | NotLoaded
    | Error => ()
    | Loaded =>
      /*
       * If the tournament wasn't loaded then the id won't match. IDK why this
       * is necessary. If you remove this and someone enters the URL for a
       * nonexistant tournament, then you can corrupt the database.
       */
      if Id.eq(Id.fromString(tourneyId), tourney.Tournament.id) {
        Db.tournaments->LocalForage.Map.setItem(~key=tourneyId, ~v=tourney)->ignore
      }
    }
    None
  }, (tourneyLoaded, tourneyId, tourney))
  switch (tourneyLoaded, arePlayersLoaded) {
  | (Loaded, true) =>
    /* `activePlayers` is only players to be matched in future matches. */
    let activePlayers = players->Map.keep((id, _) => playerIds->List.has(id, Id.eq))
    let roundCount = activePlayers->Map.size->calcNumOfRounds
    let isItOver = Rounds.size(roundList) >= roundCount
    let isNewRoundReady =
      Rounds.size(roundList) == 0
        ? true
        : Rounds.isRoundComplete(roundList, activePlayers, Rounds.size(roundList) - 1)
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
  | (Error, _) =>
    <Window.Body> {React.string("Error: tournament couldn't be loaded.")} </Window.Body>
  | (NotLoaded, false)
  | (NotLoaded, true)
  | (Loaded, false) =>
    <Window.Body> {React.string("Loading...")} </Window.Body>
  }
}

type roundData = {
  activePlayersCount: int,
  scoreData: Id.Map.t<Scoring.t>,
  unmatched: Id.Map.t<Data.Player.t>,
  unmatchedCount: int,
  unmatchedWithDummy: Id.Map.t<Data.Player.t>,
}

let useRoundData = (roundId, {tourney: {roundList, scoreAdjustments, _}, activePlayers, _}) => {
  /* tournament2ScoreData is relatively expensive */
  let scoreData = React.useMemo2(
    () => Converters.tournament2ScoreData(~roundList, ~scoreAdjustments),
    (roundList, scoreAdjustments),
  )
  /* Only calculate unmatched players for the latest round. Old rounds
     don't get to add new players.
     Should this be memoized? */
  let isThisTheLastRound = roundId == Rounds.getLastKey(roundList)
  let unmatched = switch (Rounds.get(roundList, roundId), isThisTheLastRound) {
  | (Some(round), true) =>
    let matched = Rounds.Round.getMatched(round)
    Map.removeMany(activePlayers, matched)
  | _ => Id.Map.make()
  }
  let unmatchedCount = Map.size(unmatched)
  /* make a new list so as not to affect auto-pairing */
  let unmatchedWithDummy =
    mod(unmatchedCount, 2) != 0 ? Map.set(unmatched, Id.dummy, Player.dummy) : unmatched
  let activePlayersCount = Map.size(activePlayers)
  {
    activePlayersCount: activePlayersCount,
    scoreData: scoreData,
    unmatched: unmatched,
    unmatchedCount: unmatchedCount,
    unmatchedWithDummy: unmatchedWithDummy,
  }
}
