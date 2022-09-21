/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module App = {
  @react.component
  let make = () => {
    let url = Router.useUrl()
    <Window className="app">
      {windowDispatch =>
        <main className="app__main">
          {switch url {
          | Index =>
            <Window.Body windowDispatch>
              <Pages.Splash />
            </Window.Body>
          | TournamentList => <PageTournamentList windowDispatch />
          | Tournament(id, subPage) => <PageTourney tourneyId=id subPage windowDispatch />
          | PlayerList => <PagePlayers windowDispatch />
          | Player(id) => <PagePlayers id windowDispatch />
          | TimeCalculator =>
            <Window.Body windowDispatch>
              <Pages.TimeCalculator />
            </Window.Body>
          | Options => <PageOptions windowDispatch />
          | NotFound =>
            <Window.Body windowDispatch>
              <Pages.NotFound />
            </Window.Body>
          }}
        </main>}
    </Window>
  }
}

let init = () =>
  switch ReactDOM.querySelector("#root") {
  | None => Js.Console.error("Couldn't find root.")
  | Some(root) => ReactDOM.render(<App />, root)
  }

/* Ensure that all LocalForage plugins get loaded. */
LocalForage_Plugins.GetItems.extendPrototype(LocalForage.localForage)
LocalForage_Plugins.RemoveItems.extendPrototype(LocalForage.localForage)
LocalForage_Plugins.SetItems.extendPrototype(LocalForage.localForage)
