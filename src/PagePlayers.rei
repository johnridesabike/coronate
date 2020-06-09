module NewPlayerForm: {
  [@react.component]
  let make:
    (
      ~dispatch: (. Db.action(Data.Player.t)) => unit,
      ~addPlayerCallback: Data.Id.t => unit=?
    ) =>
    React.element;
};

module Profile: {
  [@react.component]
  let make:
    (
      ~player: Data.Player.t,
      ~players: Data.Id.Map.t(Data.Player.t),
      ~playersDispatch: (. Db.action(Data.Player.t)) => unit,
      ~config: Data.Config.t,
      ~configDispatch: (. Db.actionConfig) => unit,
      ~windowDispatch: (. Window.action) => unit=?
    ) =>
    React.element;
};

[@react.component]
let make:
  (~id: Data.Id.t=?, ~windowDispatch: (. Window.action) => unit=?) =>
  React.element;
