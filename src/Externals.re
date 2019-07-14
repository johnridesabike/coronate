/*******************************************************************************
  Misc. utilities
 ******************************************************************************/
[@bs.module "ramda"] external ascend: ('b => 'a, 'b, 'b) => int = "ascend";
[@bs.module "ramda"] external descend: ('b => 'a, 'b, 'b) => int = "descend";
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
[@bs.module "nanoid"] external nanoid: unit => string = "default";

/*******************************************************************************
  Browser stuff
 ******************************************************************************/

[@bs.scope "Math"] [@bs.val] external abs: int => int = "abs";
[@bs.scope "Math"] [@bs.val] external absf: float => float = "abs";
[@bs.val] [@bs.scope "window"] external alert: string => unit = "alert";
[@bs.val] [@bs.scope "window"] external confirm: string => bool = "confirm";

/*******************************************************************************
  Numeral
 ******************************************************************************/

module Numeral = {
  type t;
  [@bs.module "numeral"] external numeral: float => t = "default";
  [@bs.send] external format: (t, string) => string = "format";
};

/*******************************************************************************
  LocalForage
 ******************************************************************************/
type localForageOptions = {
  .
  [@bs.meth] "setItems": Data.db_options_js => Js.Promise.t(unit),
  [@bs.meth] "getItems": unit => Js.Promise.t(Data.db_options_js),
};
[@bs.module "localforage"]
external makeOptionsDb:
  {
    .
    "name": string,
    "storeName": string,
  } =>
  localForageOptions =
  "createInstance";

/* This will replace the above code eventually */
module LocalForage = {
  type t('a);
  module Instance = (DataType: {type localForage;}) => {
    type config = {
      .
      "name": string,
      "storeName": string,
    };
    [@bs.module "localforage"]
    external localForage: t(DataType.localForage) = "default";
    [@bs.send]
    external createInstance: (t('a), config) => t('a) = "createInstance";
    let create = (~name, ~storeName) => {
      localForage->createInstance({"name": name, "storeName": storeName});
    };
  };
  [@bs.module "localforage"] external localForage: t('a) = "default";
  [@bs.send]
  external getItem: (t('a), string) => Js.Promise.t(Js.Nullable.t('a)) =
    "getItem";
  [@bs.send]
  external setItem: (t('a), string, 'a) => Js.Promise.t(unit) = "getItem";
  [@bs.send]
  external keys: (t('a), unit) => Js.Promise.t(Js.Array.t(string)) = "keys";
  /* Plugin methods */
  [@bs.send]
  external getItems:
    (t('a), Js.Nullable.t(array(string))) => Js.Promise.t(Js.Dict.t('a)) =
    "getItems";
  [@bs.send]
  external setItems: (t('a), Js.Dict.t('a)) => Js.Promise.t(unit) =
    "setItems";
  [@bs.send]
  external removeItems: (t('a), array(string)) => Js.Promise.t(unit) =
    "removeItems";
};

/*******************************************************************************
  Components
 ******************************************************************************/

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