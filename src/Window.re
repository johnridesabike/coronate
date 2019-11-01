/*
   This contains all of the logic and components that make up the window,
   including titlebar, default sidebar, and layout.
 */
open Belt;
open Utils.Router;
open Electron;

let global_title = "Coronate";

let formatTitle = title => {
  Js.String.length(title) === 0
    ? global_title : [title, global_title] |> String.concat(" - ");
};

type windowState = {
  isBlur: bool,
  isDialogOpen: bool,
  isFullScreen: bool,
  isMaximized: bool,
  isSidebarOpen: bool,
  title: string,
};

let initialWinState = {
  isBlur: false,
  isDialogOpen: false,
  isFullScreen: false,
  isMaximized: false,
  isSidebarOpen: true,
  title: "",
};

type action =
  | SetBlur(bool)
  | SetDialog(bool)
  | SetFullScreen(bool)
  | SetMaximized(bool)
  | SetSidebar(bool)
  | SetTitle(string);

let windowReducer = (state, action) => {
  switch (action) {
  | SetBlur(value) => {...state, isBlur: value}
  | SetTitle(value) => {...state, title: value}
  | SetDialog(value) => {...state, isDialogOpen: value}
  | SetFullScreen(value) => {...state, isFullScreen: value}
  | SetMaximized(value) => {...state, isMaximized: value}
  | SetSidebar(value) => {...state, isSidebarOpen: value}
  };
};

module Context = {
  let initialState = (initialWinState, (_: action) => ());
  let windowContext = React.createContext(initialState);
  module Provider = {
    let makeProps = (~value, ~children, ()) => {
      "value": value,
      "children": children,
    };
    let make = React.Context.provider(windowContext);
  };
};

let useWindowContext = () => {
  React.useContext(Context.windowContext);
};

module About = {
  [@bs.val]
  external version: option(string) = "process.env.REACT_APP_VERSION";
  [@react.component]
  let make = () => {
    <article
      style={ReactDOMRe.Style.make(
        ~display="flex",
        ~justifyContent="space-between",
        ~width="100%",
        (),
      )}>
      <div
        style={ReactDOMRe.Style.make(
          ~flex="0 0 48%",
          ~textAlign="center",
          (),
        )}>
        <img src=Utils.WebpackAssets.logo height="196" width="196" alt="" />
      </div>
      <div style={ReactDOMRe.Style.make(~flex="0 0 48%", ())}>
        <h1
          className="title"
          style={ReactDOMRe.Style.make(~textAlign="left", ())}>
          {React.string("Coronate")}
        </h1>
        {switch (version) {
         | Some(version) =>
           <p> {React.string("Version ")} {React.string(version)} </p>
         | None => React.null
         }}
        <p>
          {React.string(
             [
               "Copyright ",
               Utils.Entities.copy,
               " 2019 John",
               Utils.Entities.nbsp,
               "Jackson",
             ]
             |> String.concat(""),
           )}
        </p>
        <p> {React.string("Coronate is free software.")} </p>
        <p>
          <a href=Utils.github_url onClick=openInBrowser>
            {React.string("Source code is available")}
          </a>
          <br />
          {React.string(" under the ")}
          <a href=Utils.license_url onClick=openInBrowser>
            {React.string("AGPL v3.0 license")}
          </a>
          {React.string(".")}
        </p>
      </div>
    </article>;
  };
};

