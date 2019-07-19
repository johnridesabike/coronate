open Jest;
open Expect;
open ReactTestingLibrary;
open JestDom;
open FireEvent;

/* afterEach(cleanup); */

module BattleForGothamCityRound = {
  [@react.component]
  let make = (~children) =>
    <TournamentData tourneyId="tvAdS4YbSOznrBgrg0ITA">
      children
    </TournamentData>;
};

let regex = text => `RegExp(Js.Re.fromString(text));

describe("Tabs aut-change correctly.", () => {
  let page =
    render(
      <BattleForGothamCityRound>
        {t => <PageRound tournament=t roundId=1 />}
      </BattleForGothamCityRound>,
    );
  let selectTab =
    page |> getByText(~matcher=regex("/^unmatched players \([0-9]+\)$/i"));
  let matchesTab = page |> getByText(~matcher=regex("/^matches$/i"));

  test("When no players are matched, it defaults to the pair-picker", () =>
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true")
  );
  test(
    "Tab doesn't change focus if there are still players to be matched.", () => {
    page |> getByText(~matcher=regex("/add bruce wayne/i")) |> click;
    page |> getByText(~matcher=regex("/add dick grayson/i")) |> click;
    page |> getByText(~matcher=regex("/^match selected$/i")) |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });
  test(
    "The tab selection doesn't change if there are still matched players", () => {
    page |> getByText(~matcher=regex("/add alfred pennyworth/i")) |> click;
    page |> getByText(~matcher=regex("/add barbara gordon/i")) |> click;
    page |> getByText(~matcher=regex("/^match selected$/i")) |> click;
    matchesTab |> click;
    /* expect(matchesTab).toHaveAttribute("aria-selected", "true");*/
    page
    |> getByText(
         ~matcher=regex("/edit match for bruce wayne versus dick grayson/i"),
       )
    |> click;
    page |> getByText(~matcher=regex("/^unmatch$/i")) |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="true");
  });
  test("The tab selection changes when all players have been unmatched", () => {
    page
    |> getByText(
         ~matcher=
           regex("/edit match for alfred pennyworth versus barbara gordon/i"),
       )
    |> click;
    page |> getByText(~matcher=regex("/^unmatch$/i")) |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="false");
  });
  test("The tab selection changes when all players have been paired", () => {
    page
    |> getByText(~matcher=regex("/^auto-pair unmatched players$/i"))
    |> click;
    selectTab |> expect |> toHaveAttribute("aria-selected", ~value="false");
  });
});