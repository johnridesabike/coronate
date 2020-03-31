open Belt;
open Data;

let log2 = num => log(num) /. log(2.0);
/*
  I'm depreciating `DemoData`, but currently merging it with `TestData` so
  tests can keep working.
 */
open TestData;
let configData =
  Data.Config.{
    ...config,
    avoidPairs:
      Set.mergeMany(
        config.avoidPairs,
        Set.toArray(DemoData.config.avoidPairs),
      ),
  };

let merger = (_key, a, b) => {
  switch (a, b) {
  | (Some(a), _) => Some(a)
  | (_, Some(b)) => Some(b)
  | (None, None) => None
  };
};

let tournamentData =
  Array.concat(tournaments, DemoData.tournaments)
  ->Data.Id.Map.fromStringArray;
let playerData =
  Array.concat(players, DemoData.players)->Data.Id.Map.fromStringArray;

let calcNumOfRounds = playerCount => {
  let roundCount = playerCount->float_of_int->log2->ceil;
  roundCount !== neg_infinity ? int_of_float(roundCount) : 0;
};

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

[@react.component]
let make = (~children, ~tourneyId) => {
  let (tourney, setTourney) =
    React.useReducer(
      tournamentReducer,
      Map.getExn(tournamentData, tourneyId),
    );
  let Tournament.{playerIds, roundList, _} = tourney;
  let Db.{items: players, dispatch: playersDispatch, _} = Db.useAllPlayers();
  /* `activePlayers` is only players to be matched in future matches. */
  let activePlayers =
    Map.keep(players, (id, _) => playerIds->List.has(id, (===)));
  let roundCount = activePlayers->Map.size->calcNumOfRounds;
  let isItOver = Data.Rounds.size(roundList) >= roundCount;
  let isNewRoundReady =
    Data.Rounds.size(roundList) === 0
      ? true
      : Rounds.isRoundComplete(
          roundList,
          activePlayers,
          Data.Rounds.size(roundList) - 1,
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
};

type roundData = {
  activePlayersCount: int,
  scoreData: Data.Id.Map.t(Scoring.t),
  unmatched: Data.Id.Map.t(Data.Player.t),
  unmatchedCount: int,
  unmatchedWithDummy: Data.Id.Map.t(Data.Player.t),
};
let useRoundData = (roundId: int, tournament: t) => {
  let {tourney, activePlayers, getPlayer, _} = tournament;
  let Tournament.{roundList, _} = tourney;
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
      Map.removeMany(activePlayers, matched);
    | (None, _)
    | (Some(_), false) => Data.Id.Map.make()
    };
  let unmatchedCount = Map.size(unmatched);
  /* make a new list so as not to affect auto-pairing*/
  let unmatchedWithDummy =
    unmatchedCount mod 2 !== 0
      ? Map.set(unmatched, Data.Id.dummy, getPlayer(Data.Id.dummy))
      : unmatched;
  let activePlayersCount = Map.size(activePlayers);
  {
    activePlayersCount,
    scoreData,
    unmatched,
    unmatchedCount,
    unmatchedWithDummy,
  };
};
