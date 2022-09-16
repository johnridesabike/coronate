/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

type t

@module("@testing-library/react") @val
external render: React.element => t = "render"

@send
external getByText: (
  t,
  @unwrap
  [
    | #Str(string)
    | #RegExp(Js.Re.t)
    | #Func((string, Dom.element) => bool)
  ],
) => Dom.element = "getByText"

@send
external getByTestId: (
  t,
  @unwrap
  [
    | #Str(string)
    | #RegExp(Js.Re.t)
    | #Func((string, Dom.element) => bool)
  ],
) => Dom.element = "getByTestId"

@send
external getByDisplayValue: (
  t,
  @unwrap
  [
    | #Str(string)
    | #RegExp(Js.Re.t)
    | #Func((string, Dom.element) => bool)
  ],
) => Dom.element = "getByDisplayValue"

@send
external getByLabelText: (
  t,
  @unwrap
  [
    | #Str(string)
    | #RegExp(Js.Re.t)
    | #Func((string, Dom.element) => bool)
  ],
) => Dom.element = "getByLabelText"

@send
external queryByText: (
  t,
  @unwrap
  [
    | #Str(string)
    | #RegExp(Js.Re.t)
    | #Func((string, Dom.element) => bool)
  ],
) => Js.Null.t<Dom.element> = "queryByText"

@send
external queryAllByText: (
  t,
  @unwrap
  [
    | #Str(string)
    | #RegExp(Js.Re.t)
    | #Func((string, Dom.element) => bool)
  ],
) => array<Dom.element> = "queryAllByText"
