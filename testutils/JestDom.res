/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

type t = Vitest_Types.expected<Dom.element>

@send external toBeInTheDocument: t => unit = "toBeInTheDocument"

@send
external toHaveTextContent: (t, @unwrap [#Str(string) | #RegExp(RegExp.t)]) => unit =
  "toHaveTextContent"

@send
external toHaveValue: (t, @unwrap [#Str(string) | #Arr(array<string>) | #Num(int)]) => unit =
  "toHaveValue"

@send
external toHaveAttribute: (t, string, string) => unit = "toHaveAttribute"

module FireEvent = {
  @module("@testing-library/dom") @scope("fireEvent")
  external click: Dom.element => unit = "click"

  /* Radix tab triggers activate on mousedown, not click. */
  @module("@testing-library/dom") @scope("fireEvent")
  external mouseDown: Dom.element => unit = "mouseDown"

  @module("@testing-library/dom") @scope("fireEvent")
  external change: (Dom.element, {..}) => unit = "change"
}

@module("@testing-library/dom")
external waitForElementToBeRemoved: (unit => Null.t<Dom.element>) => Promise.t<unit> =
  "waitForElementToBeRemoved"
