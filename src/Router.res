/*
  Copyright (c) 2022 John Jackson.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open! Belt
let str = Data.Id.toString

module TourneyPage = {
  type t =
    | Players
    | Scores
    | Crosstable
    | Setup
    | Status
    | Round(int)

  let fromPath = x =>
    switch x {
    | list{} | list{""} => Some(Players)
    | list{"scores"} => Some(Scores)
    | list{"crosstable"} => Some(Crosstable)
    | list{"setup"} => Some(Setup)
    | list{"status"} => Some(Status)
    | list{"round", y} =>
      switch Int.fromString(y) {
      | Some(y) => Some(Round(y))
      | None => None
      }
    | _ => None
    }

  let toString = (id, subPage) =>
    switch subPage {
    | Players => str(id) ++ "/"
    | Scores => str(id) ++ "/scores"
    | Crosstable => str(id) ++ "/crosstable"
    | Setup => str(id) ++ "/setup"
    | Status => str(id) ++ "/status"
    | Round(round) => str(id) ++ "/round/" ++ Int.toString(round)
    }
}

type t =
  | Index
  | TournamentList
  | Tournament(Data.Id.t, TourneyPage.t)
  | PlayerList
  | Player(Data.Id.t)
  | TimeCalculator
  | Options
  | NotFound

let id = Data.Id.fromString

let fromPath = x =>
  /* The first item is always an empty string */
  switch x {
  | list{} => Index
  | list{"players"} => PlayerList
  | list{"players", x} => Player(id(x))
  | list{"timecalc"} => TimeCalculator
  | list{"options"} => Options
  | list{"tourneys"} => TournamentList
  | list{"tourneys", x, ...path} =>
    switch TourneyPage.fromPath(path) {
    | Some(page) => Tournament(id(x), page)
    | None => NotFound
    }
  | _ => NotFound
  }

let toString = x =>
  switch x {
  | Index | NotFound => "/"
  | PlayerList => "/players"
  | Player(id) => "/players/" ++ str(id)
  | TimeCalculator => "/timecalc"
  | Options => "/options"
  | TournamentList => "/tourneys"
  | Tournament(id, page) => "/tourneys/" ++ TourneyPage.toString(id, page)
  }

let useUrl = () => {
  let {path, _} = RescriptReactRouter.useUrl()
  fromPath(path)
}

module Link = {
  @react.component
  let make = (~children, ~to_, ~onDragStart=?, ~onClick=?) => {
    let path = useUrl()
    let href = toString(to_)
    // RescriptReact hasn't implemented the aria-current attribute yet.
    // We have to define it ourselves!
    React.cloneElement(
      <a
        href
        ?onDragStart
        onClick={event => {
          switch onClick {
          | None => ()
          | Some(f) => f(event)
          }
          if !ReactEvent.Mouse.defaultPrevented(event) {
            ReactEvent.Mouse.preventDefault(event)
            RescriptReactRouter.push(href)
          }
        }}>
        children
      </a>,
      {"aria-current": href == toString(path)},
    )
  }
}
