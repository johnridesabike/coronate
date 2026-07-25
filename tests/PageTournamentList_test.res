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

let renderAsync = async x => {
  let page = render(x)
  await waitForElementToBeRemoved(() => page->queryByText(#Str("No tournaments are added yet.")))
  page
}

testAsync("Creating a new tournament works", async t => {
  let page = await renderAsync(<PageTournamentList />)
  page->getByText(#RegExp(/add tournament/i))->click
  page
  ->getByLabelText(#RegExp(/name:/i))
  ->change({
    "target": {
      "value": "Deep 13 Open",
    },
  })
  page->getByText(#RegExp(/^create$/i))->click
  t->expect(page->getByLabelText(#Str("Delete “Deep 13 Open”")))->toBeInTheDocument
})

testAsync("Deleting a tournament works", async t => {
  let page = await renderAsync(<PageTournamentList />)
  page->getByLabelText(#Str("Delete “Simple Pairing”"))->click
  t->expect(page->queryByText(#RegExp(/simple pairing/)))->Expect.toBeNull
})
