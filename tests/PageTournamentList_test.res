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

/* I think the Reach Dialog component may have a problem with this? */
test("Creating a new tournament works", t => {
  let page = render(<PageTournamentList />)
  page->getByText(#RegExp(%re("/add tournament/i")))->click
  page
  ->getByLabelText(#RegExp(%re("/name:/i")))
  ->change({
    "target": {
      "value": "Deep 13 Open",
    },
  })
  page->getByText(#RegExp(%re("/create/i")))->click
  t->expect(page->getByLabelText(#Str("Delete “Deep 13 Open”")))->toBeInTheDocument
})

test("Deleting a tournament works", t => {
  let page = render(<PageTournamentList />)
  page->getByLabelText(#Str("Delete “Simple Pairing”"))->click
  t->expect(page->queryByText(#RegExp(%re("/simple pairing/"))))->Expect.toBeNull
})
