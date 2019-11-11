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
external openExternal: (shell, string) => Js.Promise.t(unit) = "openExternal";
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
external removeAllListeners:
  (
    window,
    [@bs.string] [
      | [@bs.as "enter-full-screen"] `EnterFullScreen
      | [@bs.as "leave-full-screen"] `LeaveFullScreen
      | [@bs.as "blur"] `Blur
      | [@bs.as "focus"] `Focus
      | [@bs.as "maximize"] `Maximize
      | [@bs.as "unmaximize"] `Unmaximize
    ]
  ) =>
  unit =
  "removeAllListeners";
[@bs.send]
external on:
  (
    window,
    [@bs.string] [
      | [@bs.as "enter-full-screen"] `EnterFullScreen
      | [@bs.as "leave-full-screen"] `LeaveFullScreen
      | [@bs.as "blur"] `Blur
      | [@bs.as "focus"] `Focus
      | [@bs.as "maximize"] `Maximize
      | [@bs.as "unmaximize"] `Unmaximize
    ],
    unit => unit
  ) =>
  unit =
  "on";

[@bs.scope "window"] [@bs.val]
external windowRequire: option(string => option(t)) = "require";

let electron =
  switch (windowRequire) {
  | Some(require) => require("electron")
  | None => None
  };

let ifElectron = fn => {
  switch (electron) {
  | Some(electron) => Some(fn(electron))
  | None => None
  };
};

let currentWindow =
  ifElectron(electron => electron->getRemote->getCurrentWindow);

let openInBrowser = event => {
  ifElectron(electron => {
    ReactEvent.Mouse.preventDefault(event);
    electron->getShell->openExternal(ReactEvent.Mouse.target(event)##href);
  })
  ->ignore;
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
    let target = ReactEvent.Mouse.target(event);
    /* sometimes `className` isn't a string.*/
    if (target##className##includes) {
      /* We don't want double-clicking buttons to (un)maximize. */
      if (Js.String2.includes(target##className, "double-click-control")) {
        let doubleClickAction =
          electron
          ->getRemote
          ->getSystemPreferences
          ->getUserDefault("AppleActionOnDoubleClick", "string");
        let window = electron->getRemote->getCurrentWindow;
        switch (doubleClickAction) {
        | "Minimize" => minimize(window)
        | "Maximize" => toggleMaximize(window)
        | _ => ()
        };
      };
    };
  })
  ->ignore;
};

[@bs.scope "navigator"] [@bs.val] external appVersion: string = "appVersion";
let isWin = Js.String2.includes(appVersion, "Windows");
let isMac = Js.String2.includes(appVersion, "Mac");

let isElectron =
  switch (electron) {
  | None => false
  | Some(_) => true
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
    switch (electron) {
    | Some(electron) => isThisTheRightOs ? children(electron) : React.null
    | None => React.null
    };
  };
};