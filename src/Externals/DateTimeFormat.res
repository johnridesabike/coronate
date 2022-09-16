/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
// Heavily adapted from
// https://github.com/jimberlage/bs-intl/blob/b1b96201a085bf847793392db27256ce0355edc9/src/Intl_DateTimeFormat.ml

type t

type day = [#numeric | #"2-digit"]
type era = [#long | #short | #narrow]
type formatMatcher = [#basic | #"best fit"]
type hour = [#numeric | #"2-digit"]
type hourCycle = [#h11 | #h12 | #h23 | #h24]
type localeMatcher = [#lookup | #"best fit"]
type minute = [#numeric | #"2-digit"]
type month = [#numeric | #"2-digit" | #long | #short | #narrow]
type second = [#numeric | #"2-digit"]
type timeZoneName = [#long | #short]
type weekday = [#long | #short | #narrow]
type year = [#numeric | #"2-digit"]

@send external format: (t, Js.Date.t) => string = "format"

module Options = {
  type t
  @obj
  external make: (
    ~day: day=?,
    ~era: era=?,
    ~formatMatcher: formatMatcher=?,
    ~hour: hour=?,
    ~hour12: bool=?,
    ~hourCycle: hourCycle=?,
    ~localeMatcher: localeMatcher=?,
    ~minute: minute=?,
    ~month: month=?,
    ~second: second=?,
    ~timeZone: string=?,
    ~timeZoneName: timeZoneName=?,
    ~weekday: weekday=?,
    ~year: year=?,
    unit,
  ) => t = ""
}

@new @scope("Intl")
external make: (array<string>, Options.t) => t = "DateTimeFormat"
