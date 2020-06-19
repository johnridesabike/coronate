open Jest;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

describe("Tabs auto-change correctly.", () => {
  test("When no players are matched, it defaults to the pair-picker", () => {
    let page =
      render(
        <LoadTournament tourneyId=TestData.simplePairing>
          {tournament => <PageRound tournament roundId=1 />}
        </LoadTournament>,
      );
    let selectTab =
      page
      |> getByText(~matcher=`RegExp([%bs.re "/unmatched players \\(/i"]));
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });

  test(
    "Tab doesn't change focus if there are still players to be matched.", () => {
    let page =
      render(
        <LoadTournament tourneyId=TestData.simplePairing>
          {tournament => <PageRound tournament roundId=1 />}
        </LoadTournament>,
      );
    let selectTab =
      page
      |> getByText(~matcher=`RegExp([%bs.re "/unmatched players \\(/i"]));
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add crow t robot/i"]))
    |> click;
    page |> getByText(~matcher=`RegExp([%bs.re "/add tom servo/i"])) |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/^match selected$/i"]))
    |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });

  test(
    "The tab selection doesn't change if there are still matched players", () => {
    let page =
      render(
        <LoadTournament tourneyId=TestData.simplePairing>
          {tournament => <PageRound tournament roundId=1 />}
        </LoadTournament>,
      );
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add joel robinson/i"]))
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add clayton forrester/i"]))
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/^match selected$/i"]))
    |> click;
    let matchesTab =
      page |> getByText(~matcher=`RegExp([%bs.re "/^matches$/i"]));
    matchesTab |> click;
    page
    |> getByText(
         ~matcher=
           `RegExp(
             [%bs.re
               "/edit match for joel robinson versus clayton forrester/i"
             ],
           ),
       )
    |> click;
    page |> getByText(~matcher=`RegExp([%bs.re "/^unmatch$/i"])) |> click;
    matchesTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });

  test("The tab selection changes when all players have been unmatched", () => {
    let page =
      render(
        <LoadTournament tourneyId=TestData.simplePairing>
          {tournament => <PageRound tournament roundId=1 />}
        </LoadTournament>,
      );
    page
    |> getByText(
         ~matcher=
           `RegExp(
             [%bs.re "/edit match for crow t robot versus tom servo/i"],
           ),
       )
    |> click;
    page |> getByText(~matcher=`RegExp([%bs.re "/^unmatch$/i"])) |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/Matches/i"]))
    |> expect
    |> toHaveAttribute("aria-selected", ~value="false");
  });

  test("The tab selection changes when all players have been paired", () => {
    let page =
      render(
        <LoadTournament tourneyId=TestData.simplePairing>
          {tournament => <PageRound tournament roundId=1 />}
        </LoadTournament>,
      );
    page
    |> getByText(
         ~matcher=`RegExp([%bs.re "/^auto-pair unmatched players$/i"]),
       )
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/^Unmatched players/i"]))
    |> expect
    |> toHaveAttribute("aria-selected", ~value="false");
  });
});
