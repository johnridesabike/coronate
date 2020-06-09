type t = {
  activePlayers: Data.Id.Map.t(Data.Player.t),
  getPlayer: Data.Id.t => Data.Player.t,
  isItOver: bool,
  isNewRoundReady: bool,
  players: Data.Id.Map.t(Data.Player.t),
  playersDispatch: (. Db.action(Data.Player.t)) => unit,
  roundCount: int,
  tourney: Data.Tournament.t,
  setTourney: (. Data.Tournament.t) => unit,
};

[@react.component]
let make:
  (
    ~children: (. t) => React.element,
    ~tourneyId: Data.Id.t,
    ~windowDispatch: (. Window.action) => unit=?
  ) =>
  React.element;

/**
 * I extracted this logic to its own module so it could be easily
 * reused (e.g. in testing). It may have also made the whole component tree more
 * complicated.
 */
type roundData = {
  activePlayersCount: int,
  scoreData: Data.Id.Map.t(Data_Scoring.t),
  unmatched: Data.Id.Map.t(Data.Player.t),
  unmatchedCount: int,
  unmatchedWithDummy: Data.Id.Map.t(Data.Player.t),
};

let useRoundData: (int, t) => roundData;
