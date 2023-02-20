/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
let github_url: string
let license_url: string
let issues_url: string
let changelog_url: string

type direction<'data, 'field> = (('field, 'field) => int, (. 'data) => 'field, 'data, 'data) => int

let ascend: direction<'data, 'field>

let descend: direction<'data, 'field>

module Array: {
  type t<'a> = array<'a>

  let swap: (t<'a>, int, int) => t<'a>
}

module WebpackAssets: {
  @module("./assets/icon-min.svg") external logo: string = "default"
  @module("../graphics/bmc-button.svg") external buyMeACoffee: string = "default"
  //@module("../graphics/caution.svg") external caution: string = "default"
}

module DateFormat: {
  @react.component
  let make: (~date: Js.Date.t) => React.element
}

module DateTimeFormat: {
  @react.component
  let make: (~date: Js.Date.t, ~timeZone: string=?) => React.element
}

module Panel: {
  @react.component
  let make: (
    ~children: React.element,
    ~className: string=?,
    ~style: ReactDOM.Style.t=?,
  ) => React.element
}

module PanelContainer: {
  @react.component
  let make: (
    ~children: React.element,
    ~className: string=?,
    ~style: ReactDOM.Style.t=?,
  ) => React.element
}

module Notification: {
  type t = Success | Warning | Error | Generic
  @react.component
  let make: (
    ~children: React.element,
    ~kind: t=?,
    ~tooltip: string=?,
    ~className: string=?,
    ~style: ReactDOM.Style.t=?,
  ) => React.element
}

module TestId: {
  @react.component
  let make: (~children: React.element, ~testId: string) => React.element
}

/**
 * This is copied and modified from re-formality, MIT-licensed.
 * https://github.com/shakacode/re-formality
 */
module FormHelper: {
  type fieldStatus<'outputValue> =
    | Pristine
    | Dirty(result<'outputValue, string>)
  type formStatus<'outputValue> =
    | Editing
    | Submitting('outputValue, 'outputValue => unit)
  type formValidationResult<'output, 'fieldStatuses> =
    | Valid({output: 'output, fieldStatuses: 'fieldStatuses})
    | Invalid({fieldStatuses: 'fieldStatuses})

  let validateFieldOnBlurWithValidator: (
    ~input: 'input,
    ~fieldStatus: fieldStatus<'outputValue>,
    ~validator: 'input => result<'outputValue, string>,
  ) => option<fieldStatus<'outputValue>>

  let exposeFieldResult: fieldStatus<'a> => option<result<'a, string>>

  type state<'input, 'output, 'fieldStatuses> = {
    input: 'input,
    fieldStatuses: 'fieldStatuses,
    formStatus: formStatus<'output>,
  }
}
