[%bs.raw {|require("./side-effects")|}];

[@react.component]
let make = () => {
  let url = ReasonReact.Router.useUrl();
  // Js.log(url.hash |> Utils.hashPath);
  <Window.Window className="app">
    <main className="app__main">
      {switch (url.hash |> Utils.hashPath) {
       | [""] => <Pages.Splash />
       | ["", ""] => <Pages.Splash />
       | ["", "tourneys"] => <PageTournamentList />
       | ["", "players", ..._] => <PagePlayers />
       | _ => <Window.WindowBody> <Pages.NotFound /> </Window.WindowBody>
       }}
    </main>
  </Window.Window>;
} /* export default App*/;

// function App() {
//     return (
//         <LocationProvider history={history}>
//             <Window className="app">
//                 <main className="app__main">
//                     <Router>
//                         <Splash path="/" />
//                         <TournamentIndex path="tourneys">
//                             <TournamentList path="/" />
//                             <Tournament path=":tourneyId/*" />
//                         </TournamentIndex>
//                         <Players path="players/*" />
//                         <Options path="options" />
//                         <NotFound default />
//                     </Router>
//                 </main>
//             </Window>
//         </LocationProvider>
//     );
// }