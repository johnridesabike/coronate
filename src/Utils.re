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
[@bs.val] [@bs.scope "window"] external alert: string => unit = "alert";
[@bs.module "nanoid"] external nanoid: unit => string = "default";

let add = (a, b) => a + b;
let arraySum = arr => Js.Array.reduce(add, 0, arr);
let addFloat = (a, b) => a +. b;
let arraySumFloat = arr => Js.Array.reduce(addFloat, 0.0, arr);
let last = arr => arr[Js.Array.length(arr) - 1];
let splitInHalf = arr => arr |> splitAt(Js.Array.length(arr) / 2);

module ExternalComponents = {
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
};

module WebpackAssets = {
  let logo: string = [%bs.raw {| require("./icon-min.svg") |}];
};

module Entities = {
  let nbsp = "\xa0";
  let copy = "\xA9";
};

let hashPath = hashString => hashString |> Js.String.split("/");

let dictToMap = dict => dict |> Js.Dict.entries |> Belt.Map.String.fromArray;
let mapToDict = map => map |> Belt.Map.String.toArray |> Js.Dict.fromArray;

type dtFormat = {. [@bs.meth] "format": Js.Date.t => string};

let dateFormat: dtFormat = [%raw {|
  new Intl.DateTimeFormat(
      "en-US",
      {
          day: "2-digit",
          month: "short",
          year: "numeric"
      }
  )
|}];

let timeFormat: dtFormat = [%raw {|
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
|}];

module DateOrTimeFormat = {
  [@react.component]
  let make = (~dtFormatObj, ~date) =>
    <time dateTime={date |> Js.Date.toISOString}>
      {dtFormatObj##format(date) |> React.string}
    </time>
};


module DateFormat = {
  [@react.component]
  let make = (~date) => <DateOrTimeFormat dtFormatObj=dateFormat date />
}

module DateTimeFormat = {
  [@react.component]
  let make = (~date) => <DateOrTimeFormat dtFormatObj=timeFormat date />
}