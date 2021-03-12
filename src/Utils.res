open Belt

let github_url = "https://github.com/johnridesabike/coronate"
let license_url = "https://github.com/johnridesabike/coronate/blob/master/LICENSE"
let issues_url = "https://github.com/johnridesabike/coronate/issues/new"

/* Pass a `compare` function to avoid polymorphic compare errors. */
type direction<'data, 'field> = (('field, 'field) => int, (. 'data) => 'field, 'data, 'data) => int
let ascend = (cmp, getter, a, b) => cmp(getter(. a), getter(. b))
let descend = (cmp, getter, a, b) => cmp(getter(. b), getter(. a))

module Array = {
  type t<'a> = array<'a>

  let swap = (arr, idx1, idx2) =>
    switch (arr[idx1], arr[idx2]) {
    | (Some(item1), Some(item2)) =>
      ignore(arr[idx1] = item2)
      ignore(arr[idx2] = item1)
      arr
    | (None, _)
    | (_, None) => arr
    }
}

module String = {
  include Js.String2

  let concat = (l, ~sep) => {
    let rec loop = (acc, l) =>
      switch l {
      | list{s} => s ++ acc
      | list{s, ...l} => loop(sep ++ (s ++ acc), l)
      | list{} => acc
      }
    loop("", Belt.List.reverse(l))
  }

  let includes = (s, ~substr) => Js.String2.includes(s, substr)

  let split = (s, ~on) => Js.String2.split(s, on)
}

let alert = Webapi.Dom.Window.alert(_, Webapi.Dom.window)

module WebpackAssets = {
  @val external require: string => string = "require"
  let logo = require("./assets/icon-min.svg")
  let caution = require("./assets/caution.svg")
}

module Entities = {
  let nbsp = `\xa0`
  let copy = `\xA9`
}

module DateFormat = {
  let formatter = {
    Intl.DateTimeFormat.make(~locales=["en-US"], ~day=TwoDigit, ~month=Short, ~year=Numeric, ())
  }
  @react.component
  let make = (~date) =>
    <time dateTime={Js.Date.toISOString(date)}>
      {formatter->Intl.DateTimeFormat.format(date)->React.string}
    </time>
}

module DateTimeFormat = {
  /* We only have to construct a new formatter if the timeZone is specified.
     Right now the timeZone is just used for testing. In the future, it can be
     passed from a configuration. It's inefficent to construct a fresh formatter
     for every render. */
  let formatter = {
    Intl.DateTimeFormat.make(
      ~locales=["en-US"],
      ~day=TwoDigit,
      ~month=Short,
      ~year=Numeric,
      ~hour=TwoDigit,
      ~minute=TwoDigit,
      (),
    )
  }
  @react.component
  let make = (~date, ~timeZone=?) => {
    let formatter = switch timeZone {
    | None => formatter
    | Some(timeZone) =>
      Intl.DateTimeFormat.make(
        ~locales=["en-US"],
        ~day=TwoDigit,
        ~month=Short,
        ~year=Numeric,
        ~hour=TwoDigit,
        ~minute=TwoDigit,
        ~timeZone,
        (),
      )
    }
    <time dateTime={Js.Date.toISOString(date)}>
      {formatter->Intl.DateTimeFormat.format(date)->React.string}
    </time>
  }
}

/* module PlaceHolderButton = {
     [@react.component]
     let make = () =>
       <button
         className="button-ghost placeholder"
         ariaHidden=true
         disabled=true
       />;
   }; */

module Style = {
  open Css
  let panels = style(list{
    display(#flex),
    flexWrap(#wrap),
    media("screen and (min-width: 600px)", list{flexWrap(#nowrap)}),
  })
  let panel = style(list{marginRight(#px(16))})
}

module Panel = {
  @react.component
  let make = (~children, ~className="", ~style=ReactDOMRe.Style.make()) =>
    <div className={Cn.append(Style.panel, className)} style> children </div>
}

module PanelContainer = {
  @react.component
  let make = (~children, ~className="", ~style=ReactDOMRe.Style.make()) =>
    <div style className={Cn.append(Style.panels, className)}> children </div>
}

module PhotonColors = {
  /*
    This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
  /* Photon Colors RE Variables, based on: */
  /* Photon Colors JS Variables v3.2.0 */

  let magenta_50 = #hex("ff1ad9")
  let magenta_60 = #hex("ed00b5")
  let magenta_70 = #hex("b5007f")
  let magenta_80 = #hex("7d004f")
  let magenta_90 = #hex("440027")

  let purple_30 = #hex("c069ff")
  let purple_40 = #hex("ad3bff")
  let purple_50 = #hex("9400ff")
  let purple_60 = #hex("8000d7")
  let purple_70 = #hex("6200a4")
  let purple_80 = #hex("440071")
  let purple_90 = #hex("25003e")

  let blue_40 = #hex("45a1ff")
  let blue_50 = #hex("0a84ff")
  let blue_50_A30 = #hex("0a84ff4c")
  let blue_60 = #hex("0060df")
  let blue_70 = #hex("003eaa")
  let blue_80 = #hex("002275")
  let blue_90 = #hex("000f40")

  let teal_50 = #hex("00feff")
  let teal_60 = #hex("00c8d7")
  let teal_70 = #hex("008ea4")
  let teal_80 = #hex("005a71")
  let teal_90 = #hex("002d3e")

  let green_50 = #hex("30e60b")
  let green_60 = #hex("12bc00")
  let green_70 = #hex("058b00")
  let green_80 = #hex("006504")
  let green_90 = #hex("003706")

  let yellow_50 = #hex("ffe900")
  let yellow_60 = #hex("d7b600")
  let yellow_70 = #hex("a47f00")
  let yellow_80 = #hex("715100")
  let yellow_90 = #hex("3e2800")

  let red_50 = #hex("ff0039")
  let red_60 = #hex("d70022")
  let red_70 = #hex("a4000f")
  let red_80 = #hex("5a0002")
  let red_90 = #hex("3e0200")

  let orange_50 = #hex("ff9400")
  let orange_60 = #hex("d76e00")
  let orange_70 = #hex("a44900")
  let orange_80 = #hex("712b00")
  let orange_90 = #hex("3e1300")

  let grey_10 = #hex("f9f9fa")
  let grey_10_A10 = #hex("f9f9fa19")
  let grey_10_A20 = #hex("f9f9fa33")
  let grey_10_A40 = #hex("f9f9fa66")
  let grey_10_A60 = #hex("f9f9fa99")
  let grey_10_A80 = #hex("f9f9facc")
  let grey_20 = #hex("ededf0")
  let grey_30 = #hex("d7d7db")
  let grey_40 = #hex("b1b1b3")
  let grey_50 = #hex("737373")
  let grey_60 = #hex("4a4a4f")
  let grey_70 = #hex("38383d")
  let grey_80 = #hex("2a2a2e")
  let grey_90 = #hex("0c0c0d")
  let grey_90_A05 = #hex("0c0c0d0c")
  let grey_90_A10 = #hex("0c0c0d19")
  let grey_90_A20 = #hex("0c0c0d33")
  let grey_90_A30 = #hex("0c0c0d4c")
  let grey_90_A40 = #hex("0c0c0d66")
  let grey_90_A50 = #hex("0c0c0d7f")
  let grey_90_A60 = #hex("0c0c0d99")
  let grey_90_A70 = #hex("0c0c0db2")
  let grey_90_A80 = #hex("0c0c0dcc")
  let grey_90_A90 = #hex("0c0c0de5")

  let ink_70 = #hex("363959")
  let ink_80 = #hex("202340")
  let ink_90 = #hex("0f1126")

  let white_100 = #hex("ffffff")
}

module Notification = {
  type t =
    | Success
    | Warning
    | Error
    | Generic

  module Style = {
    open Css
    let container = style(list{
      display(#flex),
      flexDirection(#row),
      justifyContent(#center),
      minHeight(#px(32)),
      fontSize(#px(13)),
      fontWeight(#num(400)),
      paddingTop(#px(4)),
      paddingBottom(#px(4)),
      margin2(~v=#px(4), ~h=#zero),
      borderRadius(#px(4)),
    })
    let text = style(list{display(#flex), flexDirection(#row), alignItems(#center)})
    let icon = style(list{
      display(#flex),
      flexDirection(#row),
      alignItems(#center),
      flexShrink(1.0),
      margin2(~v=#zero, ~h=#px(4)),
      fontSize(#px(16)),
      cursor(#help),
    })
    let success = style(list{color(PhotonColors.green_90), backgroundColor(PhotonColors.green_50)})
    let warning = style(list{
      color(PhotonColors.yellow_90),
      backgroundColor(PhotonColors.yellow_50),
    })
    let error = style(list{color(PhotonColors.white_100), backgroundColor(PhotonColors.red_60)})
  }
  @react.component
  let make = (
    ~children,
    ~kind=Generic,
    ~tooltip="",
    ~className="",
    ~style=ReactDOMRe.Style.make(),
  ) => {
    let (icon, notifClassName) = switch kind {
    | Success => (<Icons.Check />, Style.success)
    | Warning => (<Icons.Alert />, Style.warning)
    | Error => (<Icons.Alert />, Style.error)
    | Generic => (<Icons.Info />, "")
    }
    <div className={Cn.fromList(list{Style.container, notifClassName, className})} style>
      <div ariaLabel=tooltip className=Style.icon title=tooltip> icon </div>
      <div className=Style.text> children </div>
    </div>
  }
}

module TestId = {
  /* https://twitter.com/fakenickels/status/1189887257030930433 */
  @react.component
  let make = (~children, ~testId) =>
    ReasonReact.cloneElement(children, ~props={"data-testid": testId}, [])
}

@ocaml.doc("
 * Side effects
 ")
let _ = Numeral.registerFormat(
  "fraction",
  Numeral.Format.make(
    ~formatFn=(value, _format, _roundingFunction) => {
      let whole = floor(value)
      let remainder = value -. whole
      let fraction = switch remainder {
      | 0.25 => `¼`
      | 0.5 => `½`
      | 0.75 => `¾`
      | _ => ""
      }
      let stringedWhole = whole == 0.0 && fraction != "" ? "" : Float.toString(whole)
      stringedWhole ++ fraction
    },
    ~regexps=Numeral.RegExps.make(~format=%re("/(1\\/2)/"), ~unformat=%re("/(1\\/2)/")),
    /* This doesn't do anything currently */
    ~unformatFn=value => Float.fromString(value)->Option.getExn,
  ),
)
