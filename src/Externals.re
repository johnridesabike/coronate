/*******************************************************************************
  Misc. utilities
 ******************************************************************************/
[@bs.module "nanoid"] external nanoid: unit => string = "default";
[@bs.module "edmonds-blossom"]
external blossom: array((int, int, float)) => array(int) = "default";

module EloRank = {
  type t;
  [@bs.new] [@bs.module "elo-rank"] external make: int => t = "default";
  [@bs.send] external getExpected: (t, int, int) => int = "getExpected";
  [@bs.send]
  external updateRating: (t, int, float, int) => int = "updateRating";
};

/*******************************************************************************
  Browser stuff
 ******************************************************************************/
[@bs.scope "Math"] [@bs.val] external abs: int => int = "abs";
[@bs.scope "Math"] [@bs.val] external absf: float => float = "abs";
[@bs.val] [@bs.scope "window"] external alert: string => unit = "alert";
[@bs.val] [@bs.scope "window"] external confirm: string => bool = "confirm";

module FileReader = {
  type t;
  [@bs.new] external make: unit => t = "FileReader";
  type onloadArg = {. "target": {. "result": string}};
  [@bs.set] external setOnLoad: (t, onloadArg => unit) => unit = "onload";
  [@bs.send] external readAsText: (t, string) => unit = "readAsText";
};

/*******************************************************************************
  LocalForage

  This divides LocalForage into two basic modules: Map and Obj. Vanilla JS
  LocalForage is simple: you can put whatever you want into it, and you get
  whatever comes back out. Dividing it into these modules adds Reason-idiomatic
  structure.
 ******************************************************************************/
module LocalForage = {
  type t;
  [@bs.module "localforage"] external localForage: t = "default";
  type config = {
    .
    "name": string,
    "storeName": string,
  };
  /*
     The Map module must have a homogenous type. In order to use it, you first
     must use its `Instance` functor with any module that has a `localForage`
     type, then use the `make` method to create an instance of the store.

     By requiring a `localForage` type on a module, that allows you to specify
     a custom type structure that may be different than pure Reason. You can
     also just say `type localForage = t;` and store the raw compiled Reason.

     All of Map's methods should work fine with any instance's store.
   */
  module Map = {
    type t('a);

    module Instance = (DataType: {type localForage;}) => {
      [@bs.module "localforage"]
      external localForage: t(DataType.localForage) = "default";
      [@bs.send]
      external createInstance: (t('a), config) => t('a) = "createInstance";
      let make = (~name, ~storeName) => {
        localForage->createInstance({"name": name, "storeName": storeName});
      };
    };

    [@bs.send]
    external getItem: (t('a), string) => Js.Promise.t(Js.Nullable.t('a)) =
      "getItem";
    [@bs.send]
    external setItem: (t('a), string, 'a) => Js.Promise.t(unit) = "setItem";
    [@bs.send]
    external keys: (t('a), unit) => Js.Promise.t(Js.Array.t(string)) =
      "keys";
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
  /*
    Obj has a fixed set of fields and is heterogenous; each entry can have its
    own type. The object's structure is definined in the input module's
    `localForage` type, similar to the instances of Map.

    Like Map.Instance, Obj is a functor that must be combined with another
    module before use.

    Obj relies on the `getItems` and `setItems` plugin, since accessing
    individual fields isn't possible (right now).

   */
  module Obj = {
    type t('a);

    module Instance = (DataType: {type localForage;}) => {
      [@bs.module "localforage"]
      external localForage: t(DataType.localForage) = "default";
      [@bs.send]
      external createInstance: (t('a), config) => t('a) = "createInstance";
      let make = (~name, ~storeName) => {
        localForage->createInstance({"name": name, "storeName": storeName});
      };
    };

    [@bs.send]
    external getItems:
      (t('a), Js.Nullable.t(array(string))) => Js.Promise.t('a) =
      "getItems";
    [@bs.send]
    external setItems: (t('a), 'a) => Js.Promise.t(unit) = "setItems";
  };

  module Plugins = {
    [@bs.module "localforage-getitems"]
    external getItemsPrototype: t => unit = "extendPrototype";
    [@bs.module "localforage-removeitems"]
    external removeItemsPrototype: t => unit = "extendPrototype";
    [@bs.module "localforage-setitems"]
    external setItemsPrototype: t => unit = "extendPrototype";

    let loadGetItems = () => getItemsPrototype(localForage);
    let loadSetItems = () => setItemsPrototype(localForage);
    let loadRemoveItems = () => removeItemsPrototype(localForage);
  };
};

LocalForage.Plugins.loadGetItems();
LocalForage.Plugins.loadSetItems();
LocalForage.Plugins.loadRemoveItems();

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

module IntlDateTimeFormat = {
  open Belt;
  type t;
  type locale = [ | `en_us];
  let string_of_locale = locale =>
    switch (locale) {
    | `en_us => "en-US"
    };
  type numbered = [ | `two_digit];
  let string_of_numbered = x =>
    switch (x) {
    | `two_digit => "2-digit"->Js.Undefined.return
    };
  type month = [ | `short];
  let string_of_month = month =>
    switch (month) {
    | `short => "short"->Js.Undefined.return
    };
  type year = [ | `numeric];
  let string_of_year = year =>
    switch (year) {
    | `numeric => "numeric"->Js.Undefined.return
    };
  [@bs.deriving abstract]
  type config_ = {
    day: Js.undefined(string),
    month: Js.undefined(string),
    year: Js.undefined(string),
    hour: Js.undefined(string),
    minute: Js.undefined(string),
  };
  let config = (~day=?, ~month=?, ~year=?, ~hour=?, ~minute=?, ()) =>
    config_(
      ~day=day->Option.mapWithDefault(Js.undefined, string_of_numbered),
      ~month=month->Option.mapWithDefault(Js.undefined, string_of_month),
      ~year=year->Option.mapWithDefault(Js.undefined, string_of_year),
      ~hour=hour->Option.mapWithDefault(Js.undefined, string_of_numbered),
      ~minute=minute->Option.mapWithDefault(Js.undefined, string_of_numbered),
    );
  [@bs.new] external make: (string, config_) => t = "Intl.DateTimeFormat";
  [@bs.send] external format: (t, Js.Date.t) => string = "format";
};