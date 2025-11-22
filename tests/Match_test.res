/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Vitest
open ReactTestingLibrary
open JestDom

test("Ratings are updated correctly after a match.", t => {
  let page = render(
    <LoadTournament tourneyId=TestData.simplePairing.id windowDispatch=None>
      {tournament => <PageRound tournament roundId=1 />}
    </LoadTournament>,
  )
  page->getByText(#RegExp(%re("/add newbie mcnewberson/i")))->JestDom.FireEvent.click
  page->getByText(#RegExp(%re("/add grandy mcmaster/i")))->JestDom.FireEvent.click
  page->getByText(#RegExp(%re("/match selected/i")))->JestDom.FireEvent.click
  page
  ->getByDisplayValue(#Str("Select winner"))
  ->FireEvent.change({
    "target": {
      "value": Data.Match.Result.toString(Data.Match.Result.WhiteWon),
    },
  })
  page
  ->getByText(
    #RegExp(%re("/view information for match: newbie mcnewberson versus grandy mcmaster/i")),
  )
  ->FireEvent.click
  t
  ->expect(page->getByTestId(#Str("rating-Newbie_McNewberson___")))
  ->JestDom.toHaveTextContent(#Str("800 (+40)"))
})
