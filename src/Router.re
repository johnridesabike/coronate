open Belt;
open ReasonReact.Router;

let str = Data.Id.toString;

module TourneyPage = {
  type t =
    | Players
    | Scores
    | Crosstable
    | Setup
    | Status
    | Round(int);

  let fromPath =
    fun
    | []
    | [""] => Some(Players)
    | ["scores"] => Some(Scores)
    | ["crosstable"] => Some(Crosstable)
    | ["setup"] => Some(Setup)
    | ["status"] => Some(Status)
    | ["round", y] =>
      switch (Int.fromString(y)) {
      | Some(y) => Some(Round(y))
      | None => None
      }
    | _ => None;

  let toString = (id, subPage) =>
    switch (subPage) {
    | Players => str(id) ++ "/"
    | Scores => str(id) ++ "/scores"
    | Crosstable => str(id) ++ "/crosstable"
    | Setup => str(id) ++ "/setup"
    | Status => str(id) ++ "/status"
    | Round(round) => str(id) ++ "/round/" ++ Int.toString(round)
    };
};

type t =
  | Index
  | TournamentList
  | Tournament(Data.Id.t, TourneyPage.t)
  | PlayerList
  | Player(Data.Id.t)
  | TimeCalculator
  | Options
  | NotFound;

let id = Data.Id.fromString;

let fromPath =
  fun
  /* The first item is always an empty string */
  | [""]
  | ["", ""] => Index
  | ["", "players"] => PlayerList
  | ["", "players", x] => Player(id(x))
  | ["", "timecalc"] => TimeCalculator
  | ["", "options"] => Options
  | ["", "tourneys"] => TournamentList
  | ["", "tourneys", x, ...path] =>
    switch (TourneyPage.fromPath(path)) {
    | Some(page) => Tournament(id(x), page)
    | None => NotFound
    }
  | _ => NotFound;

let toString =
  fun
  | Index
  | NotFound => "/"
  | PlayerList => "/players"
  | Player(id) => "/players/" ++ str(id)
  | TimeCalculator => "/timecalc"
  | Options => "/options"
  | TournamentList => "/tourneys"
  | Tournament(id, page) => "/tourneys/" ++ TourneyPage.toString(id, page);

let useHashUrl = () => {
  let {hash, _} = useUrl();
  hash->Utils.String.split(~on="/")->List.fromArray->fromPath;
};

module HashLink = {
  [@react.component]
  let make = (~children, ~to_, ~onDragStart=?, ~onClick=?) => {
    let {hash, _} = useUrl();
    let href = toString(to_);
    let isCurrent =
      switch (href) {
      | "/" => hash == "" || hash == href
      | _ => hash == href
      };
    /**
     * ReasonReact hasn't implemented the aria-current attribute yet. We have to
     * define it ourselves!
     */
    ReactDOMRe.createElement(
      "a",
      ~props=
        ReactDOMRe.objToDOMProps({
          "aria-current": isCurrent,
          "href": "#" ++ href,
          "onDragStart": onDragStart,
          "onClick": onClick,
        }),
      [|children|],
    );
  };
};
