type t = {
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
let make: (
  ~children: t => React.element,
  ~tourneyId: Data.Id.t,
  ~windowDispatch: Window.action => unit=?,
) => React.element
