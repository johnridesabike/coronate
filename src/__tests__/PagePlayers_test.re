open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

afterEach(cleanup);

let windowDispatch = _ => ();

open Belt;

module Profile = {
  [@react.component]
  let make = (~id) => {
    let Db.{items: players, dispatch: playersDispatch, _} =
      Db.useAllPlayers();
    let (config, configDispatch) = Db.useConfig();
    let player = Map.getExn(players, id);
    <PagePlayers.Profile
      player
      players
      playersDispatch
      config
      configDispatch
      windowDispatch
    />;
  };
};

test("Adding a player to avoid works", () => {
  let page = render(<Profile id=TestData.newbieMcNewberson />);

  page
  |> getByLabelText(
       ~matcher=`RegExp([%bs.re "/Select a new player to avoid/i"]),
     )
  |> change(~eventInit={
              "target": {
                "value": TestData.grandyMcMaster,
              },
            });

  page |> getByText(~matcher=`RegExp([%bs.re "/^add$/i"])) |> click;

  page
  |> getByText(~matcher=`RegExp([%bs.re "/grandy mcmaster/i"]))
  |> expect
  |> toBeInTheDocument;
});
