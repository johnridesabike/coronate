/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

type t<'a>

@val external test: (string, @uncurry unit => unit) => unit = "test"
@val external describe: (string, @uncurry unit => unit) => unit = "describe"
@val external expect: 'a => t<'a> = "expect"
@send external toBe: (t<'a>, 'a) => unit = "toBe"
@send external toEqual: (t<'a>, 'a) => unit = "toEqual"
@send external toThrow: t<@uncurry unit => 'a> => unit = "toThrow"
@send external toContain: (t<array<'a>>, 'a) => unit = "toContain"
@send external toMatchSnapshot: t<'a> => unit = "toMatchSnapshot"
@get external not_: t<'a> => t<'a> = "not"

@scope("test") @val external skip: (string, @uncurry unit => unit) => unit = "skip"
