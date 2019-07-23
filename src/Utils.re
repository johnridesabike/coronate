module Tabs = Externals.ReachTabs;
module VisuallyHidden = Externals.VisuallyHidden;
module Dialog = Externals.Dialog;
let splitAt = Externals.splitAt;
let descend = Externals.descend;
let ascend = Externals.ascend;
let alert = Externals.alert;
let nanoid = Externals.nanoid;
let absf = Externals.absf;
let sortWith = Externals.sortWith;
let confirm = Externals.confirm;
let move = Externals.move;

let add = (a, b) => a + b;
let arraySum = arr => Js.Array.reduce(add, 0, arr);
let addFloat = (a, b) => a +. b;
let arraySumFloat = arr => Js.Array.reduce(addFloat, 0.0, arr);
let listSumFloat = list => list->Belt.List.reduce(0.0, addFloat);
let last = arr => arr[Js.Array.length(arr) - 1];
let splitInHalf = arr => arr |> splitAt(Js.Array.length(arr) / 2);

let github_url = "https://github.com/johnridesabike/coronate";
let license_url = "https://github.com/johnridesabike/coronate/blob/master/LICENSE";
let issues_url = "https://github.com/johnridesabike/coronate/issues/new";

module WebpackAssets = {
  let logo: string = [%bs.raw {| require("./assets/icon-min.svg") |}];
  let caution: string = [%bs.raw {| require("./assets/caution.svg") |}];
};

module Entities = {
  let nbsp = "\xa0";
  let copy = "\xA9";
};

let listToReactArray = (list, func) => {
  list
  ->Belt.List.reduce([||], (acc, item) =>
      acc |> Js.Array.concat([|func(item)|])
    )
  ->React.array;
};

module DateTimeFormatComponent =
       (
         Config: {
           let locale: Externals.IntlDateTimeFormat.locale;
           let config: Externals.IntlDateTimeFormat.config_;
         },
       ) => {
  module IDTF = Externals.IntlDateTimeFormat;
  let dtobj = IDTF.make(IDTF.string_of_locale(Config.locale), Config.config);
  [@react.component]
  let make = (~date) =>
    <time dateTime={date |> Js.Date.toISOString}>
      {dtobj->IDTF.format(date)->React.string}
    </time>;
};

module DateFormat =
  DateTimeFormatComponent({
    let locale = `en_us;
    let config =
      Externals.IntlDateTimeFormat.config(
        ~day=`two_digit,
        ~month=`short,
        ~year=`numeric,
        (),
      );
  });

