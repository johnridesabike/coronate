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

module String: {
  type t = string

  let concat: (list<t>, ~sep: t) => t

  let toLowerCase: t => t

  let includes: (t, ~substr: t) => bool

  let split: (t, ~on: t) => array<t>
}

let alert: string => unit

module WebpackAssets: {
  let logo: string
  let caution: string
}

module Entities: {
  let nbsp: string
  let copy: string
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

module PhotonColors: {
  let magenta_50: [> #hex(string)]
  let magenta_60: [> #hex(string)]
  let magenta_70: [> #hex(string)]
  let magenta_80: [> #hex(string)]
  let magenta_90: [> #hex(string)]

  let purple_30: [> #hex(string)]
  let purple_40: [> #hex(string)]
  let purple_50: [> #hex(string)]
  let purple_60: [> #hex(string)]
  let purple_70: [> #hex(string)]
  let purple_80: [> #hex(string)]
  let purple_90: [> #hex(string)]

  let blue_40: [> #hex(string)]
  let blue_50: [> #hex(string)]
  let blue_50_A30: [> #hex(string)]
  let blue_60: [> #hex(string)]
  let blue_70: [> #hex(string)]
  let blue_80: [> #hex(string)]
  let blue_90: [> #hex(string)]

  let teal_50: [> #hex(string)]
  let teal_60: [> #hex(string)]
  let teal_70: [> #hex(string)]
  let teal_80: [> #hex(string)]
  let teal_90: [> #hex(string)]

  let green_50: [> #hex(string)]
  let green_60: [> #hex(string)]
  let green_70: [> #hex(string)]
  let green_80: [> #hex(string)]
  let green_90: [> #hex(string)]

  let yellow_50: [> #hex(string)]
  let yellow_60: [> #hex(string)]
  let yellow_70: [> #hex(string)]
  let yellow_80: [> #hex(string)]
  let yellow_90: [> #hex(string)]

  let red_50: [> #hex(string)]
  let red_60: [> #hex(string)]
  let red_70: [> #hex(string)]
  let red_80: [> #hex(string)]
  let red_90: [> #hex(string)]

  let orange_50: [> #hex(string)]
  let orange_60: [> #hex(string)]
  let orange_70: [> #hex(string)]
  let orange_80: [> #hex(string)]
  let orange_90: [> #hex(string)]

  let grey_10: [> #hex(string)]
  let grey_10_A10: [> #hex(string)]
  let grey_10_A20: [> #hex(string)]
  let grey_10_A40: [> #hex(string)]
  let grey_10_A60: [> #hex(string)]
  let grey_10_A80: [> #hex(string)]
  let grey_20: [> #hex(string)]
  let grey_30: [> #hex(string)]
  let grey_40: [> #hex(string)]
  let grey_50: [> #hex(string)]
  let grey_60: [> #hex(string)]
  let grey_70: [> #hex(string)]
  let grey_80: [> #hex(string)]
  let grey_90: [> #hex(string)]
  let grey_90_A05: [> #hex(string)]
  let grey_90_A10: [> #hex(string)]
  let grey_90_A20: [> #hex(string)]
  let grey_90_A30: [> #hex(string)]
  let grey_90_A40: [> #hex(string)]
  let grey_90_A50: [> #hex(string)]
  let grey_90_A60: [> #hex(string)]
  let grey_90_A70: [> #hex(string)]
  let grey_90_A80: [> #hex(string)]
  let grey_90_A90: [> #hex(string)]

  let ink_70: [> #hex(string)]
  let ink_80: [> #hex(string)]
  let ink_90: [> #hex(string)]

  let white_100: [> #hex(string)]
}

module Notification: {
  type t =
    | Success
    | Warning
    | Error
    | Generic

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
