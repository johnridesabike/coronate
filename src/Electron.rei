let electron: option(Externals.Electron.t);

let ifElectron: (Externals.Electron.t => 'a) => option('a);

type os =
  | Windows
  | Mac
  | Other;

let os: os;

module IfElectron: {
  [@react.component]
  let make:
    (~children: (. Externals.Electron.t) => React.element, ~os: os) =>
    React.element;
};

module Window: {let toggleMaximize: Externals.Electron.Window.t => unit;};

module Event: {
  let macOSDoubleClick: ReactEvent.Mouse.t => unit;
  let openInBrowser: ReactEvent.Mouse.t => unit;
};
