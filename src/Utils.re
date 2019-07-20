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
let sortWithF = Externals.sortWithF;
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

let hashPath = hashString =>
  hashString |> Js.String.split("/") |> Belt.List.fromArray;

let listToReactArray = (list, func) => {
  list
  ->Belt.List.reduce([||], (acc, item) =>
      acc|>Js.Array.concat([|func(item)|])
    )
  ->React.array;
};

type dtFormat = {. [@bs.meth] "format": Js.Date.t => string};

let dateFormat: dtFormat = [%raw
  {|
  new Intl.DateTimeFormat(
      "en-US",
      {
          day: "2-digit",
          month: "short",
          year: "numeric"
      }
  )
|}
];

let timeFormat: dtFormat = [%raw
  {|
  new Intl.DateTimeFormat(
      "en-US",
      {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
      }
  )
|}
];

module DateOrTimeFormat = {
  [@react.component]
  let make = (~dtFormatObj, ~date) =>
    <time dateTime={date |> Js.Date.toISOString}>
      {dtFormatObj##format(date) |> React.string}
    </time>;
};

module DateFormat = {
  [@react.component]
  let make = (~date) => <DateOrTimeFormat dtFormatObj=dateFormat date />;
};

module DateTimeFormat = {
  [@react.component]
  let make = (~date) => <DateOrTimeFormat dtFormatObj=timeFormat date />;
};

/* module PlaceHolderButton = {
     [@react.component]
     let make = () =>
       <button
         className="button-ghost placeholder"
         ariaHidden=true
         disabled=true
       />;
   }; */

type notification =
  | Success
  | Warning
  | Error
  | Generic;

module Notification = {
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
      | Success => (<Icons.Check />, "notification__success")
      | Warning => (<Icons.Alert />, "notification__warning")
      | Error => (<Icons.X />, "notification__error")
      | Generic => (<Icons.Info />, "notification__generic")
      };
    <div
      className={Cn.make(["notification", notifClassName, className])} style>
      <div ariaLabel=tooltip className="notifcation__icon" title=tooltip>
        icon
      </div>
      <div className="notification__text"> children </div>
    </div>;
  };
};

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