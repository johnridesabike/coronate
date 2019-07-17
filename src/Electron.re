/*
  This includes rudimentary bindings for the Electron API as well as utility
  functions that rely on that API.
*/
type shell;
[@bs.send]
external openExternal: (shell, string) => Js.Promise.t(unit) = "openExternal";
type systemPreferences;
[@bs.send]
external getUserDefault: (systemPreferences, string, string) => string =
  "getUserDefault";
type remote = {. "systemPreferences": systemPreferences};
type t = {
  .
  "shell": shell,
  "remote": remote,
};
type window;
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

let electron: option(t) = [%raw
  "window.require ? window.require(\"electron\") : undefined"
];

let ifElectron = fn => {
  switch (electron) {
  | Some(electron) => Some(fn(electron))
  | None => None
  };
};

let currentWindow = ifElectron(electron => electron##remote->getCurrentWindow);

let openInBrowser = event => {
  let _ =
    ifElectron(electron => {
      event->ReactEvent.Mouse.preventDefault;
      electron##shell->openExternal(event->ReactEvent.Mouse.target##href);
    });
  ();
};

let toggleMaximize = win =>
  if (!win->isMaximized) {
    win->maximize;
  } else {
    win->unmaximize;
  };

/*
   https://github.com/electron/electron/issues/16385#issuecomment-453955377
 */
let macOSDoubleClick = event => {
  let _ =
    ifElectron(electron => {
      let target = event->ReactEvent.Mouse.target;
      /* sometimes `className` isn't a string.*/
      if (target##className##includes) {
        /* We don't want double-clicking buttons to (un)maximize. */
        if (target##className |> Js.String.includes("double-click-control")) {
          let doubleClickAction =
            electron##remote##systemPreferences
            ->getUserDefault("AppleActionOnDoubleClick", "string");
          let window = electron##remote->getCurrentWindow;
          switch (doubleClickAction) {
          | "Minimize" => window->minimize
          | "Maximize" => window->toggleMaximize
          | _ => ()
          };
        };
      };
    });
  ();
};

[@bs.scope "navigator"] [@bs.val] external appVersion: string = "appVersion";
let isWin = appVersion -> Js.String.includes("Windows");
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
    switch (electron) {
    | Some(electron) =>
      isThisTheRightOs ? children(electron) : ReasonReact.null
    | None => ReasonReact.null
    };
  };
};