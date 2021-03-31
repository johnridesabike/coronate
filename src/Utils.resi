let github_url: string
let license_url: string
let issues_url: string

type direction<'data, 'field> = (('field, 'field) => int, (. 'data) => 'field, 'data, 'data) => int

let ascend: direction<'data, 'field>

let descend: direction<'data, 'field>

module Array: {
  type t<'a> = array<'a>

  let swap: (t<'a>, int, int) => t<'a>
}

let alert: string => unit

module WebpackAssets: {
  @module("./assets/icon-min.svg") external logo: string = "default"
  //@module("./assets/caution.svg") external caution: string = "default"
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
    ~style: ReactDOMRe.Style.t=?,
  ) => React.element
}

module PanelContainer: {
  @react.component
  let make: (
    ~children: React.element,
    ~className: string=?,
    ~style: ReactDOMRe.Style.t=?,
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
    ~style: ReactDOMRe.Style.t=?,
  ) => React.element
}

module TestId: {
  @react.component
  let make: (~children: React.element, ~testId: string) => React.element
}
