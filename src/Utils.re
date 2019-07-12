[@bs.module "ramda"] external ascend: ('b => 'a, 'b, 'b) => int = "ascend";
[@bs.module "ramda"] external descend: ('b => 'a, 'b, 'b) => int = "descend";
// Use `Belt.SortArray` instead pls.
// [@bs.module "ramda"]
// external sort: (('a, 'a) => int, array('a)) => array('a) = "sort";
[@bs.module "ramda"]
external sortWith: (array(('a, 'a) => int), array('a)) => array('a) =
  "sortWith";
[@bs.module "ramda"]
external sortWithF: (array(('a, 'a) => float), array('a)) => array('a) =
  "sortWith";
[@bs.module "ramda"]
external splitAt: (int, array('a)) => (array('a), array('a)) = "splitAt";
[@bs.module "ramda"]
external move: (int, int, array('a)) => array('a) = "move";
[@bs.val] [@bs.scope "window"] external alert: string => unit = "alert";
[@bs.val] [@bs.scope "window"] external confirm: string => bool = "confirm";
[@bs.module "nanoid"] external nanoid: unit => string = "default";

[@bs.scope "Math"] [@bs.val] external abs: int => int = "abs";
[@bs.scope "Math"] [@bs.val] external absf: float => float = "abs";

type numeral = {. [@bs.meth] "format": string => string};
[@bs.module "numeral"] external numeral: float => numeral = "default";

let add = (a, b) => a + b;
let arraySum = arr => Js.Array.reduce(add, 0, arr);
let addFloat = (a, b) => a +. b;
let arraySumFloat = arr => Js.Array.reduce(addFloat, 0.0, arr);
let last = arr => arr[Js.Array.length(arr) - 1];
let splitInHalf = arr => arr |> splitAt(Js.Array.length(arr) / 2);

module VisuallyHidden = {
  [@bs.module "@reach/visually-hidden"] [@react.component]
  external make: (~children: React.element) => React.element = "default";
};
module Dialog = {
  [@bs.module "@reach/dialog"] [@react.component]
  external make:
    (
      ~isOpen: bool,
      ~onDismiss: unit => unit,
      ~children: React.element,
      ~style: ReactDOMRe.Style.t=?
    ) =>
    React.element =
    "Dialog";
};

module ReachTabs = {
  module Tabs = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make:
      (~index: int=?, ~onChange: int => unit=?, ~children: React.element) =>
      React.element =
      "Tabs";
  };
  module TabList = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabList";
  };
  module Tab = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make:
      (~disabled: bool=?, ~children: React.element) => React.element =
      "Tab";
  };
  module TabPanels = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabPanels";
  };
  module TabPanel = {
    [@bs.module "@reach/tabs"] [@react.component]
    external make: (~children: React.element) => React.element = "TabPanel";
  };
};

module WebpackAssets = {
  let logo: string = [%bs.raw {| require("./icon-min.svg") |}];
};

module Entities = {
  let nbsp = "\xa0";
  let copy = "\xA9";
};

let hashPath = hashString =>
  hashString |> Js.String.split("/") |> Belt.List.fromArray;

let dictToMap = dict => dict |> Js.Dict.entries |> Belt.Map.String.fromArray;
let mapToDict = map => map |> Belt.Map.String.toArray |> Js.Dict.fromArray;

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
        ~tooltip,
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