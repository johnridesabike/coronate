open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

afterEach(cleanup);

let windowDispatch = _ => ();

/* I think the Reach Dialog component may have a problem with this? */
Skip.test("Creating a new tournament works", () => {
  let page = render(<PageTournamentList windowDispatch />);

  page |> getByText(~matcher=`RegExp([%bs.re "/add tournament/i"])) |> click;

  page
  |> getByLabelText(~matcher=`RegExp([%bs.re "/name:/i"]))
  |> change(~eventInit={
              "target": {
                "value": "Deep 13 Open",
              },
            });

  page |> getByText(~matcher=`RegExp([%bs.re "/create/i"])) |> click;

  page
  |> getByLabelText(~matcher=`Str({j|Delete “Deep 13 Open”|j}))
  |> expect
  |> toBeInTheDocument;
});

Skip.test("Deleting a tournament works", () => {
  let page = render(<PageTournamentList windowDispatch />);

  page
  |> getByLabelText(~matcher=`Str({j|Delete “Simple Pairing”|j}))
  |> click;

  page
  //|> queryByText(~matcher=`RegExp([%bs.re "/simple pairing/"]))
  |> getByText(~matcher=`RegExp([%bs.re "/simple pairing/"]))
  |> expect
  |> not
  |> toBeInTheDocument;
});
