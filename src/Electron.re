module ElectronJs = Externals.Electron;

let electron =
  switch (ElectronJs.Window.require) {
  | Some(require) => require("electron")
  | None => None
  };

let ifElectron = fn => {
  switch (electron) {
  | Some(electron) => Some(fn(electron))
  | None => None
  };
};

[@bs.scope "navigator"] [@bs.val] external appVersion: string = "appVersion";
let isWin = Utils.String.includes(appVersion, ~substr="Windows");
let isMac = Utils.String.includes(appVersion, ~substr="Mac");

type os =
  | Windows
  | Mac
  | Other;

let os =
  switch (isWin, isMac) {
  | (true, _) => Windows
  | (_, true) => Mac
  | _ => Other
  };

module IfElectron = {
  [@react.component]
  let make = (~children, ~os as targetOs) => {
    switch (electron, os, targetOs) {
    | (Some(electron), Windows, Windows)
    | (Some(electron), Mac, Mac)
    | (Some(electron), Other, Other) => children(. electron)
    | (_, Windows | Mac | Other, Windows | Mac | Other) => React.null
    };
  };
};

module Window = {
  open ElectronJs.Window;

  let toggleMaximize = window =>
    if (isMaximized(window)) {
      unmaximize(window);
    } else {
      maximize(window);
    };
};

module Event = {
  let openInBrowser = event =>
    ifElectron(electron => {
      ReactEvent.Mouse.preventDefault(event);
      electron
      ->ElectronJs.getShell
      ->ElectronJs.Shell.openExternal(ReactEvent.Mouse.target(event)##href);
    })
    ->ignore;

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
        if (Utils.String.includes(
              target##className,
              ~substr="double-click-control",
            )) {
          let doubleClickAction =
            electron
            ->ElectronJs.getRemote
            ->ElectronJs.Remote.getSystemPreferences
            ->ElectronJs.SystemPreferences.getUserDefault(
                "AppleActionOnDoubleClick",
                "string",
              );
          let window =
            electron->ElectronJs.getRemote->ElectronJs.Remote.getCurrentWindow;
          switch (doubleClickAction) {
          | "Minimize" => ElectronJs.Window.minimize(window)
          | "Maximize" => Window.toggleMaximize(window)
          | _ => ()
          };
        };
      };
    })
    ->ignore;
  };
};
