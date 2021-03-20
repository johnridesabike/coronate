@react.component
let make: (~tournament: LoadTournament.t) => React.element

type size =
  | Compact
  | Expanded

module ScoreTable: {
  @react.component
  let make: (
    ~size: size,
    ~tourney: Data.Tournament.t,
    ~getPlayer: Data.Id.t => Data.Player.t,
    ~title: string,
  ) => React.element
}

module Crosstable: {
  @react.component
  let make: (~tournament: LoadTournament.t) => React.element
}