module DateTimeFormat =
  DateTimeFormatComponent({
    let locale = `en_us;
    let config =
      Externals.IntlDateTimeFormat.config(
        ~day=`two_digit,
        ~month=`short,
        ~year=`numeric,
        ~hour=`two_digit,
        ~minute=`two_digit,
        (),
      );
  });

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
  open Css;
  let panels =
    style([
      display(`flex),
      flexWrap(`wrap),
      media("screen and (min-width: 600px)", [flexWrap(`nowrap)]),
    ]);
  let panel = style([marginRight(`px(16))]);
};

module Panel = {
  [@react.component]
  let make = (~children, ~className="", ~style=ReactDOMRe.Style.make()) => {
    <div className={Cn.make([Style.panel, className])} style> children </div>;
  };
};

module PanelContainer = {
  [@react.component]
  let make = (~children, ~className="", ~style=ReactDOMRe.Style.make()) => {
    <div style className={Cn.make([Style.panels, className])}>
      children
    </div>;
  };
};

module PhotonColors = {
  /*
    This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/.
   */
  /* Photon Colors RE Variables, based on: */
  /* Photon Colors JS Variables v3.2.0 */

  let magenta_50 = `hex("ff1ad9");
  let magenta_60 = `hex("ed00b5");
  let magenta_70 = `hex("b5007f");
  let magenta_80 = `hex("7d004f");
  let magenta_90 = `hex("440027");

  let purple_30 = `hex("c069ff");
  let purple_40 = `hex("ad3bff");
  let purple_50 = `hex("9400ff");
  let purple_60 = `hex("8000d7");
  let purple_70 = `hex("6200a4");
  let purple_80 = `hex("440071");
  let purple_90 = `hex("25003e");

  let blue_40 = `hex("45a1ff");
  let blue_50 = `hex("0a84ff");
  let blue_50_A30 = `hex("0a84ff4c");
  let blue_60 = `hex("0060df");
  let blue_70 = `hex("003eaa");
  let blue_80 = `hex("002275");
  let blue_90 = `hex("000f40");

  let teal_50 = `hex("00feff");
  let teal_60 = `hex("00c8d7");
  let teal_70 = `hex("008ea4");
  let teal_80 = `hex("005a71");
  let teal_90 = `hex("002d3e");

  let green_50 = `hex("30e60b");
  let green_60 = `hex("12bc00");
  let green_70 = `hex("058b00");
  let green_80 = `hex("006504");
  let green_90 = `hex("003706");

  let yellow_50 = `hex("ffe900");
  let yellow_60 = `hex("d7b600");
  let yellow_70 = `hex("a47f00");
  let yellow_80 = `hex("715100");
  let yellow_90 = `hex("3e2800");

  let red_50 = `hex("ff0039");
  let red_60 = `hex("d70022");
  let red_70 = `hex("a4000f");
  let red_80 = `hex("5a0002");
  let red_90 = `hex("3e0200");

  let orange_50 = `hex("ff9400");
  let orange_60 = `hex("d76e00");
  let orange_70 = `hex("a44900");
  let orange_80 = `hex("712b00");
  let orange_90 = `hex("3e1300");

  let grey_10 = `hex("f9f9fa");
  let grey_10_A10 = `hex("f9f9fa19");
  let grey_10_A20 = `hex("f9f9fa33");
  let grey_10_A40 = `hex("f9f9fa66");
  let grey_10_A60 = `hex("f9f9fa99");
  let grey_10_A80 = `hex("f9f9facc");
  let grey_20 = `hex("ededf0");
  let grey_30 = `hex("d7d7db");
  let grey_40 = `hex("b1b1b3");
  let grey_50 = `hex("737373");
  let grey_60 = `hex("4a4a4f");
  let grey_70 = `hex("38383d");
  let grey_80 = `hex("2a2a2e");
  let grey_90 = `hex("0c0c0d");
  let grey_90_A05 = `hex("0c0c0d0c");
  let grey_90_A10 = `hex("0c0c0d19");
  let grey_90_A20 = `hex("0c0c0d33");
  let grey_90_A30 = `hex("0c0c0d4c");
  let grey_90_A40 = `hex("0c0c0d66");
  let grey_90_A50 = `hex("0c0c0d7f");
  let grey_90_A60 = `hex("0c0c0d99");
  let grey_90_A70 = `hex("0c0c0db2");
  let grey_90_A80 = `hex("0c0c0dcc");
  let grey_90_A90 = `hex("0c0c0de5");

  let ink_70 = `hex("363959");
  let ink_80 = `hex("202340");
  let ink_90 = `hex("0f1126");

  let white_100 = `hex("ffffff");
};

type notification =
  | Success
  | Warning
  | Error
  | Generic;

module Notification = {
  module Style = {
    open Css;
    let container =
      style([
        display(`flex),
        flexDirection(`row),
        justifyContent(`center),
        minHeight(`px(32)),
        fontSize(`px(13)),
        fontWeight(`num(400)),
        paddingTop(`px(4)),
        paddingBottom(`px(4)),
        margin2(~v=`px(4), ~h=`zero),
        borderRadius(`px(4)),
      ]);
    let text =
      style([display(`flex), flexDirection(`row), alignItems(`center)]);
    let icon =
      style([
        display(`flex),
        flexDirection(`row),
        alignItems(`center),
        flexShrink(1.0),
        margin2(~v=`zero, ~h=`px(4)),
        fontSize(`px(16)),
        cursor(`help),
      ]);
    let success =
      style([
        color(PhotonColors.green_90),
        backgroundColor(PhotonColors.green_50),
      ]);
    let warning =
      style([
        color(PhotonColors.yellow_90),
        backgroundColor(PhotonColors.yellow_50),
      ]);
    let error =
      style([
        color(PhotonColors.white_100),
        backgroundColor(PhotonColors.red_60),
      ]);
  };
  [@react.component]
  let make =
      (
        ~children,
        ~kind=Generic,
        ~tooltip="",
        ~className="",
        ~style=ReactDOMRe.Style.make(),
      ) => {
    let (icon, notifClassName) =
      switch (kind) {
      | Success => (<Icons.Check />, Style.success)
      | Warning => (<Icons.Alert />, Style.warning)
      | Error => (<Icons.X />, Style.error)
      | Generic => (<Icons.Info />, "")
      };
    <div
      className={Cn.make([Style.container, notifClassName, className])} style>
      <div ariaLabel=tooltip className=Style.icon title=tooltip> icon </div>
      <div className=Style.text> children </div>
    </div>;
  };
};

module Router = {
  let hashPath = hashString =>
    hashString |> Js.String.split("/") |> Belt.List.fromArray;

  module HashLink = {
    [@react.component]
    let make = (~children, ~to_, ~onDragStart: ReactEvent.Mouse.t => unit=?) => {
      let {ReasonReact.Router.hash} = ReasonReact.Router.useUrl();
      /* There's a special case for using "/" as a path */
      let isCurrent =
        switch (to_) {
        | "/" => hash === "" || hash === to_
        | _ => hash === to_
        };
      let ariaCurrent = isCurrent ? "true" : "false";
      /*
         Reason hasn't implemented the aria-current attribute yet, we have to
         define it ourselves!
       */
      ReactDOMRe.createElement(
        "a",
        ~props=
          ReactDOMRe.objToDOMProps({
            "aria-current": ariaCurrent,
            "href": "#" ++ to_,
            "onDragStart": onDragStart,
          }),
        [|children|],
      );
    };
  };
};

/*
   Side effects
 */
Numeral.registerFormat(
  "fraction",
  {
    "format": (value, _format, _roundingFunction) => {
      let whole = floor(value);
      let remainder = value -. whole;
      let fraction =
        switch (remainder) {
        | 0.25 => {js|¼|js}
        | 0.5 => {js|½|js}
        | 0.75 => {js|¾|js}
        | _ => ""
        };
      let stringedWhole =
        whole === 0.0 && fraction !== "" ? "" : Js.Float.toString(whole);
      stringedWhole ++ fraction;
    },
    "regexps": {
      "format": [%re "/(1\/2)/"],
      "unformat": [%re "/(1\/2)/"],
    },
    /* This doesn't do anything currently */
    "unformat": value => Js.Float.fromString(value),
  },
);