open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

afterEach(cleanup);

module BattleForGothamCity = {
  [@react.component]
  let make = (~children) =>
    <LoadTournament tourneyId="tvAdS4YbSOznrBgrg0ITA">
      children
    </LoadTournament>;
};

Skip.test("Ratings are updated correctly after a match.", () => {
  let page =
    render(
      <BattleForGothamCity>
        {t => <PageRound tournament=t roundId=1 />}
      </BattleForGothamCity>,
    );
  page |> getByText(~matcher=`RegExp([%bs.re "/add bruce wayne/i"])) |> click;
  page
  |> getByText(~matcher=`RegExp([%bs.re "/add dick grayson/i"]))
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
             "/view information for match: bruce wayne versus dick grayson/i"
           ],
         ),
     )
  |> click;
  /* TODO for some reason, this query doesn't work */
  page
  |> getByLabelText(~matcher=`RegExp([%bs.re "/rating for Bruce Wayne/i"]))
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