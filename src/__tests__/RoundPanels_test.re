open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

let id = Data.Id.fromString;

/* afterEach(cleanup); */

let windowDispatch = _ => ();

module BattleForGothamCityRound = {
  [@react.component]
  let make = (~children) =>
    <LoadTournament tourneyId={id("tvAdS4YbSOznrBgrg0ITA")} windowDispatch>
      children
    </LoadTournament>;
};

describe("Tabs auto-change correctly.", () => {
  let page =
    render(
      <BattleForGothamCityRound>
        {t => <PageRound tournament=t roundId=1 />}
      </BattleForGothamCityRound>,
    );
  let selectTab =
    page |> getByText(~matcher=`RegExp([%bs.re "/unmatched players \\(/i"]));
  let matchesTab =
    page |> getByText(~matcher=`RegExp([%bs.re "/^matches$/i"]));

  test("When no players are matched, it defaults to the pair-picker", () =>
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true")
  );

  test(
    "Tab doesn't change focus if there are still players to be matched.", () => {
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add bruce wayne/i"]))
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add dick grayson/i"]))
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/^match selected$/i"]))
    |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });

  test(
    "The tab selection doesn't change if there are still matched players", () => {
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add alfred pennyworth/i"]))
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/add barbara gordon/i"]))
    |> click;
    page
    |> getByText(~matcher=`RegExp([%bs.re "/^match selected$/i"]))
    |> click;
    matchesTab |> click;
    /* expect(matchesTab).toHaveAttribute("aria-selected", "true");*/
    page
    |> getByText(
         ~matcher=
           `RegExp(
             [%bs.re "/edit match for bruce wayne versus dick grayson/i"],
           ),
       )
    |> click;
    page |> getByText(~matcher=`RegExp([%bs.re "/^unmatch$/i"])) |> click;
    matchesTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });

  Skip.test(
    "The tab selection changes when all players have been unmatched", () => {
    page
    |> getByText(
         ~matcher=
           `RegExp(
             [%bs.re
               "/edit match for alfred pennyworth versus barbara gordon/i"
             ],
           ),
       )
    |> click;
    page |> getByText(~matcher=`RegExp([%bs.re "/^unmatch$/i"])) |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="false");
  });

  Skip.test("The tab selection changes when all players have been paired", () => {
    page
    |> getByText(
         ~matcher=`RegExp([%bs.re "/^auto-pair unmatched players$/i"]),
       )
    |> click;
    matchesTab |> expect |> toHaveAttribute("aria-selected", ~value="false");
  });
});
