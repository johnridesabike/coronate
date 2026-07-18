/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Vitest
open ReactTestingLibrary
open JestDom
open FireEvent

let renderAsync = async x => {
  let page = render(x)
  await waitForElementToBeRemoved(() => page->queryByText(#Str("Loading...")))
  page
}

describe("Tabs auto-change correctly.", () => {
  testAsync("When no players are matched, it defaults to the pair-picker", async t => {
    let page = await renderAsync(
      <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    let selectTab = page->getByText(#RegExp(/unmatched players \(/i))
    t->expect(selectTab)->toHaveAttribute("aria-selected", "true")
  })

  testAsync("Tab doesn't change focus if there are still players to be matched.", async t => {
    let page = await renderAsync(
      <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    let selectTab = page->getByText(#RegExp(/unmatched players \(/i))
    page->getByText(#RegExp(/add crow t robot/i))->click
    page->getByText(#RegExp(/add tom servo/i))->click
    page->getByText(#RegExp(/^match selected$/i))->click
    t->expect(selectTab)->toHaveAttribute("aria-selected", "true")
  })

  testAsync("The tab selection doesn't change if there are still matched players", async t => {
    let page = await renderAsync(
      <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    page->getByText(#RegExp(/add crow t robot/i))->click
    page->getByText(#RegExp(/add tom servo/i))->click
    page->getByText(#RegExp(/^match selected$/i))->click
    page->getByText(#RegExp(/add joel robinson/i))->click
    page->getByText(#RegExp(/add clayton forrester/i))->click
    page->getByText(#RegExp(/^match selected$/i))->click
    let matchesTab = page->getByText(#RegExp(/^matches$/i))
    matchesTab->mouseDown
    page->getByText(#RegExp(/edit match for joel robinson versus clayton forrester/i))->click
    page->getByText(#RegExp(/^unmatch$/i))->click
    t->expect(matchesTab)->toHaveAttribute("aria-selected", "true")
  })

  testAsync("The tab selection changes when all players have been unmatched", async t => {
    let page = await renderAsync(
      <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    page->getByText(#RegExp(/add crow t robot/i))->click
    page->getByText(#RegExp(/add tom servo/i))->click
    page->getByText(#RegExp(/^match selected$/i))->click
    page->getByText(#RegExp(/edit match for crow t robot versus tom servo/i))->click
    page->getByText(#RegExp(/^unmatch$/i))->click
    t
    ->expect(page->getByText(#RegExp(/Matches/i)))
    ->toHaveAttribute("aria-selected", "false")
  })

  testAsync("The tab selection changes when all players have been paired", async t => {
    let page = await renderAsync(
      <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    page->getByText(#RegExp(/^auto-pair unmatched players$/i))->click
    t
    ->expect(page->getByText(#RegExp(/^Unmatched players/i)))
    ->toHaveAttribute("aria-selected", "false")
  })
})

testAsync("Matches with deleted players don't crash when edited.", async t => {
  let page = await renderAsync(
    <LoadTournament tourneyId=TestData.deletedPlayerTourney.id windowDispatch=None>
      {tournament => <PageRound tournament roundId=0 />}
    </LoadTournament>,
  )
  let f = () => {
    page
    ->getByTestId(#Str("match-1-select"))
    ->change({
      "target": {
        "value": Data.Match.Result.toString(BlackWon),
      },
    })
  }
  t->expect(f)->Expect.not->Expect.toThrow
})
