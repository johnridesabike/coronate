/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open ReactTestingLibrary
open JestDom
open FireEvent

JestDom.init()

describe("Tabs auto-change correctly.", () => {
  test("When no players are matched, it defaults to the pair-picker", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.simplePairing.id>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    let selectTab = page->getByText(#RegExp(%re("/unmatched players \\(/i")))
    selectTab->expect->toHaveAttribute("aria-selected", "true")
  })

  test("Tab doesn't change focus if there are still players to be matched.", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.simplePairing.id>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    let selectTab = page->getByText(#RegExp(%re("/unmatched players \\(/i")))
    page->getByText(#RegExp(%re("/add crow t robot/i")))->click
    page->getByText(#RegExp(%re("/add tom servo/i")))->click
    page->getByText(#RegExp(%re("/^match selected$/i")))->click
    selectTab->expect->toHaveAttribute("aria-selected", "true")
  })

  test("The tab selection doesn't change if there are still matched players", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.simplePairing.id>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    page->getByText(#RegExp(%re("/add crow t robot/i")))->click
    page->getByText(#RegExp(%re("/add tom servo/i")))->click
    page->getByText(#RegExp(%re("/^match selected$/i")))->click
    page->getByText(#RegExp(%re("/add joel robinson/i")))->click
    page->getByText(#RegExp(%re("/add clayton forrester/i")))->click
    page->getByText(#RegExp(%re("/^match selected$/i")))->click
    let matchesTab = page->getByText(#RegExp(%re("/^matches$/i")))
    matchesTab->click
    page->getByText(#RegExp(%re("/edit match for joel robinson versus clayton forrester/i")))->click
    page->getByText(#RegExp(%re("/^unmatch$/i")))->click
    matchesTab->expect->toHaveAttribute("aria-selected", "true")
  })

  test("The tab selection changes when all players have been unmatched", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.simplePairing.id>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    page->getByText(#RegExp(%re("/add crow t robot/i")))->click
    page->getByText(#RegExp(%re("/add tom servo/i")))->click
    page->getByText(#RegExp(%re("/^match selected$/i")))->click
    page->getByText(#RegExp(%re("/edit match for crow t robot versus tom servo/i")))->click
    page->getByText(#RegExp(%re("/^unmatch$/i")))->click
    page
    ->getByText(#RegExp(%re("/Matches/i")))
    ->expect
    ->toHaveAttribute("aria-selected", "false")
  })

  test("The tab selection changes when all players have been paired", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.simplePairing.id>
        {tournament => <PageRound tournament roundId=1 />}
      </LoadTournament>,
    )
    page->getByText(#RegExp(%re("/^auto-pair unmatched players$/i")))->click
    page
    ->getByText(#RegExp(%re("/^Unmatched players/i")))
    ->expect
    ->toHaveAttribute("aria-selected", "false")
  })
})

test("Matches with deleted players don't crash when edited.", () => {
  let page = () =>
    render(
      <LoadTournament tourneyId=TestData.deletedPlayerTourney.id>
        {tournament => <PageRound tournament roundId=0 />}
      </LoadTournament>,
    )
    ->getByTestId(#Str("match-1-select"))
    ->change({
      "target": {
        "value": Data.Match.Result.toString(BlackWon),
      },
    })
  page->expect->not_->toThrow
})
