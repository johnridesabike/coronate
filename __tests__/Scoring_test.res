/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open Expect
open Data.Player

let newb = TestData.newbieMcNewberson
let master = TestData.grandyMcMaster

test("K Factor is calculated correctly", () => {
  let masterKFactor = Data.Ratings.EloRank.getKFactor(~matchCount=master.matchCount)
  expect(masterKFactor) |> toBe(8)
})

test("Ratings are calculated correctly", () => {
  let calcRatingsForPair = Data.Ratings.calcNewRatings(
    ~whiteRating=newb.rating,
    ~blackRating=master.rating,
    ~whiteMatchCount=newb.matchCount,
    ~blackMatchCount=master.matchCount,
  )
  let newbWon = calcRatingsForPair(~result=Data.Match.Result.WhiteWon)
  // not really a good example for this next one because they don't change:
  let masterWon = calcRatingsForPair(~result=Data.Match.Result.BlackWon)
  let draw = calcRatingsForPair(~result=Data.Match.Result.Draw)
  expect((newbWon, masterWon, draw)) |> toEqual(((1600, 2592), (800, 2600), (1200, 2596)))
})

test("Ratings never go below 100", () => {
  // The white player begins with a rating of 100 and loses.
  let (newRatingWhite, _) = Data.Ratings.calcNewRatings(
    ~whiteRating=100,
    ~blackRating=100,
    ~whiteMatchCount=69,
    ~blackMatchCount=69,
    ~result=Data.Match.Result.BlackWon,
  )
  expect(newRatingWhite) |> toBe(100)
})

Skip.test("Tie break scores calculate correctly", () => expect(true) |> toBe(true))

open ReactTestingLibrary
open JestDom

let scorePage = (~id) =>
  <LoadTournament tourneyId=id>
    {({tourney: {name: title, _} as tourney, getPlayer, _}) =>
      <PageTourneyScores.ScoreTable size=Expanded tourney getPlayer title />}
  </LoadTournament>->render

test("Snapshot of score table, score test", () => {
  scorePage(~id=TestData.scoreTest.id) |> Expect.expect |> Expect.toMatchSnapshot
})

test("Snapshot of score table, simple pairing", () => {
  scorePage(~id=TestData.simplePairing.id) |> Expect.expect |> Expect.toMatchSnapshot
})

describe("Snapshot of ranks are correct", () => {
  test("rank 1", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-1.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("TV's Max"))
  )
  test("rank 2", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-2.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Bobo Professor"))
  )
  test("rank 3", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-3.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("TV's Frank"))
  )
  test("rank 4", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-4.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Mike Nelson"))
  )
  test("rank 5", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-5.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Brain Guy"))
  )
  test("rank 6", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-6.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Clayton Forrester"))
  )
  test("rank 7", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-7.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Joel Robinson"))
  )
  test("rank 8", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-8.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Crow T Robot"))
  )
  test("rank 9", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-9.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Cambot"))
  )
  test("rank 10", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-10.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Jonah Heston"))
  )
  test("rank 11", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-11.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Tom Servo"))
  )
  test("rank 12", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-12.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Pearl Forrester"))
  )
  test("rank 13", () =>
    scorePage(~id=TestData.scoreTest.id)
    |> getByTestId(~matcher=#Str("rank-13.0"))
    |> JestDom.expect
    |> toHaveTextContent(#Str("Kinga Forrester"))
  )
})

open FireEvent

test("Manually adjusting scores works", () => {
  /* This isn't ideal but routing isn't working for tests I think. */
  let page = render(
    <LoadTournament tourneyId=TestData.scoreTest.id>
      {tournament => <> <PageTourneyPlayers tournament /> <PageTourneyScores tournament /> </>}
    </LoadTournament>,
  )
  page |> getByText(~matcher=#RegExp(%bs.re("/more options for kinga forrester/i"))) |> click
  page
  |> getByLabelText(~matcher=#RegExp(%bs.re("/score adjustment/i")))
  |> change(
    ~eventInit={
      "target": {
        "value": "100",
      },
    },
  )
  page |> getByText(~matcher=#RegExp(%bs.re("/save/i"))) |> click
  page
  |> getByTestId(~matcher=#Str("rank-1.0"))
  |> JestDom.expect
  |> toHaveTextContent(#Str("Kinga Forrester"))
})

test("Pairing players twice displays the correct history", () => {
  let page = render(
    <LoadTournament tourneyId=TestData.simplePairing.id>
      {tournament => <PageRound tournament roundId=1 />}
    </LoadTournament>,
  )
  page |> getByText(~matcher=#RegExp(%bs.re("/add crow t robot/i"))) |> click
  page |> getByText(~matcher=#RegExp(%bs.re("/add grandy mcmaster/i"))) |> click
  page |> getByText(~matcher=#RegExp(%bs.re("/match selected/i"))) |> click
  page |> getByText(~matcher=#RegExp(%bs.re("/^Matches$/"))) |> click
  page
  |> getByDisplayValue(~matcher=#Str("Select winner"))
  |> change(
    ~eventInit={
      "target": {
        "value": Data.Match.Result.toString(Data.Match.Result.BlackWon),
      },
    },
  )
  page
  |> getByText(
    ~matcher=#RegExp(%bs.re("/View information for match: Crow T Robot versus Grandy McMaster/i")),
  )
  |> click
  /* This is a quick heuristic, probably should be more robust */
  page
  |> queryAllByText(~matcher=#RegExp(%bs.re("/Crow T Robot - Won/i")))
  |> Belt.Array.size
  |> Expect.expect
  |> Expect.toBe(2)
})
