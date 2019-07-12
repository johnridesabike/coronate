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
  React.useContext(WindowContext.windowContext);
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
  let make = (~state, ~dispatch) => {
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
            )}>
            <img src=Utils.WebpackAssets.logo alt="" height="16" width="16" />
          </span>
        </IfElectron>
        <button
          className=toolbarClasses
          onClick={_ => dispatch(SetSidebar(!state.isSidebarOpen))}>
          <Icons.sidebar />
          <Utils.VisuallyHidden>
            {React.string("Toggle sidebar")}
          </Utils.VisuallyHidden>
        </button>
        <button
          className=toolbarClasses onClick={_ => dispatch(SetDialog(true))}>
          <Icons.help />
          <Utils.VisuallyHidden>
            {React.string("About Coronate")}
          </Utils.VisuallyHidden>
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
};

module Window = {
  [@react.component]
  let make = (~children, ~className) => {
    let (state, dispatch) = React.useReducer(windowReducer, initialWinState);
    let title = state.title;
    React.useEffect1(
      () => {
        let _ =
          Webapi.Dom.(
            document
            ->Document.unsafeAsHtmlDocument
            ->HtmlDocument.setTitle(formatTitle(title))
          );
        None;
      },
      [|title|],
    );
    React.useEffect1(
      () => {
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
            currentWindow##on("maximize", () =>
              dispatch(SetMaximized(true))
            );
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
        | Some(func) => func === Js.null ? None : func
        };
      },
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
      <WindowTitleBar state dispatch />
      <WindowContext.Provider value=(state, dispatch)>
        children
      </WindowContext.Provider>
      <Utils.Dialog
        isOpen={state.isDialogOpen}
        onDismiss={() => dispatch(SetDialog(false))}
        style={ReactDOMRe.Style.make(~backgroundColor="var(--grey-20)", ())}>
        <button
          className="button-micro" onClick={_ => dispatch(SetDialog(false))}>
          {React.string("Close")}
        </button>
        <Snippets.About />
      </Utils.Dialog>
    </div>;
  };
};

let noDraggy = e => ReactEvent.Mouse.preventDefault(e);

module DefaultSidebar = {
  [@react.component]
  let make = () => {
    <nav>
      <ul style={ReactDOMRe.Style.make(~margin="0", ())}>
        <li>
          <a href="#/tourneys" onDragStart=noDraggy>
            <Icons.award />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Tournaments")}
            </span>
          </a>
        </li>
        <li>
          <a href="#/players" onDragStart=noDraggy>
            <Icons.users />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Players")}
            </span>
          </a>
        </li>
        <li>
          <a href="#/options" onDragStart=noDraggy>
            <Icons.settings />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Options")}
            </span>
          </a>
        </li>
        <li>
          <a href="#/" onDragStart=noDraggy>
            <Icons.help />
            <span className="sidebar__hide-on-close">
              {React.string(Utils.Entities.nbsp ++ "Info")}
            </span>
          </a>
        </li>
      </ul>
    </nav>;
  };
};

let sidebarCallback = () => <DefaultSidebar />;

module WindowBody = {
  [@react.component]
  let make = (~children, ~footerFunc=?, ~sidebarFunc=sidebarCallback) => {
    /*footerProps = {}*/
    <div
      className={Cn.make([
        "winBody",
        "winBody-hasFooter"->Cn.ifSome(footerFunc),
      ])}>
      <div className="win__sidebar"> {sidebarFunc()} </div>
      <div className="win__content"> children </div>
      {switch (footerFunc) {
       | Some(footer) =>
         <footer
           className={Cn.make(["win__footer" /* , footerProps.className */])}>
           {footer()}
         </footer>
       | None => ReasonReact.null
       }}
    </div>;
  };
};