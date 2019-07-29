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
  external setItem:
    (t, string, Js.Json.t) => Repromise.Rejectable.t(unit, exn) =
    "setItem";
  [@bs.send]
  external getItem:
    (t, string) => Repromise.Rejectable.t(Js.Nullable.t(Js.Json.t), exn) =
    "getItem";
  [@bs.send]
  external keys: t => Repromise.Rejectable.t(Js.Array.t(string), exn) =
    "keys";
  [@bs.send]
  external clear_: t => Repromise.Rejectable.t(unit, exn) = "clear";
  /* THIS CLEARS EVERY SINGLE ITEM IN EVERY STORE. */
  let clear = () =>
    clear_(localForage)
    |> Repromise.Rejectable.catch(error => {
         Js.Console.error(error);
         Repromise.resolved();
       });
  /* Plugin methods */
  [@bs.send]
  external getItems_dict:
    (t, array(string)) => Repromise.Rejectable.t(Js.Dict.t(Js.Json.t), exn) =
    "getItems";
  [@bs.send]
  external getAllItems_dict:
    t => Repromise.Rejectable.t(Js.Dict.t(Js.Json.t), exn) =
    "getItems";
  [@bs.send]
  external getAllItems_json: t => Repromise.Rejectable.t(Js.Json.t, exn) =
    "getItems";
  [@bs.send]
  external setItems_dict:
    (t, Js.Dict.t(Js.Json.t)) => Repromise.Rejectable.t(unit, exn) =
    "setItems";
  [@bs.send]
  external setItems_json: (t, Js.Json.t) => Repromise.Rejectable.t(unit, exn) =
    "setItems";
  [@bs.send]
  external removeItems:
    (t, array(string)) => Repromise.Rejectable.t(unit, exn) =
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
      |> Repromise.Rejectable.andThen(value =>
           switch (value->Js.Nullable.toOption->Option.map(Data.decode)) {
           | Some(value) => Repromise.Rejectable.resolved(Some(value))
           | None => Repromise.Rejectable.resolved(None)
           | exception x => Repromise.Rejectable.rejected(x)
           }
         )
      |> Repromise.Rejectable.catch(error => {
           Js.Console.error(error);
           Repromise.resolved(None);
         });
    let setItem = (key, value) => setItem(store, key, Data.encode(value));
    let getKeys = () =>
      keys(store)
      |> Repromise.Rejectable.catch(error => {
           Js.Console.error(error);
           Repromise.resolved([||]);
         });
    let parseItems = items =>
      items
      ->Js.Dict.entries
      ->Map.String.fromArray
      ->Map.String.map(Data.decode);
    let handleError_map = error => {
      Js.Console.error2(
        "Couldn't load database:",
        store |> configGet |> storeNameGet,
      );
      Js.Console.error(error);
      Repromise.resolved(Error(Map.String.empty));
    };
    let getItems = keys =>
      getItems_dict(store, keys)
      |> Repromise.Rejectable.andThen(items =>
           switch (parseItems(items)) {
           | exception x => Repromise.Rejectable.rejected(x)
           | x => Repromise.Rejectable.resolved(Ok(x))
           }
         )
      |> Repromise.Rejectable.catch(handleError_map);
    let getAllItems = () =>
      getAllItems_dict(store)
      |> Repromise.Rejectable.andThen(items =>
           switch (parseItems(items)) {
           | exception x => Repromise.Rejectable.rejected(x)
           | x => Repromise.Rejectable.resolved(Ok(x))
           }
         )
      |> Repromise.Rejectable.catch(handleError_map);
    let setItems = items => {
      items /* this part should probably have better error handling */
      ->Map.String.map(Data.encode)
      ->Map.String.toArray
      ->Js.Dict.fromArray
      |> setItems_dict(store)
      |> Repromise.Rejectable.catch(error => {
           Js.Console.error(error);
           Repromise.resolved();
         });
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
      |> Repromise.Rejectable.andThen(items =>
           switch (Data.decode(items)) {
           | exception x => Repromise.Rejectable.rejected(x)
           | x => Repromise.Rejectable.resolved(Ok(x))
           }
         )
      |> Repromise.Rejectable.catch(error => {
           Js.Console.error(error);
           Repromise.resolved(Error(default));
         });
    let setItems = items => {
      setItems_json(store, Data.encode(items))
      |> Repromise.Rejectable.map(x => Ok(x))
      |> Repromise.Rejectable.catch(error => {
           Js.Console.error(error);
           Repromise.resolved(Error());
         });
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
