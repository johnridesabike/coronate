open Belt
open Jest
open Expect

let tournaments = TestData.tournaments
let players = TestData.players

let loadPairData = tourneyId => {
  let {Data.Tournament.playerIds: playerIds, roundList, scoreAdjustments, _} = Map.getExn(
    tournaments,
    tourneyId,
  )
  let players = Map.reduce(players, Belt.Map.make(~id=Data.Id.id), (acc, key, player) =>
    if Set.has(playerIds, key) {
      Map.set(acc, key, player)
    } else {
      acc
    }
  )
  Data.Scoring.fromTournament(~roundList, ~scoreAdjustments)
  ->Data.Pairing.make(players, TestData.config.avoidPairs)
  ->Data.Pairing.setUpperHalves
}

test("Players have 0 priority of pairing themselves.", () => {
  // This doesn't technically mean they won't be paired... but let's be
  // realistic. Something nutty must happen for 0 priority pairings to get
  // picked.
  let pairData = loadPairData(TestData.byeRoundTourney)
  let newb = Map.getExn(pairData, TestData.newbieMcNewberson)
  let ideal = Data.Pairing.calcPairIdeal(newb, newb)
  expect(ideal) |> toBe(0.0)
})

describe("The lowest-ranking player is automatically picked for byes.", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney)
  let (pairData, byedPlayer) = Data.Pairing.setByePlayer([], Data.Id.dummy, dataPreBye)
  test("The lowest-ranking player is removed after bye selection.", () =>
    pairData |> Map.keysToArray |> expect |> not_ |> toContain(TestData.newbieMcNewberson)
  )
  test("The lowest-ranking player is returned", () =>
    switch byedPlayer {
    | None => assert false
    | Some(player) => expect(Data.Pairing.id(player)) |> toBe(TestData.newbieMcNewberson)
    }
  )
})

test("The bye signup queue works", () => {
  let dataPreBye = loadPairData(TestData.byeRoundTourney2)
  let byeQueue = [TestData.newbieMcNewberson, TestData.joelRobinson]
  // Newbie McNewberson already played the first bye round
  let (_, byedPlayer) = Data.Pairing.setByePlayer(byeQueue, Data.Id.dummy, dataPreBye)
  switch byedPlayer {
  | None => assert false
  | Some(player) => expect(Data.Pairing.id(player)) |> toBe(TestData.joelRobinson)
  }
})
test(
  "If all player have (impossibly) played a bye round, the lowest-rated player is picked",
  () => {
    let dataPreBye = loadPairData(TestData.byeRoundTourney3)
    let (_, byedPlayer) = Data.Pairing.setByePlayer([], Data.Id.dummy, dataPreBye)
    switch byedPlayer {
    | None => assert false
    | Some(player) => expect(Data.Pairing.id(player)) |> toBe(TestData.newbieMcNewberson)
    }
  },
)
test("Players are paired correctly in a simple scenario.", () => {
  let pairData = loadPairData(TestData.simplePairing)
  let matches = Data.Pairing.pairPlayers(pairData)
  expect(matches) |> ExpectJs.toEqual([
    (TestData.grandyMcMaster, TestData.gypsy),
    (TestData.drClaytonForrester, TestData.newbieMcNewberson),
    (TestData.joelRobinson, TestData.crowTRobot),
    (TestData.tomServo, TestData.tvsFrank),
  ])
})
test("Players are paired correctly after a draw.", () => {
  let pairData = loadPairData(TestData.pairingWithDraws)
  let matches = Data.Pairing.pairPlayers(pairData)
  expect(matches) |> toEqual([
    (TestData.grandyMcMaster, TestData.gypsy),
    (TestData.drClaytonForrester, TestData.newbieMcNewberson),
    (TestData.tomServo, TestData.tvsFrank),
    (TestData.joelRobinson, TestData.crowTRobot),
  ])
})

open JestDom
open ReactTestingLibrary
open FireEvent

test("Auto-matching with bye players works", () => {
  let page = render(
    <LoadTournament tourneyId=TestData.byeRoundTourney>
      {tournament => <PageRound tournament roundId=0 />}
    </LoadTournament>,
  )

  page |> getByText(~matcher=#RegExp(%bs.re("/auto-pair unmatched players/i"))) |> click

  page
  |> getByTestId(~matcher=#Str("match-3-black"))
  |> JestDom.expect
  |> toHaveTextContent(#Str("Bye Player"))
})

test("Auto-matching works with manually adjusted scores", () => {
  /* This isn't ideal but routing isn't working for tests I think. */
  let page = render(
    <LoadTournament tourneyId=TestData.scoreTest>
      {tournament => <> <PageTourneyPlayers tournament /> <PageRound tournament roundId=3 /> </>}
    </LoadTournament>,
  )
  page |> getByText(~matcher=#RegExp(%bs.re("/more options for kinga forrester/i"))) |> click
  page
  |> getByLabelText(~matcher=#RegExp(%bs.re("/score adjustment/i")))
  |> change(
    ~eventInit={
      "target": {
        "value": "3",
      },
    },
  )
  page |> getByText(~matcher=#RegExp(%bs.re("/save/i"))) |> click
  page |> getByText(~matcher=#RegExp(%bs.re("/more options for TV's Max/i"))) |> click
  page
  |> getByLabelText(~matcher=#RegExp(%bs.re("/score adjustment/i")))
  |> change(
    ~eventInit={
      "target": {
        "value": "-3",
      },
    },
  )
  page |> getByText(~matcher=#RegExp(%bs.re("/save/i"))) |> click
  page |> getByText(~matcher=#RegExp(%bs.re("/auto-pair unmatched players/i"))) |> click
  page
  |> getByTestId(~matcher=#Str("match-0-white"))
  |> JestDom.expect
  |> toHaveTextContent(#Str("Bobo Professor"))
})
