/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open Data.Player

JestDom.init()

let newb = TestData.newbieMcNewberson
let master = TestData.grandyMcMaster

test("K Factor is calculated correctly", () => {
  let masterKFactor = Data.Ratings.EloRank.getKFactor(
    ~matchCount=master.matchCount,
    ~rating=master.rating,
  )
  expect(masterKFactor)->toBe(10)
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
  expect(newbWon)->toEqual((840, 2590))
  expect(masterWon)->toEqual((800, 2600))
  expect(draw)->toEqual((820, 2595))
})

test("Ratings never go below 100", () => {
  // The white player begins with a rating of 100 and loses.
  let (newRatingWhite, _) = Data.Ratings.calcNewRatings(
    ~whiteRating=100,
    ~blackRating=100,
    ~whiteMatchCount=Data.Player.NatInt.fromInt(69),
    ~blackMatchCount=Data.Player.NatInt.fromInt(69),
    ~result=Data.Match.Result.BlackWon,
  )
  expect(newRatingWhite)->toBe(100)
})

skip("Tie break scores calculate correctly", () => expect(true)->toBe(true))

open ReactTestingLibrary
open JestDom

let scorePage = (~id) =>
  <LoadTournament tourneyId=id>
    {({tourney: {name: title, _} as tourney, getPlayer, _}) =>
      <PageTourneyScores.ScoreTable size=Expanded tourney getPlayer title />}
  </LoadTournament>->render

test("Snapshot of score table, score test", () => {
  scorePage(~id=TestData.scoreTest.id)->expect->toMatchSnapshot
})

test("Snapshot of score table, simple pairing", () => {
  scorePage(~id=TestData.simplePairing.id)->expect->toMatchSnapshot
})

test("Snapshot of ranks are correct", () => {
  let page = scorePage(~id=TestData.scoreTest.id)
  page->getByTestId(#Str("rank-1.0"))->expect->toHaveTextContent(#Str("TV's Max"))
  page->getByTestId(#Str("rank-2.0"))->expect->toHaveTextContent(#Str("Bobo Professor"))
  page->getByTestId(#Str("rank-3.0"))->expect->toHaveTextContent(#Str("TV's Frank"))
  page->getByTestId(#Str("rank-4.0"))->expect->toHaveTextContent(#Str("Mike Nelson"))
  page->getByTestId(#Str("rank-5.0"))->expect->toHaveTextContent(#Str("Brain Guy"))
  page->getByTestId(#Str("rank-6.0"))->expect->toHaveTextContent(#Str("Clayton Forrester"))
  page->getByTestId(#Str("rank-7.0"))->expect->toHaveTextContent(#Str("Joel Robinson"))
  page->getByTestId(#Str("rank-8.0"))->expect->toHaveTextContent(#Str("Crow T Robot"))
  page->getByTestId(#Str("rank-9.0"))->expect->toHaveTextContent(#Str("Cambot"))
  page->getByTestId(#Str("rank-10.0"))->expect->toHaveTextContent(#Str("Jonah Heston"))
  page->getByTestId(#Str("rank-11.0"))->expect->toHaveTextContent(#Str("Tom Servo"))
  page->getByTestId(#Str("rank-12.0"))->expect->toHaveTextContent(#Str("Pearl Forrester"))
  page->getByTestId(#Str("rank-13.0"))->expect->toHaveTextContent(#Str("Kinga Forrester"))
})

open FireEvent

test("Manually adjusting scores works", () => {
  /* This isn't ideal but routing isn't working for tests I think. */
  let page = render(
    <LoadTournament tourneyId=TestData.scoreTest.id>
      {tournament => <>
        <PageTourneyPlayers tournament />
        <PageTourneyScores tournament />
      </>}
    </LoadTournament>,
  )
  page->getByText(#RegExp(%re("/more options for kinga forrester/i")))->click
  page
  ->getByLabelText(#RegExp(%re("/score adjustment/i")))
  ->change({
    "target": {
      "value": "100",
    },
  })
  page->getByText(#RegExp(%re("/save/i")))->click
  page->getByTestId(#Str("rank-1.0"))->expect->toHaveTextContent(#Str("Kinga Forrester"))
})

test("Pairing players twice displays the correct history", () => {
  let page = render(
    <LoadTournament tourneyId=TestData.simplePairing.id>
      {tournament => <PageRound tournament roundId=1 />}
    </LoadTournament>,
  )
  page->getByText(#RegExp(%re("/add crow t robot/i")))->click
  page->getByText(#RegExp(%re("/add grandy mcmaster/i")))->click
  page->getByText(#RegExp(%re("/match selected/i")))->click
  page->getByText(#RegExp(%re("/^Matches$/")))->click
  page
  ->getByDisplayValue(#Str("Select winner"))
  ->change({
    "target": {
      "value": Data.Match.Result.toString(Data.Match.Result.BlackWon),
    },
  })
  page
  ->getByText(#RegExp(%re("/View information for match: Crow T Robot versus Grandy McMaster/i")))
  ->click
  /* This is a quick heuristic, probably should be more robust */
  page->queryAllByText(#RegExp(%re("/Crow T Robot - Won/i")))->Belt.Array.size->expect->toBe(2)
})
