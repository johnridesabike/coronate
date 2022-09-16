/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

type t = Jest.t<Dom.element>

/**
  You must manually load jest-dom because it extends jest's features as a side-effect.
 */
@val external init: (@as("@testing-library/jest-dom") _, unit) => unit = "require"

@send external toBeInTheDocument: t => unit = "toBeInTheDocument"

@send
external toHaveTextContent: (t, @unwrap [#Str(string) | #RegExp(Js.Re.t)]) => unit =
  "toHaveTextContent"

@send
external toHaveValue: (t, @unwrap [#Str(string) | #Arr(array<string>) | #Num(int)]) => unit =
  "toHaveValue"

@send
external toHaveAttribute: (t, string, string) => unit = "toHaveAttribute"

module FireEvent = {
  @module("@testing-library/dom") @scope("fireEvent")
  external click: Dom.element => unit = "click"

  @module("@testing-library/dom") @scope("fireEvent")
  external change: (Dom.element, Js.t<{..}>) => unit = "change"
}
