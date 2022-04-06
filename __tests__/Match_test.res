/*
  Copyright (c) 2022 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open ReactTestingLibrary
open FireEvent

test("Ratings are updated correctly after a match.", () => {
  let page = render(
    <LoadTournament tourneyId=TestData.simplePairing.id>
      {tournament => <PageRound tournament roundId=1 />}
    </LoadTournament>,
  )
  page |> getByText(~matcher=#RegExp(%re("/add newbie mcnewberson/i"))) |> click
  page |> getByText(~matcher=#RegExp(%re("/add grandy mcmaster/i"))) |> click
  page |> getByText(~matcher=#RegExp(%re("/match selected/i"))) |> click
  page
  |> getByDisplayValue(~matcher=#Str("Select winner"))
  |> change(
    ~eventInit={
      "target": {
        "value": Data.Match.Result.toString(Data.Match.Result.WhiteWon),
      },
    },
  )
  page
  |> getByText(
    ~matcher=#RegExp(
      %re("/view information for match: newbie mcnewberson versus grandy mcmaster/i"),
    ),
  )
  |> click
  page
  |> getByTestId(~matcher=#Str("rating-Newbie_McNewberson___"))
  |> JestDom.expect
  |> JestDom.toHaveTextContent(#Str("800 (+40)"))
})
