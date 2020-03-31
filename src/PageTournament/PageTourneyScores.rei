[@react.component]
let make: (~tournament: LoadTournament.t) => React.element;

module ScoreTable: {
  [@react.component]
  let make:
    (
      ~isCompact: bool=?,
      ~tourney: Data.Tournament.t,
      ~getPlayer: Data.Id.t => Data.Player.t,
      ~title: string
    ) =>
    React.element;
};

module Crosstable: {
  [@react.component]
  let make: (~tournament: LoadTournament.t) => React.element;
};
