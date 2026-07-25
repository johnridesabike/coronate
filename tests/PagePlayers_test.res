/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Vitest
open JestDom
open ReactTestingLibrary
open FireEvent

module Profile = {
  @react.component
  let make = (~id) => {
    let {items: players, dispatch: playersDispatch, loaded} = Db.useAllPlayers()
    let (config, configDispatch) = Db.useConfig()
    switch (Belt.Map.get(players, id), loaded) {
    | (Some(player), true) =>
      <PagePlayers.Profile player players playersDispatch config configDispatch />
    | (None, true) => React.null
    | (_, false) => <div> {React.string("Loading...")} </div>
    }
  }
}

let renderAsync = async x => {
  let page = render(x)
  await waitForElementToBeRemoved(() => page->queryByText(#Str("Loading...")))
  page
}

describe("The avoid form works", () => {
  testAsync("Adding a player to avoid works", async t => {
    let page = await renderAsync(<Profile id=TestData.newbieMcNewberson.id />)
    page
    ->getByLabelText(#RegExp(/Select a new player to avoid/i))
    ->change({
      "target": {
        "value": TestData.grandyMcMaster,
      },
    })
    page->getByText(#RegExp(/^add$/i))->click
    t->expect(page->getByText(#RegExp(/grandy mcmaster/i)))->toBeInTheDocument
  })

  testAsync("Pathologic: avoiding all players works as expected.", async t => {
    let page = await renderAsync(<Profile id=TestData.newbieMcNewberson.id />)
    for _ in 1 to TestData.players->Belt.Map.size - 1 {
      page->getByText(#RegExp(/^add$/i))->click
    }
    // Form disappears when all players are avoided.
    t
    ->expect(page->getByText(#RegExp(/No players are available to avoid/i)))
    ->toBeInTheDocument
    // Form reappears and auto-selects first player when players are available
    page->getByLabelText(#RegExp(/remove tom servo from avoid list/i))->click
    t
    ->expect(page->getByLabelText(#RegExp(/Select a new player to avoid/i)))
    ->toHaveValue(#Str(TestData.tomServo.id->Data.Id.toString))
  })
})

describe("The add player form works", () => {
  module Players = {
    @react.component
    let make = () => {
      let {Db.dispatch: dispatch, loaded, _} = Db.useAllPlayers()
      if loaded {
        <PagePlayers.NewPlayerForm dispatch />
      } else {
        <div> {React.string("Loading...")} </div>
      }
    }
  }
  testAsync("Changing the rating works", async t => {
    let page = await renderAsync(<Players />)
    page
    ->getByLabelText(#RegExp(/rating/i))
    ->change({
      "target": {
        "value": "77",
      },
    })
    t->expect(page->getByLabelText(#RegExp(/rating/i)))->toHaveValue(#Num(77))
  })
})
