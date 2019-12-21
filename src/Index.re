%raw
{|import "./styles"|};

module App = {
  [@react.component]
  let make = () => {
    let url = ReasonReact.Router.useUrl();
    <Window className="app">
      {windowDispatch =>
         <main className="app__main">
           {switch (Utils.Router.(hashPath(url.hash))) {
            | [""] => <Pages.Splash />
            | ["tourneys"] => <PageTournamentList windowDispatch />
            | ["tourneys", tourneyId] =>
              <PageTourney tourneyId hashPath=[""] windowDispatch />
            | ["tourneys", tourneyId, ...hashPath] =>
              <PageTourney tourneyId hashPath windowDispatch />
            | ["players"] => <PagePlayers windowDispatch />
            | ["players", id] => <PagePlayers id windowDispatch />
            | ["timecalc"] => <Pages.TimeCalculator />
            | ["options"] => <PageOptions windowDispatch />
            | _ => <Window.Body> <Pages.NotFound /> </Window.Body>
            }}
         </main>}
    </Window>;
  };
};

ReactDOMRe.renderToElementWithId(<App />, "root");

module ServiceWorker = {
  [@bs.module "./serviceWorker"]
  external unregister: unit => unit = "unregister";
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.unregister();