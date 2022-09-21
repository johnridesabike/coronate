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

/* I think the Reach Dialog component may have a problem with this? */
test("Creating a new tournament works", () => {
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
  page->getByLabelText(#Str("Delete “Deep 13 Open”"))->expect->toBeInTheDocument
})

test("Deleting a tournament works", () => {
  let page = render(<PageTournamentList />)
  page->getByLabelText(#Str("Delete “Simple Pairing”"))->click
  page->queryByText(#RegExp(%re("/simple pairing/")))->expect->toBe(Js.null)
})
