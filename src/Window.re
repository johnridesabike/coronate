/**
 * This contains all of the logic and components that make up the window,
 * including titlebar, default sidebar, and layout.
 */
open Router;
module ElectronJs = Externals.Electron;

let global_title = "Coronate";

let formatTitle =
  fun
  | "" => global_title
  | title => Utils.String.concat([title, global_title], ~sep=" - ");

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
  | SetBlur(isBlur) => {...state, isBlur}
  | SetTitle(title) =>
    Webapi.Dom.(
      document
      ->Document.unsafeAsHtmlDocument
      ->HtmlDocument.setTitle(formatTitle(title))
    );
    {...state, title};
  | SetDialog(isDialogOpen) => {...state, isDialogOpen}
  | SetFullScreen(isFullScreen) => {...state, isFullScreen}
  | SetMaximized(isMaximized) => {...state, isMaximized}
  | SetSidebar(isSidebarOpen) => {...state, isSidebarOpen}
  };
};

module About = {
  open Electron;
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
         | Some(version) => <p> {React.string("Version " ++ version)} </p>
         | None => React.null
         }}
        <p>
          {[
             "Copyright ",
             Utils.Entities.copy,
             " 2020 John",
             Utils.Entities.nbsp,
             "Jackson",
           ]
           ->Utils.String.concat(~sep="")
           ->React.string}
        </p>
        <p> {React.string("Coronate is free software.")} </p>
        <p>
          <a href=Utils.github_url onClick=Event.openInBrowser>
            {React.string("Source code is available")}
          </a>
          <br />
          {React.string(" under the ")}
          <a href=Utils.license_url onClick=Event.openInBrowser>
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

  open ElectronJs.Window;

  [@react.component]
  let make = (~isFullScreen, ~isMaximized, ~electron) => {
    let window =
      electron->ElectronJs.getRemote->ElectronJs.Remote.getCurrentWindow;
    <div className=Style.container>
      <button
        className=Cn.(Style.button <:> "button-ghost1")
        onClick={_ => minimize(window)}>
        <Icons.Minimize className=Style.svg />
      </button>
      {switch (isFullScreen, isMaximized) {
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
        className=Cn.(Style.button <:> Style.close)
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
  let isElectronMac =
    switch (Electron.os, Electron.electron) {
    | (Electron.Mac, Some(_)) => true
    | (Electron.Mac, None)
    | (Electron.(Windows | Other), _) => false
    };
  let toolbarClasses =
    Cn.(
      Style.button
      <:> on("macos-button-toolbar", isElectronMac)
      <:> on("button-ghost", !isElectronMac)
    );
  [@react.component]
  let make =
      (
        ~isBlur,
        ~isFullScreen,
        ~isMaximized,
        ~isSidebarOpen,
        ~title,
        ~dispatch,
      ) => {
    <header
      className=Cn.(
        "app__header"
        <:> "double-click-control"
        <:> on("traffic-light-padding", isElectronMac && !isFullScreen)
      )
      onDoubleClick=Electron.Event.macOSDoubleClick>
      <div>
        <Electron.IfElectron os=Electron.Windows>
          {(. _) =>
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
        </Electron.IfElectron>
        <button
          className=toolbarClasses
          onClick={_ => dispatch(. SetSidebar(!isSidebarOpen))}>
          <Icons.Sidebar />
          <Externals.VisuallyHidden>
            {React.string("Toggle sidebar")}
          </Externals.VisuallyHidden>
        </button>
        <button
          className=toolbarClasses
          onClick={_ => dispatch(. SetDialog(true))}>
          <Icons.Help />
          <Externals.VisuallyHidden>
            {React.string("About Coronate")}
          </Externals.VisuallyHidden>
        </button>
      </div>
      <div
        className=Cn.(
          "body-20" <:> "double-click-control" <:> on("disabled", isBlur)
        )
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
        {title->formatTitle->React.string}
      </div>
      <Electron.IfElectron os=Electron.Windows>
        {(. electron) =>
           <MSWindowsControls electron isFullScreen isMaximized />}
      </Electron.IfElectron>
    </header>;
  };
};

[@react.component]
let make = (~children, ~className) => {
  let (state, dispatch) =
    React.Uncurried.useReducer(windowReducer, initialWinState);
  let {isBlur, isSidebarOpen, isDialogOpen, isFullScreen, title, isMaximized} = state;
  React.useEffect0(() =>
    Electron.ifElectron(electron => {
      let win =
        electron->ElectronJs.getRemote->ElectronJs.Remote.getCurrentWindow;
      open ElectronJs.Window; /* This will ensure that stale event listeners aren't persisted.
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
      on(win, `EnterFullScreen, () => dispatch(. SetFullScreen(true)));
      on(win, `LeaveFullScreen, () => dispatch(. SetFullScreen(false)));
      on(win, `Maximize, () => dispatch(. SetMaximized(true)));
      on(win, `Unmaximize, () => dispatch(. SetMaximized(false)));
      on(win, `Blur, () => dispatch(. SetBlur(true)));
      on(win, `Focus, () => dispatch(. SetBlur(false)));
      dispatch(. SetBlur(!isFocused(win)));
      dispatch(. SetFullScreen(ElectronJs.Window.isFullScreen(win)));
      dispatch(. SetMaximized(ElectronJs.Window.isMaximized(win)));
      /* I don't think this ever really fires, but can it hurt? */
      unregisterListeners;
    })
  );
  <div
    className=Cn.(
      className
      <:> "open-sidebar"->on(isSidebarOpen)
      <:> "closed-sidebar"->on(!isSidebarOpen)
      <:> "window-blur"->on(isBlur)
      <:> (
        switch (Electron.os) {
        | Electron.Windows => "isWindows"
        | Electron.Mac => "isMacOS"
        | Electron.Other => ""
        }
      )
      <:> "isElectron"->onSome(Electron.electron)
    )>
    <TitleBar isBlur isFullScreen isMaximized isSidebarOpen title dispatch />
    {children(dispatch)}
    <Externals.Dialog
      isOpen=isDialogOpen
      onDismiss={() => dispatch(. SetDialog(false))}
      style={ReactDOMRe.Style.make(~backgroundColor="var(--grey-20)", ())}
      ariaLabel="About Coronate">
      <button
        className="button-micro" onClick={_ => dispatch(. SetDialog(false))}>
        {React.string("Close")}
      </button>
      <About />
    </Externals.Dialog>
  </div>;
};

let noDraggy = e => ReactEvent.Mouse.preventDefault(e);

module DefaultSidebar = {
  [@react.component]
  let make = () => {
    <nav>
      <ul style={ReactDOMRe.Style.make(~margin="0", ())}>
        <li>
          <HashLink to_=TournamentList onDragStart=noDraggy>
            <Icons.Award />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Tournaments")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_=PlayerList onDragStart=noDraggy>
            <Icons.Users />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Players")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_=Options onDragStart=noDraggy>
            <Icons.Settings />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Options")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_=TimeCalculator onDragStart=noDraggy>
            <Icons.Clock />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Time calculator")}
            </span>
          </HashLink>
        </li>
        <li>
          <HashLink to_=Index onDragStart=noDraggy>
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
    <div className=Cn.("winBody" <:> "winBody-hasFooter"->onSome(footerFunc))>
      <div className="win__sidebar"> {sidebarFunc()} </div>
      <div className="win__content"> children </div>
      {switch (footerFunc) {
       | Some(footer) => <footer className="win__footer"> {footer()} </footer>
       | None => React.null
       }}
    </div>;
  };
};
