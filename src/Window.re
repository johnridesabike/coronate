// import {
//     IfElectron,
//     electron,
//     ifElectron,
//     macOSDoubleClick
// } from "../electron-utils";
// import React, {createContext, useContext, useEffect, useReducer} from "react";
// import About from "./about-dialog";
// import {Dialog} from "@reach/dialog";
// import Icons from "./icons";
// import PropTypes from "prop-types";
// import Sidebar from "./sidebar-default";
// import VisuallyHidden from "@reach/visually-hidden";
// import WindowsControls from "./windows-controls";
// import classNames from "classnames";
// import logo from "../icon-min.svg";
open ElectronUtils;

let global_title = "Coronate";

let formatTitle = title => {
  title |> Js.String.length == 0
    ? global_title : title ++ " - " ++ global_title;
};

type windowstate = {
  isBlur: bool,
  isDialogOpen: bool,
  isFullScreen: bool,
  isMaximized: bool,
  isSidebarOpen: bool,
  title: string,
};

type action =
  | SetBlur(bool)
  | SetDialog(bool)
  | SetFullScreen(bool)
  | SetMaximized(bool)
  | SetSidebar(bool)
  | SetTitle(string);

let initialWinState = {
  isBlur: false,
  isDialogOpen: false,
  isFullScreen: false,
  isMaximized: false,
  isSidebarOpen: true,
  title: "",
};

module WindowContext = {
  let initialState = (initialWinState, (_:action) => ());
  let windowContext = React.createContext(initialState);
  
  module Provider = {
    let makeProps = (~value, ~children, ()) => {
      "value": value,
      "children": children,
    };

    let make = React.Context.provider(windowContext);
  };

  let useWindowContext = () => {
    React.useContext(windowContext);
  };
};

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

let toolbarClasses =
  Cn.make([
    "macos-button-toolbar"->Cn.ifTrue(isMac && isElectron),
    "button-ghost"->Cn.ifTrue(!(isMac && isElectron)),
  ]);

module WindowsControls = {
  [@react.component]
  let make = (~state) => {
    let middleButton =
      if (state.isFullScreen) {
        <button
          className="windosControls__winButton button-ghost"
          onClick={_ => currentWindow##setFullScreen(false)}>
          <Icons.unfullscreen />
        </button>;
      } else if (state.isMaximized) {
        <button
          className="windosControls__winButton button-ghost"
          onClick={_ => currentWindow##unmaximize()}>
          <Icons.Restore />
        </button>;
      } else {
        <button
          className="windosControls__winButton button-ghost"
          onClick={_ => currentWindow##maximize()}>
          <Icons.Maximize />
        </button>;
      };

    <div className="windowsControls__container">
      <button
        className="windowsControls__winButton button-ghost"
        onClick={_ => currentWindow##minimize()}>
        <Icons.Minimize />
      </button>
      middleButton
      <button
        className={Cn.make([
          "windowsControls__winButton",
          "windowsControls__close",
          "button-ghost",
        ])}
        onClick={_ => currentWindow##close()}>
        <Icons.Close />
      </button>
    </div>;
  };
};

module WindowTitleBar = {
  [@react.component]
  let make = (~state, ~dispatch) =>
    <header
      className={Cn.make([
        "app__header",
        "double-click-control",
        "traffic-light-padding"
        ->Cn.ifTrue(isElectron && isMac && !state.isFullScreen),
      ])}
      onDoubleClick=macOSDoubleClick>
      <div>
        <IfElectron onlyWin=true>
          <span
            style={ReactDOMRe.Style.make(
              ~alignItems="center",
              ~display="inline-flex",
              ~marginLeft="4px",
              ~marginRight="8px",
              (),
            )}
            // <img src={logo} alt="" height="16" width="16" />
          />
        </IfElectron>
        <button
          className=toolbarClasses
          onClick={_ => dispatch(SetSidebar(!state.isSidebarOpen))}>
          <Icons.sidebar />
          <Utils.visuallyHidden>
            {React.string("Toggle sidebar")}
          </Utils.visuallyHidden>
        </button>
        <button
          className=toolbarClasses onClick={_ => dispatch(SetDialog(true))}>
          <Icons.help />
          <Utils.visuallyHidden>
            {React.string("About Coronate")}
          </Utils.visuallyHidden>
        </button>
      </div>
      <div
        className={Cn.make([
          "body-20",
          "double-click-control",
          "disabled"->Cn.ifTrue(state.isBlur),
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
      <IfElectron onlyWin=true> <WindowsControls state /> </IfElectron>
    </header>;
};

module Window = {
  [@bs.deriving abstract]
  type domdoc = {mutable title: string};
  [@bs.val] external document: domdoc = "document";
  let make = (~children, ~className) => {
    let (state, dispatch) = React.useReducer(windowReducer, initialWinState);
    React.useEffect1(
      () => {
        document->titleSet(formatTitle(state.title));
        None;
      },
      [|state.title|],
    );
    React.useEffect0(() => {
      let func =
        ifElectron(() => {
          // This will ensure that stale event listeners aren't persisted.
          // That typically won't be relevant to production builds, but
          // in a dev environment, where the page reloads frequently,
          // stale listeners will accumulate. Note that this can cause
          // side effects if other listeners are added elsewhere.
          let unregisterListeners = () => {
            currentWindow##removeAllListeners("enter-full-screen");
            currentWindow##removeAllListeners("leave-full-screen");
            currentWindow##removeAllListeners("blur");
            currentWindow##removeAllListeners("focus");
            currentWindow##removeAllListeners("maximize");
            currentWindow##removeAllListeners("unmaximize");
          };
          unregisterListeners();
          currentWindow##on("enter-full-screen", () =>
            dispatch(SetFullScreen(true))
          );
          currentWindow##on("leave-full-screen", () =>
            dispatch(SetFullScreen(false))
          );
          currentWindow##on("maximize", () => dispatch(SetMaximized(true)));
          currentWindow##on("unmaximize", () =>
            dispatch(SetMaximized(false))
          );
          currentWindow##on("blur", () => dispatch(SetBlur(true)));
          currentWindow##on("focus", () => dispatch(SetBlur(false)));
          dispatch(SetBlur(currentWindow##isFocused()));
          dispatch(SetFullScreen(!currentWindow##isFocused()));
          dispatch(SetMaximized(currentWindow##isMaximized()));
          // I don't think this ever really fires, but can it hurt?
          unregisterListeners;
        });
      switch (func) {
      | None => None
      | Some(func) => func
      };
    });
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
      <WindowTitleBar state dispatch />
      <WindowContext.Provider value=(state, dispatch)>
        children
      </WindowContext.Provider>
      <Utils.dialog
        isOpen={state.isDialogOpen}
        onDismiss={() => dispatch(SetDialog(false))}
        style=ReactDOMRe.Style.make(~backgroundColor="var(--grey-20)", ())
        >
        <button
          className="button-micro"
          onClick={(_) => dispatch(SetDialog(false))}
          >
          {React.string("Close")}
        </button>
        <DialogAbout />
      </Utils.dialog>
    </div>;
  };
};

// export function WindowBody({children, footer, sidebar, footerProps = {}}) {
//     return (
//         <div className={classNames("winBody", {"winBody-hasFooter": footer})}>
//             <div className="win__sidebar">
//                 {sidebar || <Sidebar />}
//             </div>
//             <div className="win__content">
//                 {children}
//             </div>
//             {footer && (
//                 <footer
//                     {...footerProps}
//                     className={classNames("win__footer", footerProps.className)}
//                 >
//                     {footer}
//                 </footer>
//             )}
//         </div>
//     );
// }