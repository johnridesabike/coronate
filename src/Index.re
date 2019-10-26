%raw
{|import "./styles"|};

module App = {
  [@react.component]
  let make = () => {
    let url = ReasonReact.Router.useUrl();
    <Window className="app">
      <main className="app__main">
        {switch (Utils.Router.hashPath(url.hash)) {
         | [""] => <Pages.Splash />
         | ["tourneys"] => <PageTournamentList />
         | ["tourneys", tourneyId] => <PageTourney tourneyId hashPath=[""] />
         | ["tourneys", tourneyId, ...hashPath] =>
           <PageTourney tourneyId hashPath />
         | ["players"] => <PagePlayers />
         | ["players", ...id] => <PagePlayers id />
         | ["timecalc"] => <Pages.TimeCalculator />
         | ["options"] => <PageOptions />
         | _ => <Window.Body> <Pages.NotFound /> </Window.Body>
         }}
      </main>
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