module MSWindowsControls = {
  module Style = {
    open Css;
    open Utils.PhotonColors;
    let container =
      style([
        height(`calc((`add, `percent(100.0), `px(8)))),
        margin(`px(-4)),
      ]);
    let button =
      style([
        color(grey_90),
        fontSize(`px(11)),
        textAlign(`center),
        width(`px(46)),
        height(`percent(100.0)),
        borderRadius(`zero),
        backgroundColor(`transparent),
        width(`px(46)),
        minWidth(`px(46)),
        focus([borderStyle(`none), boxShadow(`none), outlineStyle(`none)]),
        /* a hack to get around specficity */
        selector(" svg", [display(`inline)]),
      ]);
    let svg =
      style([display(`inline), unsafe("shapeRendering", "crispEdges")]);
    let close = style([hover([backgroundColor(red_50)])]);
  };
  [@react.component]
  let make = (~state, ~electron) => {
    let window = electron |> getRemote |> getCurrentWindow;
    <div className=Style.container>
      <button
        className={Cn.make([Style.button, "button-ghost1"])}
        onClick={_ => minimize(window)}>
        <Icons.Minimize className=Style.svg />
      </button>
      {switch (state.isFullScreen, state.isMaximized) {
       | (true, true)
       | (true, false) =>
         <button
           className=Style.button onClick={_ => setFullScreen(window, false)}>
           <Icons.Unfullscreen className=Style.svg />
         </button>
       | (false, true) =>
         <button className=Style.button onClick={_ => unmaximize(window)}>
           <Icons.Restore className=Style.svg />
         </button>
       | (false, false) =>
         <button className=Style.button onClick={_ => maximize(window)}>
           <Icons.Maximize className=Style.svg />
         </button>
       }}
      <button
        className={Cn.make([Style.button, Style.close])}
        onClick={_ => close(window)}>
        <Icons.Close className=Style.svg />
      </button>
    </div>;
  };
};

module TitleBar = {
  module Style = {
    open Css;
    open Utils.PhotonColors;
    let button = style([color(grey_90)]);
  };
  let isElectronMac = isMac && isElectron;
  let toolbarClasses =
    Cn.make([
      Style.button,
      Cn.ifTrue("macos-button-toolbar", isElectronMac),
      Cn.ifTrue("button-ghost", !isElectronMac),
    ]);
  [@react.component]
  let make = (~state, ~dispatch) => {
    <header
      className={Cn.make([
        "app__header",
        "double-click-control",
        Cn.ifTrue(
          "traffic-light-padding",
          isElectronMac && !state.isFullScreen,
        ),
      ])}
      onDoubleClick=macOSDoubleClick>
      <div>
        <IfElectron os=Windows>
          {_ =>
             <span
               style={ReactDOMRe.Style.make(
                 ~alignItems="center",
                 ~display="inline-flex",
                 ~marginLeft="4px",
                 ~marginRight="8px",
                 (),
               )}>
               <img
                 src=Utils.WebpackAssets.logo
                 alt=""
                 height="16"
                 width="16"
               />
             </span>}
        </IfElectron>
        <button
          className=toolbarClasses
          onClick={_ => dispatch(SetSidebar(!state.isSidebarOpen))}>
          <Icons.Sidebar />
          <Utils.VisuallyHidden>
            {React.string("Toggle sidebar")}
          </Utils.VisuallyHidden>
        </button>
        <button
          className=toolbarClasses onClick={_ => dispatch(SetDialog(true))}>
          <Icons.Help />
          <Utils.VisuallyHidden>
            {React.string("About Coronate")}
          </Utils.VisuallyHidden>
        </button>
      </div>
      <div
        className={Cn.make([
          "body-20",
          "double-click-control",
          Cn.ifTrue("disabled", state.isBlur),
        ])}
        style={ReactDOMRe.Style.make(
          ~left="0",
          ~marginLeft="auto",
          ~marginRight="auto",
          ~position="absolute",
          ~right="0",
          ~textAlign="center",
          ~width="50%",
          (),
        )}>
        {React.string(formatTitle(state.title))}
      </div>
      <IfElectron os=Windows>
        {electron => <MSWindowsControls electron state />}
      </IfElectron>
    </header>;
  };
};

