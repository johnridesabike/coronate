/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Jest

let players = TestData.players

let loadPairData = tourney => {
  let {Data.Tournament.playerIds: playerIds, roundList, scoreAdjustments, _} = tourney
  let players = Map.reduce(players, Belt.Map.make(~id=Data.Id.id), (acc, key, player) =>
    if Set.has(playerIds, key) {
      Map.set(acc, key, player)
    } else {
      acc
    }
  )
  Data.Scoring.fromTournament(~roundList, ~scoreAdjustments)->Data.Pairing.make(
    players,
    TestData.config.avoidPairs,
  )
}

test("Players have 0 priority of pairing themselves.", () => {
  // This doesn't technically mean they won't be paired... but let's be
  // realistic. Something nutty must happen for 0 priority pairings to get
  // picked.
  let data = loadPairData(TestData.byeRoundTourney)
  let newb = TestData.newbieMcNewberson.id
  Data.Pairing.calcPairIdealByIds(data, newb, newb)->expect->toBe(Some(0.0))
})

describe("The lowest-ranking player is automatically picked for byes.", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney)
  let (pairData, byedPlayer) = Data.Pairing.setByePlayer([], Data.Id.dummy, dataPreBye)
  test("The lowest-ranking player is removed after bye selection.", () =>
    pairData
    ->Data.Pairing.players
    ->Map.keysToArray
    ->expect
    ->not_
    ->toContain(TestData.newbieMcNewberson.id)
  )
  test("The lowest-ranking player is returned", () =>
    switch byedPlayer {
    | None => assert false
    | Some(player) => expect(Data.Pairing.id(player))->toBe(TestData.newbieMcNewberson.id)
    }
  )
})

test("The bye signup queue works", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney2)
  let byeQueue = [TestData.newbieMcNewberson.id, TestData.joelRobinson.id]
  // Newbie McNewberson already played the first bye round
  let (_, byedPlayer) = Data.Pairing.setByePlayer(byeQueue, Data.Id.dummy, dataPreBye)
  switch byedPlayer {
  | None => assert false
  | Some(player) => expect(Data.Pairing.id(player))->toBe(TestData.joelRobinson.id)
  }
})
test(
  "If all player have (impossibly) played a bye round, the lowest-rated player is picked",
  () => {
    let dataPreBye = loadPairData(TestData.byeRoundTourney3)
    let (_, byedPlayer) = Data.Pairing.setByePlayer([], Data.Id.dummy, dataPreBye)
    switch byedPlayer {
    | None => assert false
    | Some(player) => expect(Data.Pairing.id(player))->toBe(TestData.newbieMcNewberson.id)
    }
  },
)
test("Players are paired correctly in a simple scenario.", () => {
  let pairData = loadPairData(TestData.simplePairing)
  let matches = Data.Pairing.pairPlayers(pairData)
  expect(matches)->toEqual([
    (TestData.grandyMcMaster.id, TestData.gypsy.id),
    (TestData.drClaytonForrester.id, TestData.newbieMcNewberson.id),
    (TestData.joelRobinson.id, TestData.crowTRobot.id),
    (TestData.tomServo.id, TestData.tvsFrank.id),
  ])
})

test("Players are paired correctly after a draw.", () => {
  let pairData = loadPairData(TestData.pairingWithDraws)
  let matches = Data.Pairing.pairPlayers(pairData)
  expect(matches)->toEqual([
    (TestData.grandyMcMaster.id, TestData.gypsy.id),
    (TestData.drClaytonForrester.id, TestData.newbieMcNewberson.id),
    (TestData.tomServo.id, TestData.tvsFrank.id),
    (TestData.joelRobinson.id, TestData.crowTRobot.id),
  ])
})

open JestDom
open ReactTestingLibrary
open FireEvent

JestDom.init()

/* This is quick-and-dirty and fragile. */
test("Players are paired correctly after a draw (more complex).", () => {
  let page = render(
    <LoadTournament tourneyId={Data.Id.fromString("complex-bye-rounds---")}>
      {tournament => <PageRound tournament roundId=4 />}
    </LoadTournament>,
  )
  page->getByText(#RegExp(%re("/auto-pair unmatched players/i")))->click

  page->expect->toMatchSnapshot
})

test("Auto-matching with bye players works", () => {
  let page = render(
    <LoadTournament tourneyId=TestData.byeRoundTourney.id>
      {tournament => <PageRound tournament roundId=0 />}
    </LoadTournament>,
  )

  page->getByText(#RegExp(%re("/auto-pair unmatched players/i")))->click

  page->getByTestId(#Str("match-3-black"))->expect->toHaveTextContent(#Str("[Bye]"))
})

test("Auto-matching works with manually adjusted scores", () => {
  /* This isn't ideal but routing isn't working for tests I think. */
  let page = render(
    <LoadTournament tourneyId=TestData.scoreTest.id>
      {tournament => <>
        <PageTourneyPlayers tournament />
        <PageRound tournament roundId=3 />
      </>}
    </LoadTournament>,
  )
  page->getByText(#RegExp(%re("/more options for kinga forrester/i")))->click
  page
  ->getByLabelText(#RegExp(%re("/score adjustment/i")))
  ->change({
    "target": {
      "value": "3",
    },
  })
  page->getByText(#RegExp(%re("/save/i")))->click
  page->getByText(#RegExp(%re("/more options for TV's Max/i")))->click
  page
  ->getByLabelText(#RegExp(%re("/score adjustment/i")))
  ->change({
    "target": {
      "value": "-3",
    },
  })
  page->getByText(#RegExp(%re("/save/i")))->click
  page->getByText(#RegExp(%re("/auto-pair unmatched players/i")))->click
  page->getByTestId(#Str("match-0-white"))->expect->toHaveTextContent(#Str("Bobo Professor"))
})

describe("Manually pairing and byes.", () => {
  test("Pairing players does not automatically pre-select the winner.", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.byeRoundTourney.id>
        {tournament => <PageRound tournament roundId=0 />}
      </LoadTournament>,
    )
    page->getByText(#Str("Add Joel Robinson"))->click
    page->getByText(#Str("Add Tom Servo"))->click
    page
    ->getByTestId(#Str("pairpicker-preselect-winner"))
    ->expect
    ->toHaveValue(#Str(Data.Match.Result.toString(NotSet)))
  })

  test("Pairing with a bye player automatically pre-selects the winner.", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.byeRoundTourney.id>
        {tournament => <PageRound tournament roundId=0 />}
      </LoadTournament>,
    )
    page->getByText(#Str("Add [Bye]"))->click
    page->getByText(#Str("Add Joel Robinson"))->click
    page
    ->getByTestId(#Str("pairpicker-preselect-winner"))
    ->expect
    ->toHaveValue(#Str(Data.Match.Result.toString(BlackWon)))
  })

  test("Un-pairing a bye player automatically un-pre-selects the winner.", () => {
    let page = render(
      <LoadTournament tourneyId=TestData.byeRoundTourney.id>
        {tournament => <PageRound tournament roundId=0 />}
      </LoadTournament>,
    )
    page->getByText(#Str("Add [Bye]"))->click
    page->getByText(#Str("Add Joel Robinson"))->click
    page->getByText(#Str("Remove [Bye]"))->click
    page
    ->getByTestId(#Str("pairpicker-preselect-winner"))
    ->expect
    ->toHaveValue(#Str(Data.Match.Result.toString(NotSet)))
  })
})
