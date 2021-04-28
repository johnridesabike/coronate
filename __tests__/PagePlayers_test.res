/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open ReactTestingLibrary
open JestDom
open FireEvent

open Belt

module Profile = {
  @react.component
  let make = (~id) => {
    let {items: players, dispatch: playersDispatch, _} = Db.useAllPlayers()
    let (config, configDispatch) = Db.useConfig()
    switch Map.get(players, id) {
    | Some(player) => <PagePlayers.Profile player players playersDispatch config configDispatch />
    | None => React.null
    }
  }
}

test("Adding a player to avoid works", () => {
  let page = render(<Profile id=TestData.newbieMcNewberson.id />)

  page
  |> getByLabelText(~matcher=#RegExp(%bs.re("/Select a new player to avoid/i")))
  |> change(
    ~eventInit={
      "target": {
        "value": TestData.grandyMcMaster,
      },
    },
  )

  page |> getByText(~matcher=#RegExp(%bs.re("/^add$/i"))) |> click

  page |> getByText(~matcher=#RegExp(%bs.re("/grandy mcmaster/i"))) |> expect |> toBeInTheDocument
})

describe("The add player form works", () => {
  module Players = {
    @react.component
    let make = () => {
      let {Db.dispatch: dispatch, _} = Db.useAllPlayers()
      <PagePlayers.NewPlayerForm dispatch />
    }
  }
  test("Changing the rating works", () => {
    let page = render(<Players />)
    page
    |> getByLabelText(~matcher=#RegExp(%bs.re("/rating/i")))
    |> change(
      ~eventInit={
        "target": {
          "value": "77",
        },
      },
    )
    page |> getByLabelText(~matcher=#RegExp(%bs.re("/rating/i"))) |> expect |> toHaveValue(#Num(77))
  })
  Skip.test("Check the rest of the fields", () => Expect.expect(true) |> Expect.toBe(true))
})
