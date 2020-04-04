[@react.component]
let make:
  (
    ~tourneyId: Data.Id.t,
    ~subPage: Router.TourneyPage.t,
    ~windowDispatch: Window.action => unit
  ) =>
  React.element;
