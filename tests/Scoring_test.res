/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Vitest
open Data.Player
open ReactTestingLibrary
open JestDom
open FireEvent

let newb = TestData.newbieMcNewberson
let master = TestData.grandyMcMaster

test("K Factor is calculated correctly", t => {
  let masterKFactor = Data.Ratings.EloRank.getKFactor(
    ~matchCount=master.matchCount,
    ~rating=master.rating,
  )
  t->expect(masterKFactor)->Expect.toBe(10)
})

test("Ratings are calculated correctly", t => {
  let calcRatingsForPair =
    Data.Ratings.calcNewRatings(
      ~whiteRating=newb.rating,
      ~blackRating=master.rating,
      ~whiteMatchCount=newb.matchCount,
      ~blackMatchCount=master.matchCount,
      ...
    )
  let newbWon = calcRatingsForPair(~result=Data.Match.Result.WhiteWon)
  // not really a good example for this next one because they don't change:
  let masterWon = calcRatingsForPair(~result=Data.Match.Result.BlackWon)
  let draw = calcRatingsForPair(~result=Data.Match.Result.Draw)
  t->expect(newbWon)->Expect.toEqual((840, 2590))
  t->expect(masterWon)->Expect.toEqual((800, 2600))
  t->expect(draw)->Expect.toEqual((820, 2595))
})

test("Ratings never go below 100", t => {
  // The white player begins with a rating of 100 and loses.
  let (newRatingWhite, _) = Data.Ratings.calcNewRatings(
    ~whiteRating=100,
    ~blackRating=100,
    ~whiteMatchCount=Data.Player.NatInt.fromInt(69),
    ~blackMatchCount=Data.Player.NatInt.fromInt(69),
    ~result=Data.Match.Result.BlackWon,
  )
  t->expect(newRatingWhite)->Expect.toBe(100)
})

let scorePage = (~id) =>
  <LoadTournament tourneyId=id windowDispatch=None>
    {({tourney: {name: title, _} as tourney, getPlayer, _}) =>
      <PageTourneyScores.ScoreTable size=Expanded tourney getPlayer title />}
  </LoadTournament>->render

test("Snapshot of score table, score test", t => {
  t->expect(scorePage(~id=TestData.scoreTest.id))->Expect.toMatchSnapshot
})

test("Snapshot of score table, simple pairing", t => {
  t->expect(scorePage(~id=TestData.simplePairing.id))->Expect.toMatchSnapshot
})

test("Snapshot of ranks are correct", t => {
  let page = scorePage(~id=TestData.scoreTest.id)
  t->expect(page->getByTestId(#Str("rank-1.0")))->toHaveTextContent(#Str("TV's Max"))
  t->expect(page->getByTestId(#Str("rank-2.0")))->toHaveTextContent(#Str("Bobo Professor"))
  t->expect(page->getByTestId(#Str("rank-3.0")))->toHaveTextContent(#Str("TV's Frank"))
  t->expect(page->getByTestId(#Str("rank-4.0")))->toHaveTextContent(#Str("Mike Nelson"))
  t->expect(page->getByTestId(#Str("rank-5.0")))->toHaveTextContent(#Str("Brain Guy"))
  t->expect(page->getByTestId(#Str("rank-6.0")))->toHaveTextContent(#Str("Clayton Forrester"))
  t->expect(page->getByTestId(#Str("rank-7.0")))->toHaveTextContent(#Str("Joel Robinson"))
  t->expect(page->getByTestId(#Str("rank-8.0")))->toHaveTextContent(#Str("Crow T Robot"))
  t->expect(page->getByTestId(#Str("rank-9.0")))->toHaveTextContent(#Str("Cambot"))
  t->expect(page->getByTestId(#Str("rank-10.0")))->toHaveTextContent(#Str("Jonah Heston"))
  t->expect(page->getByTestId(#Str("rank-11.0")))->toHaveTextContent(#Str("Tom Servo"))
  t->expect(page->getByTestId(#Str("rank-12.0")))->toHaveTextContent(#Str("Pearl Forrester"))
  t->expect(page->getByTestId(#Str("rank-13.0")))->toHaveTextContent(#Str("Kinga Forrester"))
})

test("Manually adjusting scores works", t => {
  /* This isn't ideal but routing isn't working for tests I think. */
  let page = render(
    <LoadTournament tourneyId=TestData.scoreTest.id windowDispatch=None>
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
  t->expect(page->getByTestId(#Str("rank-1.0")))->toHaveTextContent(#Str("Kinga Forrester"))
})

test("Pairing players twice displays the correct history", t => {
  let page = render(
    <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
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
  t
  ->expect(page->queryAllByText(#RegExp(%re("/Crow T Robot - Won/i")))->Belt.Array.size)
  ->Expect.toBe(2)
})