[@react.component]
let make = (~children, ~className) => {
  let (state, dispatch) = React.useReducer(windowReducer, initialWinState);
  let title = state.title;
  React.useEffect1(
    () => {
      Webapi.Dom.(
        document
        ->Document.asHtmlDocument
        ->Option.map(__x => HtmlDocument.setTitle(__x, formatTitle(title)))
        ->ignore
      );
      None;
    },
    [|title|],
  );
  React.useEffect1(
    () =>
      ifElectron(electron => {
        let win = electron |> getRemote |> getCurrentWindow;
        /* This will ensure that stale event listeners aren't persisted.
           That typically won't be relevant to production builds, but
           in a dev environment, where the page reloads frequently,
           stale listeners will accumulate. Note that this can cause
           side effects if other listeners are added elsewhere. */
        let unregisterListeners = () => {
          removeAllListeners(win, `EnterFullScreen);
          removeAllListeners(win, `LeaveFullScreen);
          removeAllListeners(win, `Blur);
          removeAllListeners(win, `Focus);
          removeAllListeners(win, `Maximize);
          removeAllListeners(win, `Unmaximize);
        };
        unregisterListeners();
        on(win, `EnterFullScreen, () => dispatch(SetFullScreen(true)));
        on(win, `LeaveFullScreen, () => dispatch(SetFullScreen(false)));
        on(win, `Maximize, () => dispatch(SetMaximized(true)));
        on(win, `Unmaximize, () => dispatch(SetMaximized(false)));
        on(win, `Blur, () => dispatch(SetBlur(true)));
        on(win, `Focus, () => dispatch(SetBlur(false)));
        dispatch(SetBlur(!isFocused(win)));
        dispatch(SetFullScreen(isFullScreen(win)));
        dispatch(SetMaximized(isMaximized(win)));
        /* I don't think this ever really fires, but can it hurt? */
        unregisterListeners;
      }),
    [|dispatch|],
  );
  <div
    className={Cn.make([
      className,
      "open-sidebar"->Cn.ifTrue(state.isSidebarOpen),
      "closed-sidebar"->Cn.ifTrue(!state.isSidebarOpen),
      "window-blur"->Cn.ifTrue(state.isBlur),
      "isWindows"->Cn.ifTrue(isWin),
      "isMacOS"->Cn.ifTrue(isMac),
      "isElectron"->Cn.ifTrue(isElectron),
    ])}>
    <TitleBar state dispatch />
    <Context.Provider value=(state, dispatch)> children </Context.Provider>
    <Utils.Dialog
      isOpen={state.isDialogOpen}
      onDismiss={() => dispatch(SetDialog(false))}
      style={ReactDOMRe.Style.make(~backgroundColor="var(--grey-20)", ())}
      ariaLabel="About Coronate">
      <button
        className="button-micro" onClick={_ => dispatch(SetDialog(false))}>
        {React.string("Close")}
      </button>
      <About />
    </Utils.Dialog>
  </div>;
};

let noDraggy = e => ReactEvent.Mouse.preventDefault(e);

module DefaultSidebar = {
  [@react.component]
  let make = () => {
    <nav>
      <ul style={ReactDOMRe.Style.make(~margin="0", ())}>
        <li>
          <HashLink to_="/tourneys" onDragStart=noDraggy>
            <Icons.Award />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Tournaments")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_="/players" onDragStart=noDraggy>
            <Icons.Users />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Players")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_="/options" onDragStart=noDraggy>
            <Icons.Settings />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Options")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_="/timecalc" onDragStart=noDraggy>
            <Icons.Clock />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Time calculator")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_="/" onDragStart=noDraggy>
            <Icons.Help />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Info")}
            </span>
          </HashLink>
        </li>
      </ul>
    </nav>;
  };
};

let sidebarCallback = () => <DefaultSidebar />;

module Body = {
  [@react.component]
  let make = (~children, ~footerFunc=?, ~sidebarFunc=sidebarCallback) => {
    <div
      className={Cn.make([
        "winBody",
        "winBody-hasFooter"->Cn.ifSome(footerFunc),
      ])}>
      <div className="win__sidebar"> {sidebarFunc()} </div>
      <div className="win__content"> children </div>
      {switch (footerFunc) {
       | Some(footer) =>
         <footer className={Cn.make(["win__footer"])}> {footer()} </footer>
       | None => ReasonReact.null
       }}
    </div>;
  };
};