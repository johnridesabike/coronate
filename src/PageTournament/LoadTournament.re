open Belt;
open Data;

let log2 = num => log(num) /. log(2.0);

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

let emptyTourney = Tournament.make(~id=Data.Id.random(), ~name="");

let tournamentReducer = (_, action) => action;

type t = {
  activePlayers: Data.Id.Map.t(Player.t),
  getPlayer: Data.Id.t => Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Data.Id.Map.t(Player.t),
  playersDispatch: Db.action(Player.t) => unit,
  roundCount: int,
  tourney: Tournament.t,
  setTourney: Tournament.t => unit,
};

type loadStatus =
  | NotLoaded
  | Loaded
  | Error;

let isLoadedDone =
  fun
  | NotLoaded => false
  | Loaded
  | Error => true;

[@react.component]
let make = (~children, ~tourneyId, ~windowDispatch=_ => ()) => {
  let tourneyId = Data.Id.toString(tourneyId);
  let (tourney, setTourney) =
    React.useReducer(tournamentReducer, emptyTourney);
  let Tournament.{name, playerIds, roundList, _} = tourney;
  let Db.{items: players, dispatch: playersDispatch, loaded: arePlayersLoaded} =
    Db.useAllPlayers();
  let (tourneyLoaded, setTourneyLoaded) = React.useState(() => NotLoaded);
  Hooks.useLoadingCursorUntil(
    isLoadedDone(tourneyLoaded) && arePlayersLoaded,
  );
  /**
   * Set the document title.
   */
  React.useEffect2(
    () => {
      windowDispatch(Window.SetTitle(name));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    (name, windowDispatch),
  );
  /**
   * Initialize the tournament from the database.
   */
  React.useEffect1(
    () => {
      let didCancel = ref(false);
      Db.tournaments
      ->LocalForage.Map.getItem(~key=tourneyId)
      ->Promise.Js.fromBsPromise
      ->Promise.Js.toResult
      ->Promise.tapOk(value =>
          switch (value) {
          | _ when didCancel^ => ()
          | None => setTourneyLoaded(_ => Error)
          | Some(value) =>
            setTourney(value);
            setTourneyLoaded(_ => Loaded);
          }
        )
      ->Promise.getError(_ =>
          if (! didCancel^) {
            setTourneyLoaded(_ => Error);
          }
        );
      Some(() => didCancel := true);
    },
    [|tourneyId|],
  );
  /**
   * Save the tournament to DB.
   */
  React.useEffect3(
    () => {
      switch (tourneyLoaded) {
      | NotLoaded
      | Error => ()
      | Loaded =>
        /*
         * If the tournament wasn't loaded then the id won't match. IDK why this
         * is necessary. If you remove this and someone enters the URL for a
         * nonexistant tournament, then you can corrupt the database.
         */
        if (Data.Id.fromString(tourneyId) === tourney.Tournament.id) {
          Db.tournaments
          ->LocalForage.Map.setItem(~key=tourneyId, ~v=tourney)
          ->ignore;
        }
      };
      None;
    },
    (tourneyLoaded, tourneyId, tourney),
  );
  switch (tourneyLoaded, arePlayersLoaded) {
  | (Loaded, true) =>
    /* `activePlayers` is only players to be matched in future matches. */
    let activePlayers =
      players->Map.keep((id, _) => playerIds->List.has(id, (===)));
    let roundCount = activePlayers->Map.size->calcNumOfRounds;
    let isItOver = Rounds.size(roundList) >= roundCount;
    let isNewRoundReady =
      Rounds.size(roundList) === 0
        ? true
        : Rounds.isRoundComplete(
            roundList,
            activePlayers,
            Rounds.size(roundList) - 1,
          );
    children({
      activePlayers,
      getPlayer: Player.getMaybe(players),
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      setTourney,
    });
  | (Error, _) =>
    <Window.Body>
      {React.string("Error: tournament couldn't be loaded.")}
    </Window.Body>
  | (NotLoaded, false)
  | (NotLoaded, true)
  | (Loaded, false) =>
    <Window.Body> {React.string("Loading...")} </Window.Body>
  };
};

type roundData = {
  activePlayersCount: int,
  scoreData: Data.Id.Map.t(Scoring.t),
  unmatched: Data.Id.Map.t(Data.Player.t),
  unmatchedCount: int,
  unmatchedWithDummy: Data.Id.Map.t(Data.Player.t),
};

let useRoundData =
    (roundId, {tourney: {roundList, scoreAdjustments, _}, activePlayers, _}) => {
  /* tournament2ScoreData is relatively expensive*/
  let scoreData =
    React.useMemo2(
      () => Converters.tournament2ScoreData(~roundList, ~scoreAdjustments),
      (roundList, scoreAdjustments),
    );
  /* Only calculate unmatched players for the latest round. Old rounds
     don't get to add new players.
     Should this be memoized? */
  let isThisTheLastRound = roundId == Rounds.getLastKey(roundList);
  let unmatched =
    switch (Rounds.get(roundList, roundId), isThisTheLastRound) {
    | (Some(round), true) =>
      let matched = Rounds.Round.getMatched(round);
      Map.removeMany(activePlayers, matched);
    | _ => Data.Id.Map.make()
    };
  let unmatchedCount = Map.size(unmatched);
  /* make a new list so as not to affect auto-pairing*/
  let unmatchedWithDummy =
    unmatchedCount mod 2 != 0
      ? Map.set(unmatched, Data.Id.dummy, Player.dummy) : unmatched;
  let activePlayersCount = Map.size(activePlayers);
  {
    activePlayersCount,
    scoreData,
    unmatched,
    unmatchedCount,
    unmatchedWithDummy,
  };
};
