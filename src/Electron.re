/*
   This includes rudimentary bindings for the Electron API as well as utility
   functions that rely on that API.
 */
type t;
type shell;
type window;
type remote;
type systemPreferences;
[@bs.get] external getShell: t => shell = "shell";
[@bs.get] external getRemote: t => remote = "remote";
[@bs.get]
external getSystemPreferences: remote => systemPreferences =
  "systemPreferences";
[@bs.send]
external getUserDefault: (systemPreferences, string, string) => string =
  "getUserDefault";
[@bs.send]
external openExternal: (shell, string) => Repromise.t(unit) = "openExternal";
[@bs.send] external getCurrentWindow: remote => window = "getCurrentWindow";
[@bs.send] external setFullScreen: (window, bool) => unit = "setFullScreen";
[@bs.send] external unmaximize: window => unit = "unmaximize";
[@bs.send] external maximize: window => unit = "maximize";
[@bs.send] external minimize: window => unit = "minimize";
[@bs.send] external close: window => unit = "close";
[@bs.send] external isFocused: window => bool = "isFocused";
[@bs.send] external isFullScreen: window => bool = "isFullScreen";
[@bs.send] external isMaximized: window => bool = "isMaximized";
[@bs.send]
external removeAllListeners: (window, string) => unit = "removeAllListeners";
[@bs.send] external on: (window, string, unit => unit) => unit = "on";

[@bs.scope "window"] [@bs.val]
external windowRequire: Js.Nullable.t(string => Js.Nullable.t(t)) =
  "require";

let electron_ =
  switch (Js.Nullable.toOption(windowRequire)) {
  | Some(require) => require("electron") |> Js.Nullable.toOption
  | None => None
  };

let ifElectron = fn => {
  switch (electron_) {
  | Some(electron) => Some(fn(electron))
  | None => None
  };
};

let currentWindow =
  ifElectron(electron => electron->getRemote->getCurrentWindow);

let openInBrowser = event => {
  ifElectron(electron => {
    event->ReactEvent.Mouse.preventDefault;
    electron->getShell->openExternal(event->ReactEvent.Mouse.target##href);
  })
  |> ignore;
};

let toggleMaximize = window =>
  if (isMaximized(window)) {
    unmaximize(window);
  } else {
    maximize(window);
  };

/*
   https://github.com/electron/electron/issues/16385#issuecomment-453955377
   This function is ugly but it works.
 */
let macOSDoubleClick = event => {
  ifElectron(electron => {
    let target = event->ReactEvent.Mouse.target;
    /* sometimes `className` isn't a string.*/
    if (target##className##includes) {
      /* We don't want double-clicking buttons to (un)maximize. */
      if (target##className |> Js.String.includes("double-click-control")) {
        let doubleClickAction =
          electron
          ->getRemote
          ->getSystemPreferences
          ->getUserDefault("AppleActionOnDoubleClick", "string");
        let window = electron->getRemote->getCurrentWindow;
        switch (doubleClickAction) {
        | "Minimize" => window->minimize
        | "Maximize" => window->toggleMaximize
        | _ => ()
        };
      };
    };
  })
  |> ignore;
};

[@bs.scope "navigator"] [@bs.val] external appVersion: string = "appVersion";
let isWin = appVersion |> Js.String.includes("Windows");
let isMac = appVersion |> Js.String.includes("Mac");

let isElectron =
  switch (ifElectron(_ => true)) {
  | None => false
  | Some(x) => x
  };

type os =
  | Windows
  | Mac;

module IfElectron = {
  [@react.component]
  let make = (~children, ~os) => {
    let isThisTheRightOs =
      switch (os) {
      | Windows => isWin
      | Mac => isMac
      };
    switch (electron_) {
    | Some(electron) =>
      isThisTheRightOs ? children(electron) : ReasonReact.null
    | None => ReasonReact.null
    };
  };
};