open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

afterEach(cleanup);

let windowDispatch = _ => ();

module BattleForGothamCity = {
  [@react.component]
  let make = (~children) =>
    <LoadTournament tourneyId="tvAdS4YbSOznrBgrg0ITA" windowDispatch>
      children
    </LoadTournament>;
};

module SimplePairing = {
  [@react.component]
  let make = (~children) =>
    <LoadTournament tourneyId="Simple_Pairing_______" windowDispatch>
      children
    </LoadTournament>;
};

Skip.test("Ratings are updated correctly after a match.", () => {
  let page =
    render(
      <SimplePairing>
        {tournament => <PageRound tournament roundId=1 />}
      </SimplePairing>,
    );
  page
  |> getByText(~matcher=`RegExp([%bs.re "/add newbie mcnewberson/i"]))
  |> click;
  page
  |> getByText(~matcher=`RegExp([%bs.re "/add grandy mcmaster/i"]))
  |> click;
  page |> getByText(~matcher=`RegExp([%bs.re "/match selected/i"])) |> click;
  page
  |> getByDisplayValue("Select winner")
  |> change(~eventInit={
              "target": {
                "value": `White,
              },
            });
  page
  |> getByText(
       ~matcher=
         `RegExp(
           [%bs.re
             "/view information for match: newbie mcnewberson versus grandy mcmaster/i"
           ],
         ),
     )
  |> click;
  /* TODO for some reason, this query doesn't work */
  page
  |> getByTestId("rating-Newbie_McNewberson___")
  |> expect
  |> toHaveTextContent("1998 (+33)");
});
/*
 it("Match counts are updated.", function () {
     expect(getMatchCount(batmanInfo)).toBe("10");
 });
 test("Swapping players colors works.",  ()=> {
     let page = render(
         <TestApp>
             <Round tourneyId={1} roundId={1} />
         </TestApp>
     );
     fireEvent.click(
         getByLabelText(
             /open information for Bruce Wayne versus Dick Grayson/i
         )
     );
     fireEvent.click(getByLabelText(/^swap colors$/i));
     expect(getByTestId("match-0-white")).toHaveTextContent(/dick grayson/i);
 });
 it("Unmatching players works.", function () {
     const {getByLabelText, queryByText} = render(
         <TestApp>
             <Round tourneyId={1} roundId={1} />
         </TestApp>
     );
     fireEvent.click(
         getByLabelText(
             /open information for Dick Grayson versus Bruce Wayne/i
         )
     );
     fireEvent.click(getByLabelText(/^unmatch$/i));
     expect(queryByText(/No players matched yet./i)).toBeInTheDocument();
 });

 it("Match counts are updated after matches are removed.", function () {
     expect(getMatchCount(batmanInfo)).toBe("9");
 });
  */