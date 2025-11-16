/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open! Belt
open Router

let global_title = "Coronate"

let formatTitle = x =>
  switch x {
  | "" => global_title
  | title => title ++ " - " ++ global_title
  }

type windowState = {
  isDialogOpen: bool,
  isMobileSidebarOpen: bool,
  title: string,
}

let initialWinState = {isDialogOpen: false, isMobileSidebarOpen: false, title: ""}

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
    {...state, title}
  | SetDialog(isDialogOpen) => {...state, isDialogOpen}
  | SetSidebar(isMobileSidebarOpen) => {...state, isMobileSidebarOpen}
  }

module About = {
  @val
  external gitModified: string = "process.env.GIT_MODIFIED"
  @react.component
  let make = () =>
    <article className="win__about">
      <div style={{flex: "0 0 48%", textAlign: "center"}}>
        <img src=Utils.WebpackAssets.logo height="196" width="196" alt="" />
      </div>
      <div style={{flex: "0 0 48%"}}>
        <h1 className="title" style={{textAlign: "left"}}> {React.string("Coronate")} </h1>
        <p> {React.string(`Last updated on ${gitModified}.`)} </p>
        <p>
          <a href=Utils.faq_url> {React.string("Read the FAQ.")} </a>
        </p>
        <p>
          <a href=Utils.changelog_url>
            {React.string("View the changelog for new features. ")}
            <Icons.ExternalLink />
          </a>
        </p>
        <p> {`Copyright ${HtmlEntities.copy} John${HtmlEntities.nbsp}Jackson`->React.string} </p>
        <p> {React.string("Coronate is free software.")} </p>
        <p>
          <a href=Utils.github_url>
            {React.string("Source code is available ")}
            <Icons.ExternalLink />
          </a>
          {React.string(" under the ")}
          <a href=Utils.license_url>
            {React.string("Mozilla Public License 2.0 ")}
            <Icons.ExternalLink />
          </a>
          {React.string(".")}
        </p>
      </div>
    </article>
}

module TitleBar = {
  let toolbarClasses = "win__titlebar-button button-ghost button-ghost-large"
  @react.component
  let make = (~isMobileSidebarOpen, ~title, ~dispatch) =>
    <header className="app__header">
      <button
        className={`mobile-only ${toolbarClasses}`}
        onClick={_ => dispatch(SetSidebar(!isMobileSidebarOpen))}>
        <Icons.Menu />
        <Externals.VisuallyHidden> {React.string("Toggle sidebar")} </Externals.VisuallyHidden>
      </button>
      <div
        className="body-20"
        style={{
          left: "0",
          marginLeft: "auto",
          marginRight: "auto",
          position: "absolute",
          right: "0",
          textAlign: "center",
          width: "50%",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}>
        {title->formatTitle->React.string}
      </div>
      <button className=toolbarClasses onClick={_ => dispatch(SetDialog(true))}>
        <Icons.Help />
        <Externals.VisuallyHidden> {React.string("About Coronate")} </Externals.VisuallyHidden>
      </button>
    </header>
}

@react.component
let make = (~children, ~className) => {
  let (state, dispatch) = React.useReducer(windowReducer, initialWinState)
  let {isMobileSidebarOpen, isDialogOpen, title} = state
  <div
    className={`${className} ${isMobileSidebarOpen
        ? "mobile-sidebar-open"
        : "mobile-sidebar-closed"}`}>
    <TitleBar isMobileSidebarOpen title dispatch />
    {children(dispatch)}
    <Externals.Dialog
      isOpen=isDialogOpen
      onDismiss={() => dispatch(SetDialog(false))}
      className="win__about-dialog"
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
  let make = (~dispatch) =>
    <nav>
      <ul style={{margin: "0"}}>
        <li>
          <Link to_=Index onDragStart=noDraggy onClick={_ => dispatch(SetSidebar(false))}>
            <Icons.Home />
            <span className="sidebar__hide-on-close">
              {React.string(HtmlEntities.nbsp ++ "Home")}
            </span>
          </Link>
        </li>
        <li>
          <Link to_=TournamentList onDragStart=noDraggy onClick={_ => dispatch(SetSidebar(false))}>
            <Icons.Award />
            <span className="sidebar__hide-on-close">
              {React.string(HtmlEntities.nbsp ++ "Tournaments")}
            </span>
          </Link>
        </li>
        <li>
          <Link to_=PlayerList onDragStart=noDraggy onClick={_ => dispatch(SetSidebar(false))}>
            <Icons.Users />
            <span className="sidebar__hide-on-close">
              {React.string(HtmlEntities.nbsp ++ "Players")}
            </span>
          </Link>
        </li>
        <li>
          <Link to_=Options onDragStart=noDraggy onClick={_ => dispatch(SetSidebar(false))}>
            <Icons.Settings />
            <span className="sidebar__hide-on-close">
              {React.string(HtmlEntities.nbsp ++ "Options")}
            </span>
          </Link>
        </li>
        <li>
          <Link to_=TimeCalculator onDragStart=noDraggy onClick={_ => dispatch(SetSidebar(false))}>
            <Icons.Clock />
            <span className="sidebar__hide-on-close">
              {React.string(HtmlEntities.nbsp ++ "Time calculator")}
            </span>
          </Link>
        </li>
      </ul>
    </nav>
}

let sidebarCallback = dispatch => <DefaultSidebar dispatch />

module Body = {
  @react.component
  let make = (~children, ~windowDispatch, ~footerFunc=?, ~sidebarFunc=sidebarCallback) =>
    <div className={`winBody ${footerFunc != None ? "winBody-hasFooter" : ""})`}>
      <div className="win__sidebar"> {sidebarFunc(windowDispatch)} </div>
      <div className="win__content"> children </div>
      {switch footerFunc {
      | Some(footer) => <footer className="win__footer"> {footer()} </footer>
      | None => React.null
      }}
    </div>
}
