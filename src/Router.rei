module TourneyPage: {
  type t =
    | Players
    | Scores
    | Crosstable
    | Setup
    | Status
    | Round(int);
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

let useHashUrl: unit => t;

module HashLink: {
  [@react.component]
  let make:
    (
      ~children: React.element,
      ~to_: t,
      ~onDragStart: ReactEvent.Mouse.t => unit=?,
      ~onClick: ReactEvent.Mouse.t => unit=?
    ) =>
    React.element;
};
