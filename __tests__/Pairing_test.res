/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Jest
open Expect

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
  loadPairData(TestData.byeRoundTourney)
  ->Map.get(TestData.newbieMcNewberson.id)
  ->Option.map(newb => Data.Pairing.calcPairIdeal(newb, newb))
  ->expect
  ->toBe(Some(0.0), _)
})

describe("The lowest-ranking player is automatically picked for byes.", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney)
  let (pairData, byedPlayer) = Data.Pairing.setByePlayer([], Data.Id.dummy, dataPreBye)
  test("The lowest-ranking player is removed after bye selection.", () =>
    pairData |> Map.keysToArray |> expect |> not_ |> toContain(TestData.newbieMcNewberson.id)
  )
  test("The lowest-ranking player is returned", () =>
    switch byedPlayer {
    | None => assert false
    | Some(player) => expect(Data.Pairing.id(player)) |> toBe(TestData.newbieMcNewberson.id)
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
  | Some(player) => expect(Data.Pairing.id(player)) |> toBe(TestData.joelRobinson.id)
  }
})
test(
  "If all player have (impossibly) played a bye round, the lowest-rated player is picked",
  () => {
    let dataPreBye = loadPairData(TestData.byeRoundTourney3)
    let (_, byedPlayer) = Data.Pairing.setByePlayer([], Data.Id.dummy, dataPreBye)
    switch byedPlayer {
    | None => assert false
    | Some(player) => expect(Data.Pairing.id(player)) |> toBe(TestData.newbieMcNewberson.id)
    }
  },
)
test("Players are paired correctly in a simple scenario.", () => {
  let pairData = loadPairData(TestData.simplePairing)
  let matches = Data.Pairing.pairPlayers(pairData)
  expect(matches) |> ExpectJs.toEqual([
    (TestData.grandyMcMaster.id, TestData.gypsy.id),
    (TestData.drClaytonForrester.id, TestData.newbieMcNewberson.id),
    (TestData.joelRobinson.id, TestData.crowTRobot.id),
    (TestData.tomServo.id, TestData.tvsFrank.id),
  ])
})
test("Players are paired correctly after a draw.", () => {
  let pairData = loadPairData(TestData.pairingWithDraws)
  let matches = Data.Pairing.pairPlayers(pairData)
  expect(matches) |> toEqual([
    (TestData.grandyMcMaster.id, TestData.gypsy.id),
    (TestData.drClaytonForrester.id, TestData.newbieMcNewberson.id),
    (TestData.tomServo.id, TestData.tvsFrank.id),
    (TestData.joelRobinson.id, TestData.crowTRobot.id),
  ])
})

open JestDom
open ReactTestingLibrary
open FireEvent

test("Auto-matching with bye players works", () => {
  let page = render(
    <LoadTournament tourneyId=TestData.byeRoundTourney.id>
      {tournament => <PageRound tournament roundId=0 />}
    </LoadTournament>,
  )

  page |> getByText(~matcher=#RegExp(%re("/auto-pair unmatched players/i"))) |> click

  page
  |> getByTestId(~matcher=#Str("match-3-black"))
  |> JestDom.expect
  |> toHaveTextContent(#Str("[Bye]"))
})

test("Auto-matching works with manually adjusted scores", () => {
  /* This isn't ideal but routing isn't working for tests I think. */
  let page = render(
    <LoadTournament tourneyId=TestData.scoreTest.id>
      {tournament => <> <PageTourneyPlayers tournament /> <PageRound tournament roundId=3 /> </>}
    </LoadTournament>,
  )
  page |> getByText(~matcher=#RegExp(%re("/more options for kinga forrester/i"))) |> click
  page
  |> getByLabelText(~matcher=#RegExp(%re("/score adjustment/i")))
  |> change(
    ~eventInit={
      "target": {
        "value": "3",
      },
    },
  )
  page |> getByText(~matcher=#RegExp(%re("/save/i"))) |> click
  page |> getByText(~matcher=#RegExp(%re("/more options for TV's Max/i"))) |> click
  page
  |> getByLabelText(~matcher=#RegExp(%re("/score adjustment/i")))
  |> change(
    ~eventInit={
      "target": {
        "value": "-3",
      },
    },
  )
  page |> getByText(~matcher=#RegExp(%re("/save/i"))) |> click
  page |> getByText(~matcher=#RegExp(%re("/auto-pair unmatched players/i"))) |> click
  page
  |> getByTestId(~matcher=#Str("match-0-white"))
  |> JestDom.expect
  |> toHaveTextContent(#Str("Bobo Professor"))
})
