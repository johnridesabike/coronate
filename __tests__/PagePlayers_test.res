/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Jest
open JestDom
open ReactTestingLibrary
open FireEvent

JestDom.init()

open! Belt

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

describe("The avoid form works", () => {
  test("Adding a player to avoid works", () => {
    let page = render(<Profile id=TestData.newbieMcNewberson.id />)
    page
    ->getByLabelText(#RegExp(%re("/Select a new player to avoid/i")))
    ->change({
      "target": {
        "value": TestData.grandyMcMaster,
      },
    })
    page->getByText(#RegExp(%re("/^add$/i")))->click
    page->getByText(#RegExp(%re("/grandy mcmaster/i")))->expect->toBeInTheDocument
  })

  test("Pathologic: avoiding all players works as expected.", () => {
    let page = render(<Profile id=TestData.newbieMcNewberson.id />)
    for _ in 1 to TestData.players->Map.size->pred {
      page->getByText(#RegExp(%re("/^add$/i")))->click
    }
    // Form disappears when all players are avoided.
    page->getByText(#RegExp(%re("/No players are available to avoid/i")))->expect->toBeInTheDocument
    // Form reappears and auto-selects first player when players are available
    page->getByLabelText(#RegExp(%re("/remove tom servo from avoid list/i")))->click
    page
    ->getByLabelText(#RegExp(%re("/Select a new player to avoid/i")))
    ->expect
    ->toHaveValue(#Str(TestData.tomServo.id->Data.Id.toString))
  })
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
    ->getByLabelText(#RegExp(%re("/rating/i")))
    ->change({
      "target": {
        "value": "77",
      },
    })
    page->getByLabelText(#RegExp(%re("/rating/i")))->expect->toHaveValue(#Num(77))
  })
  skip("Check the rest of the fields", () => expect(true)->toBe(true))
})
