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
let last = arr => arr[Js.Array.length(arr) - 1];
let splitInHalf = arr => arr |> splitAt(Js.Array.length(arr) / 2);

let github_url = "https://github.com/johnridesabike/coronate";
let license_url = "https://github.com/johnridesabike/coronate/blob/master/LICENSE";
let issues_url = "https://github.com/johnridesabike/coronate/issues/new";

module WebpackAssets = {
  let logo: string = [%bs.raw {| require("./icon-min.svg") |}];
};

module Entities = {
  let nbsp = "\xa0";
  let copy = "\xA9";
};

let hashPath = hashString =>
  hashString |> Js.String.split("/") |> Belt.List.fromArray;

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
      | Success => (<Icons.check />, "notification__success")
      | Warning => (<Icons.alert />, "notification__warning")
      | Error => (<Icons.x />, "notification__error")
      | Generic => (<Icons.info />, "notification__generic")
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

module Panel = {
  [@react.component]
  let make = (~children, ~className="", ~style=ReactDOMRe.Style.make()) => {
    <div className={Cn.make(["utility__panel", className])} style>
      children
    </div>;
  };
};

module PanelContainer = {
  [@react.component]
  let make = (~children, ~className="", ~style=ReactDOMRe.Style.make(())) => {
    <div style className={Cn.make(["utility__panels", className])}> children </div>;
  };
};