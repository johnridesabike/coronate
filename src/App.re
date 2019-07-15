[%bs.raw {|require("./side-effects")|}];

[@react.component]
let make = () => {
  let url = ReasonReact.Router.useUrl();
  <Window className="app">
    <main className="app__main">
      {switch (url.hash |> Utils.hashPath) {
       | [""] => <Pages.Splash />
       | ["", ""] => <Pages.Splash />
       | ["", "tourneys"] => <PageTournamentList />
       | ["", "tourneys", tourneyId] => <PageTourney tourneyId hashPath=[""]/>
       | ["", "tourneys", tourneyId, ...hashPath] => <PageTourney tourneyId hashPath/>
       | ["", "players"] => <PagePlayers />
       | ["", "players", ...id] => <PagePlayers id/>
       | ["", "options"] => <PageOptions />
       | _ => <Window.Body> <Pages.NotFound /> </Window.Body>
       }}
    </main>
  </Window>;
};
