/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Vitest
open JestDom
open ReactTestingLibrary

let date = Js.Date.fromString("2000-01-01T13:55:02.573Z")

test("Date format component works", t =>
  t
  ->expect(render(<Utils.DateFormat date />)->getByText(#Str("Jan 01, 2000")))
  ->JestDom.toBeInTheDocument
)

test("Date + time format component works", t =>
  t
  ->expect(
    render(<Utils.DateTimeFormat date timeZone="America/New_York" />)->getByText(
      #Str("Jan 01, 2000, 08:55 AM"),
    ),
  )
  ->toBeInTheDocument
)
