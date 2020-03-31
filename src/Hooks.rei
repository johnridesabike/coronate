type getter('a) =
  | GetString('a => string)
  | GetInt('a => int)
  | GetFloat('a => float)
  | GetDate('a => Js.Date.t);

type tableState('a) = {
  isDescending: bool,
  column: getter('a),
  table: array('a),
};

type actionTable('a) =
  | SetIsDescending(bool)
  | SetColumn(getter('a))
  | SetTable(array('a))
  | SortWithoutUpdating;

let useSortedTable:
  (~table: array('a), ~column: getter('a), ~isDescending: bool) =>
  (tableState('a), actionTable('a) => unit);

module SortButton: {
  [@react.component]
  let make:
    (
      ~children: React.element,
      ~sortColumn: getter('a),
      ~data: tableState('a),
      ~dispatch: actionTable('a) => unit
    ) =>
    React.element;
};

let useLoadingCursorUntil: bool => unit;

type scoreInfo = {
  player: Data.Player.t,
  hasBye: bool,
  colorBalance: string,
  score: float,
  rating: React.element,
  opponentResults: React.element,
  avoidListHtml: React.element,
};

let useScoreInfo:
  (
    ~player: Data.Player.t,
    ~scoreData: Data.Id.Map.t(Scoring.t),
    ~avoidPairs: Data.Config.AvoidPairs.t=?,
    ~getPlayer: Data.Id.t => Data.Player.t,
    ~players: Data.Id.Map.t(Data.Player.t),
    ~origRating: int,
    ~newRating: option(int),
    unit
  ) =>
  scoreInfo;
