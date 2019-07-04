[@bs.val] [@bs.module "./electron-utils.js"]
external ifElectron: 'a => option('b) = "ifElectron";

[@bs.val] [@bs.module "./electron-utils.js"]
external ifElectronOpen: ReactEvent.synthetic('a) => unit = "ifElectronOpen";

[@bs.val] [@bs.module "./electron-utils.js"]
external toggleMaximize: ReactEvent.synthetic('a) => unit = "toggleMaximize";

[@bs.val] [@bs.module "./electron-utils.js"]
external macOSDoubleClick: ReactEvent.synthetic('a) => unit =
  "macOSDoubleClick";

type electronWindow = {
  .
  [@bs.meth] "setFullScreen": (bool) => unit,
  [@bs.meth] "unmaximize": (unit) => unit,
  [@bs.meth] "maximize": (unit) => unit,
  [@bs.meth] "minimize": (unit) => unit,
  [@bs.meth] "close": (unit) => unit
};

[@bs.val] [@bs.module "./electron-utils.js"]
external currentWindow: electronWindow = "currentWindow";

[@bs.scope "navigator"] [@bs.val] external appVersion: string = "appVersion";

let isElectron =
  switch (ifElectron(() => true)) {
  | None => false
  | Some(x) => x
  };

let isMac = appVersion |> Js.String.includes("Windows");
let isWin = appVersion |> Js.String.includes("Mac");

// This is the JSX version of the previous function
module IfElectron = {
  [@react.component]
  let make = (~children, ~onlyWin=false, ~onlyMac=false, ()) => {
    let win = onlyWin ? isWin : true;
    let mac = onlyMac ? isMac : true;
    if ([|isElectron, win, mac|] |> Js.Array.includes(false)) {
      ReasonReact.null;
    } else {
      children;
    };
  };
};