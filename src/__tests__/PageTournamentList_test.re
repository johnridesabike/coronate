open Jest;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

/* I think the Reach Dialog component may have a problem with this? */
test("Creating a new tournament works", () => {
  let page = render(<PageTournamentList />);
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

test("Deleting a tournament works", () => {
  let page = render(<PageTournamentList />);
  page
  |> getByLabelText(~matcher=`Str({j|Delete “Simple Pairing”|j}))
  |> click;
  page
  |> queryByText(~matcher=`RegExp([%bs.re "/simple pairing/"]))
  |> Expect.expect
  |> Expect.toBe(Js.null);
});
