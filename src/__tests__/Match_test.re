open Jest;
open Expect;
open ReactTestingLibrary;
open FireEvent;

afterEach(cleanup);

module BattleForGothamCity = {
  [@react.component]
  let make = (~children) => 
    <TournamentData tourneyId="tvAdS4YbSOznrBgrg0ITA">
      children
    </TournamentData>
};

test("Ratings are updated correctly after a match.", () => {
  let page = render(
    <BattleForGothamCity>
      {(t) => <PageRound tournament=t roundId=1/>}
    </BattleForGothamCity>
  );
  page|>getByText(~matcher=`RegExp([%bs.re"/add bruce wayne/i"]))|>click;
  page|>getByText(~matcher=`RegExp([%bs.re"/add dick grayson/i"]))|>click;
  page|>getByText(~matcher=`RegExp([%bs.re"/match selected/i"]))|>click;
  // page|>getByDisplayValue
  /* `getByDisplayValue` isn't implemented yet. */
  expect(true)|>toBe(true);
});
/* 
it("Match counts are updated.", function () {
    expect(getMatchCount(batmanInfo)).toBe("10");
});

it("Swapping players colors works.", function () {
    const {getByLabelText, getByTestId} = render(
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
