module App = {
  @react.component
  let make = () => {
    let url = Router.useHashUrl()
    <Window className="app">
      {windowDispatch =>
        <main className="app__main">
          {switch url {
          | Index => <Pages.Splash />
          | TournamentList => <PageTournamentList windowDispatch />
          | Tournament(id, subPage) => <PageTourney tourneyId=id subPage windowDispatch />
          | PlayerList => <PagePlayers windowDispatch />
          | Player(id) => <PagePlayers id windowDispatch />
          | TimeCalculator => <Pages.TimeCalculator />
          | Options => <PageOptions windowDispatch />
          | NotFound => <Window.Body> <Pages.NotFound /> </Window.Body>
          }}
        </main>}
    </Window>
  }
}

let init = () => ReactDOMRe.renderToElementWithId(<App />, "root")

/* Ensure that all LocalForage plugins get loaded. */
LocalForage_Plugins.GetItems.extendPrototype(LocalForage.localForage)
LocalForage_Plugins.RemoveItems.extendPrototype(LocalForage.localForage)
LocalForage_Plugins.SetItems.extendPrototype(LocalForage.localForage)

module ServiceWorker = {
  @module("./serviceWorker")
  external unregister: unit => unit = "unregister"
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.unregister()
