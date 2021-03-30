module App = {
  @react.component
  let make = () => {
    let url = Router.useHashUrl()
    <Window className="app">
      {windowDispatch =>
        <main className="app__main">
          {switch url {
          | Index => <Window.Body windowDispatch> <Pages.Splash /> </Window.Body>
          | TournamentList => <PageTournamentList windowDispatch />
          | Tournament(id, subPage) => <PageTourney tourneyId=id subPage windowDispatch />
          | PlayerList => <PagePlayers windowDispatch />
          | Player(id) => <PagePlayers id windowDispatch />
          | TimeCalculator => <Window.Body windowDispatch> <Pages.TimeCalculator /> </Window.Body>
          | Options => <PageOptions windowDispatch />
          | NotFound => <Window.Body windowDispatch> <Pages.NotFound /> </Window.Body>
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
