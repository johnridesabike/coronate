open Data;
open Belt;
open Tournament;

let log2 = num => log(num) /. log(2.0);

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

let emptyTourney = {
  name: "",
  playerIds: [],
  roundList: Rounds.empty,
  date: Js.Date.fromFloat(0.0),
  id: Utils.nanoid(),
  tieBreaks: [|Scoring.Median|],
  byeQueue: [||],
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
let make = (~children, ~tourneyId, ~windowDispatch) => {
  let (tourney, setTourney) =
    React.useReducer(tournamentReducer, emptyTourney);
  let {Tournament.name, playerIds, roundList, _} = tourney;
  let (players, playersDispatch, arePlayersLoaded) = Db.useAllPlayers();
  let (tourneyLoaded, setTourneyLoaded) = React.useState(() => NotLoaded);
  Hooks.useLoadingCursorUntil(
    isLoadedDone(tourneyLoaded) && arePlayersLoaded,
  );
  /*
   Set the document title.
   */
  React.useEffect2(
    () => {
      windowDispatch(Window.SetTitle(name));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    (name, windowDispatch),
  );
  /*
   Initialize the tournament from the database.
   */
  React.useEffect1(
    () => {
      let didCancel = ref(false);
      Db.tournaments
      ->LocalForage.Map.getItem(~key=tourneyId)
      ->Db.futureFromPromise
      ->Future.tapOk(value =>
          switch (value) {
          | _ when didCancel^ => ()
          | None => setTourneyLoaded(_ => Error)
          | Some(value) =>
            setTourney(value);
            setTourneyLoaded(_ => Loaded);
          }
        )
      ->Future.tapError(_ =>
          if (! didCancel^) {
            setTourneyLoaded(_ => Error);
          }
        )
      ->ignore;
      Some(() => didCancel := true);
    },
    [|tourneyId|],
  );
  /*
   Save tourney to DB.
   */
  React.useEffect3(
    () => {
      switch (tourneyLoaded) {
      | NotLoaded
      | Error => ()
      | Loaded =>
        /*
           If the tournament wasn't loaded then the id won't match. IDK if this
           is really necessary. At some point it fixed a weird bug.
         */
        // if (tourneyId === tourney.id) {
        Db.tournaments
        ->LocalForage.Map.setItem(~key=tourneyId, ~v=tourney)
        ->ignore
      // }
      };
      None;
    },
    (tourneyLoaded, tourneyId, tourney),
  );
  switch (tourneyLoaded, arePlayersLoaded) {
  | (Loaded, true) =>
    /* `activePlayers` is only players to be matched in future matches. */
    let activePlayers =
      players->Map.String.keep((id, _) => playerIds->List.has(id, (===)));
    let roundCount = activePlayers->Map.String.size->calcNumOfRounds;
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
      getPlayer: Player.getPlayerMaybe(players),
      isItOver,
      isNewRoundReady,
      players,
      playersDispatch,
      roundCount,
      tourney,
      setTourney,
    });
  | (Error, _) =>
    [%debugger];
    <Window.Body>
      {React.string("Error: tournament couldn't be loaded.")}
    </Window.Body>;
  | (NotLoaded, true)
  | (Loaded, false)
  | (NotLoaded, false) =>
    <Window.Body> {React.string("Loading...")} </Window.Body>
  };
};

/* I extracted this logic to its own module so it could be easily
   reused (e.g. in testing). It may have also made the whole component tree more
   complicated. */
type roundData = {
  activePlayersCount: int,
  scoreData: Map.String.t(Scoring.t),
  unmatched: Map.String.t(Data.Player.t),
  unmatchedCount: int,
  unmatchedWithDummy: Map.String.t(Data.Player.t),
};
let useRoundData = (roundId: int, tournament: t) => {
  let {tourney, activePlayers, getPlayer, _} = tournament;
  let {Tournament.roundList, _} = tourney;
  /* matches2ScoreData is relatively expensive*/
  let scoreData =
    React.useMemo1(
      () =>
        Converters.matches2ScoreData(Rounds.rounds2Matches(roundList, ())),
      [|roundList|],
    );
  /* Only calculate unmatched players for the latest round. Old rounds
     don't get to add new players.
     Should this be memoized? */
  let round = Rounds.get(roundList, roundId);
  let isThisTheLastRound = roundId === Rounds.getLastKey(roundList);
  let unmatched =
    switch (round, isThisTheLastRound) {
    | (Some(round), true) =>
      let matched = Rounds.Round.getMatched(round);
      Map.String.removeMany(activePlayers, matched);
    | (None, _)
    | (Some(_), false) => Map.String.empty
    };
  let unmatchedCount = Map.String.size(unmatched);
  /* make a new list so as not to affect auto-pairing*/
  let unmatchedWithDummy =
    unmatchedCount mod 2 !== 0
      ? Map.String.set(
          unmatched,
          Player.dummy_id,
          getPlayer(Player.dummy_id),
        )
      : unmatched;
  let activePlayersCount = Map.String.size(activePlayers);
  {
    activePlayersCount,
    scoreData,
    unmatched,
    unmatchedCount,
    unmatchedWithDummy,
  };
};

