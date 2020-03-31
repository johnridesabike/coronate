[@react.component]
let make:
  (
    ~tourneyId: Data.Id.t,
    ~subPage: Router.Tourney.t,
    ~windowDispatch: Window.action => unit
  ) =>
  React.element;
