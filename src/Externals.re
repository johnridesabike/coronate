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
module FileReader = {
  type t;
  [@bs.new] external make: unit => t = "FileReader";
  type onloadArg = {. "target": {. "result": string}};
  [@bs.set] external setOnLoad: (t, onloadArg => unit) => unit = "onload";
  [@bs.send] external readAsText: (t, string) => unit = "readAsText";
};

/*******************************************************************************
  LocalForage

  This divides LocalForage into two functors modules: Map and Object. Once
  an functor creates a module, that module becomes a type-safe way to access
  the store's contents.
 ******************************************************************************/
module LocalForage = {
  type t;
  [@bs.module "localforage"] external localForage: t = "default";
  [@bs.deriving abstract]
  type config = {
    name: string,
    storeName: string,
  };
  let errorHandler = error => {
    Js.Console.error(error);
    Js.String.make(error);
  };
  module type Data = {
    type t;
    /* tip: use bs-json to make these functions */
    let decode: Js.Json.t => t;
    let encode: t => Js.Json.t;
  };
  [@bs.send] external createInstance: (t, config) => t = "createInstance";
  /* `config` is mainly used for setting configs, but can also be used for
     getting info */
  [@bs.send] external configGet: t => config = "config";
  [@bs.send]
  external setItem: (t, string, Js.Json.t) => Js.Promise.t(unit) = "setItem";
  [@bs.send]
  external getItem: (t, string) => Js.Promise.t(Js.Nullable.t(Js.Json.t)) =
    "getItem";
  [@bs.send] external keys: t => Js.Promise.t(Js.Array.t(string)) = "keys";
  [@bs.send] external clear_: t => Js.Promise.t(unit) = "clear";
  /* THIS CLEARS EVERY SINGLE ITEM IN EVERY STORE. */
  let clear = () =>
    clear_(localForage)->FutureJs.fromPromise(Js.Console.error);
  /* Plugin methods */
  [@bs.send]
  external getItems_dict:
    (t, array(string)) => Js.Promise.t(Js.Dict.t(Js.Json.t)) =
    "getItems";
  [@bs.send]
  external getAllItems_dict: t => Js.Promise.t(Js.Dict.t(Js.Json.t)) =
    "getItems";
  [@bs.send]
  external getAllItems_json: t => Js.Promise.t(Js.Json.t) = "getItems";
  [@bs.send]
  external setItems_dict: (t, Js.Dict.t(Js.Json.t)) => Js.Promise.t(unit) =
    "setItems";
  [@bs.send]
  external setItems_json: (t, Js.Json.t) => Js.Promise.t(unit) = "setItems";
  [@bs.send]
  external removeItems: (t, array(string)) => Js.Promise.t(unit) =
    "removeItems";
  /*
     Map is a functor that can take any module that has an `encode` function,
     `decode` function, and a `t` type. The output module will contain a store
     and functions that can access that store and return either the data type or
     `Belt.Map.String` objects.
   */
  module Map =
         (Data: Data, Config: {
                        let name: string;
                        let storeName: string;
                      }) => {
    open Belt;
    open Result;
    let store =
      localForage->createInstance(
        config(~name=Config.name, ~storeName=Config.storeName),
      );
    let getItem = key =>
      getItem(store, key)
      ->FutureJs.fromPromise(errorHandler)
      ->Future.flatMapOk(value =>
          switch (value->Js.Nullable.toOption->Option.map(Data.decode)) {
          | Some(value) => Future.value(Ok(Some(value)))
          | None => Future.value(Ok(None))
          | exception x =>
            Js.Console.error(x);
            Future.value(Error(Js.String.make(x)));
          }
        );
    let setItem = (key, value) => setItem(store, key, Data.encode(value));
    let getKeys = () => keys(store)->FutureJs.fromPromise(Js.Console.error);
    let parseItems = items =>
      items
      ->Js.Dict.entries
      ->Map.String.fromArray
      ->Map.String.map(Data.decode);
    let getItems = keys =>
      getItems_dict(store, keys)
      ->FutureJs.fromPromise(errorHandler)
      ->Future.flatMapOk(items =>
          switch (parseItems(items)) {
          | exception x =>
            Js.Console.error(x);
            Future.value(Error(Js.String.make(x)));
          | x => Future.value(Ok(x))
          }
        );
    let getAllItems = () =>
      getAllItems_dict(store)
      ->FutureJs.fromPromise(errorHandler)
      ->Future.flatMapOk(items =>
          switch (parseItems(items)) {
          | exception x =>
            Js.Console.error(x);
            Future.value(Error(Js.String.make(x)));
          | x => Future.value(Ok(x))
          }
        );
    let setItems = items => {
      items /* this part should probably have better error handling */
      ->Map.String.map(Data.encode)
      ->Map.String.toArray
      ->Js.Dict.fromArray
      ->setItems_dict(store, _)
      ->FutureJs.fromPromise(errorHandler);
    };
    let removeItems = removeItems(store);
  };
  /*
    Obj has a fixed set of fields and is heterogenous; each entry can have its
    own type. The object's structure is definined in the input module's
    `localForage` type, similar to the instances of Map.

    Obj relies on the `getItems` and `setItems` plugin, since accessing
    individual fields isn't possible (right now).
   */
  module Object =
         (
           Data: Data,
           Config: {
             let name: string;
             let storeName: string;
             let default: Data.t;
           },
         ) => {
    open Belt.Result;
    let default = Config.default;
    let store =
      localForage->createInstance(
        config(~name=Config.name, ~storeName=Config.storeName),
      );
    let getItems = () =>
      getAllItems_json(store)
      ->FutureJs.fromPromise(errorHandler)
      ->Future.flatMapOk(items =>
          switch (Data.decode(items)) {
          | exception x =>
            Js.Console.error(x);
            Future.value(Error(Js.String.make(x)));
          | x => Future.value(Ok(x))
          }
        );
    let setItems = items => {
      setItems_json(store, Data.encode(items))
      ->FutureJs.fromPromise(errorHandler);
    };
  };

  /*
   If we were going to make this binding more extensible in the way that
   LocalForage already is, then these may be functors or something else fancy.
   In the meantime, I'm just hard-coding the plugins I need.
   */
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