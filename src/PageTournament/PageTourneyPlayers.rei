module Selecting: {
  [@react.component]
  let make:
    (
      ~tourney: Data.Tournament.t,
      ~setTourney: (. Data.Tournament.t) => unit,
      ~players: Data.Id.Map.t(Data.Player.t),
      ~playersDispatch: (. Db.action(Data.Player.t)) => unit
    ) =>
    React.element;
};

[@react.component]
let make: (~tournament: LoadTournament.t) => React.element;
