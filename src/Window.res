open Belt
open Router

let global_title = "Coronate"

let formatTitle = x =>
  switch x {
  | "" => global_title
  | title => Utils.String.concat(list{title, global_title}, ~sep=" - ")
  }

type windowState = {
  isDialogOpen: bool,
  isSidebarOpen: bool,
  title: string,
}

let initialWinState = {isDialogOpen: false, isSidebarOpen: true, title: ""}

type action =
  | SetDialog(bool)
  | SetSidebar(bool)
  | SetTitle(string)

let windowReducer = (state, action) =>
  switch action {
  | SetTitle(title) =>
    Webapi.Dom.document
    ->Webapi.Dom.Document.asHtmlDocument
    ->Option.forEach(Webapi.Dom.HtmlDocument.setTitle(_, formatTitle(title)))
    {...state, title: title}
  | SetDialog(isDialogOpen) => {...state, isDialogOpen: isDialogOpen}
  | SetSidebar(isSidebarOpen) => {...state, isSidebarOpen: isSidebarOpen}
  }

module About = {
  @val
  external version: option<string> = "process.env.REACT_APP_VERSION"
  @react.component
  let make = () =>
    <article
      style={ReactDOMRe.Style.make(
        ~display="flex",
        ~justifyContent="space-between",
        ~width="100%",
        (),
      )}>
      <div style={ReactDOMRe.Style.make(~flex="0 0 48%", ~textAlign="center", ())}>
        <img src=Utils.WebpackAssets.logo height="196" width="196" alt="" />
      </div>
      <div style={ReactDOMRe.Style.make(~flex="0 0 48%", ())}>
        <h1 className="title" style={ReactDOMRe.Style.make(~textAlign="left", ())}>
          {React.string("Coronate")}
        </h1>
        {switch version {
        | Some(version) => <p> {React.string("Version " ++ version)} </p>
        | None => React.null
        }}
        <p>
          {list{"Copyright ", Utils.Entities.copy, " 2020 John", Utils.Entities.nbsp, "Jackson"}
          ->Utils.String.concat(~sep="")
          ->React.string}
        </p>
        <p> {React.string("Coronate is free software.")} </p>
        <p>
          <a href=Utils.github_url> {React.string("Source code is available")} </a>
          <br />
          {React.string(" under the ")}
          <a href=Utils.license_url> {React.string("AGPL v3.0 license")} </a>
          {React.string(".")}
        </p>
      </div>
    </article>
}

module TitleBar = {
  module Style = {
    open Css
    open Utils.PhotonColors
    let button = style(list{color(grey_90)})
  }
  let toolbarClasses = Cn.append(Style.button, "button-ghost")
  @react.component
  let make = (~isSidebarOpen, ~title, ~dispatch) =>
    <header className="app__header">
      <div>
        <button className=toolbarClasses onClick={_ => dispatch(SetSidebar(!isSidebarOpen))}>
          <Icons.Sidebar />
          <Externals.VisuallyHidden> {React.string("Toggle sidebar")} </Externals.VisuallyHidden>
        </button>
        <button className=toolbarClasses onClick={_ => dispatch(SetDialog(true))}>
          <Icons.Help />
          <Externals.VisuallyHidden> {React.string("About Coronate")} </Externals.VisuallyHidden>
        </button>
      </div>
      <div
        className="body-20"
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
    </header>
}

@react.component
let make = (~children, ~className) => {
  let (state, dispatch) = React.useReducer(windowReducer, initialWinState)
  let {isSidebarOpen, isDialogOpen, title} = state
  <div
    className={Cn.fromList(list{
      className,
      "open-sidebar"->Cn.on(isSidebarOpen),
      "closed-sidebar"->Cn.on(!isSidebarOpen),
    })}>
    <TitleBar isSidebarOpen title dispatch />
    {children(dispatch)}
    <Externals.Dialog
      isOpen=isDialogOpen
      onDismiss={() => dispatch(SetDialog(false))}
      style={ReactDOMRe.Style.make(~backgroundColor="var(--grey-20)", ())}
      ariaLabel="About Coronate">
      <button className="button-micro" onClick={_ => dispatch(SetDialog(false))}>
        {React.string("Close")}
      </button>
      <About />
    </Externals.Dialog>
  </div>
}

let noDraggy = e => ReactEvent.Mouse.preventDefault(e)

module DefaultSidebar = {
  @react.component
  let make = () =>
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
    </nav>
}

let sidebarCallback = () => <DefaultSidebar />

module Body = {
  @react.component
  let make = (~children, ~footerFunc=?, ~sidebarFunc=sidebarCallback) =>
    <div className={Cn.append("winBody", "winBody-hasFooter"->Cn.onSome(footerFunc))}>
      <div className="win__sidebar"> {sidebarFunc()} </div>
      <div className="win__content"> children </div>
      {switch footerFunc {
      | Some(footer) => <footer className="win__footer"> {footer()} </footer>
      | None => React.null
      }}
    </div>
}
