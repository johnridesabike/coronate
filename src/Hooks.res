open Belt

type boolState = {
  state: bool,
  setTrue: unit => unit,
  setFalse: unit => unit,
}

let reducer = (_, newState) => newState

let useBool = init => {
  let (state, setState) = React.Uncurried.useReducer(reducer, init)
  {
    state: state,
    setTrue: () => setState(. true),
    setFalse: () => setState(. false),
  }
}

@ocaml.doc("Begin the sortable table hook.")
type getter<'a> =
  | GetString((. 'a) => string)
  | GetInt((. 'a) => int)
  | GetFloat((. 'a) => float)
  | GetDate((. 'a) => Js.Date.t)

type tableState<'a> = {
  isDescending: bool,
  column: getter<'a>,
  table: array<'a>,
}

type actionTable<'a> =
  | SetIsDescending(bool)
  | SetColumn(getter<'a>)
  | SetTable(array<'a>)
  | SortWithoutUpdating

let sortedTableReducer = (state, action) => {
  let newState = switch action {
  | SetTable(table) => {...state, table: table}
  | SetIsDescending(isDescending) => {...state, isDescending: isDescending}
  | SetColumn(column) => {...state, column: column}
  | SortWithoutUpdating => state
  }
  let direction = newState.isDescending ? Utils.descend : Utils.ascend
  let sortFunc = switch newState.column {
  | GetString(f) => direction(compare, (. str) => f(. str)->Utils.String.toLowerCase)
  | GetInt(f) => direction(compare, f)
  | GetFloat(f) => direction(compare, f)
  | GetDate(f) => direction(compare, (. date) => f(. date)->Js.Date.getTime)
  }
  let table = Belt.SortArray.stableSortBy(newState.table, sortFunc)
  {...newState, table: table}
}

let useSortedTable = (~table, ~column, ~isDescending) => {
  let initialState = {table: table, column: column, isDescending: isDescending}
  let (state, dispatch) = React.useReducer(sortedTableReducer, initialState)
  React.useEffect0(() => {
    dispatch(SortWithoutUpdating)
    None
  })
  (state, dispatch)
}

module SortButton = {
  @react.component
  let make = (~children, ~sortColumn, ~data, ~dispatch) => {
    /*
       These === comparisons *only* work if the `sortKey` values are definined
       outside a React component. If you try to define them inline, e.g.
       `<... sortKey=KeyString(nameGet)...>` then the comparisons will always
       return false. This is due to how Bucklescript compiles and how JS
       comparisons work. IDK if there's a more idiomatic way to do this
       and ensure correct comparisons.
 */
    let setKeyOrToggleDir = () =>
      data.column === sortColumn
        ? dispatch(SetIsDescending(!data.isDescending))
        : dispatch(SetColumn(sortColumn))
    let chevronStyle =
      data.column === sortColumn
        ? ReactDOMRe.Style.make(~opacity="1", ())
        : ReactDOMRe.Style.make(~opacity="0", ())
    <button
      className="button-micro dont-hide button-text-ghost title-20"
      style={ReactDOMRe.Style.make(~width="100%", ())}
      onClick={_ => setKeyOrToggleDir()}>
      <span ariaHidden=true>
        <Icons.ChevronUp style={ReactDOMRe.Style.make(~opacity="0", ())} />
      </span>
      children
      {data.isDescending
        ? <span style=chevronStyle>
            <Icons.ChevronUp />
            <Externals.VisuallyHidden> {React.string("Sort ascending.")} </Externals.VisuallyHidden>
          </span>
        : <span style=chevronStyle>
            <Icons.ChevronDown />
            <Externals.VisuallyHidden>
              {React.string("Sort descending.")}
            </Externals.VisuallyHidden>
          </span>}
    </button>
  }
}

let useLoadingCursorUntil = isLoaded => React.useEffect1(() => {
    let _ = isLoaded
      ? %raw("document.body.style.cursor = \"auto\"")
      : %raw("document.body.style.cursor = \"wait\"")
    let reset = () => %raw("document.body.style.cursor = \"auto\"")
    Some(reset)
  }, [isLoaded])

@ocaml.doc("
 For the two components that use this, their logic is basically the same but
 their markup is slightly different. We may want to just merge them into one
 component instead of managing two similar components and one higher-order
 component.
 ")
type scoreInfo = {
  player: Data.Player.t,
  hasBye: bool,
  colorBalance: string,
  score: float,
  rating: React.element,
  opponentResults: React.element,
  avoidListHtml: React.element,
}

let useScoreInfo = (
  ~player: Data.Player.t,
  ~scoreData,
  ~avoidPairs=?,
  ~getPlayer,
  ~players,
  ~origRating,
  ~newRating,
  (),
) => {
  let {colorScores, opponentResults, results, adjustment, _} = switch Map.get(
    scoreData,
    player.id,
  ) {
  | Some(data) => data
  | None => Data.Scoring.createBlankScoreData(player.id)
  }
  let hasBye = List.some(opponentResults, ((id, _)) => Data.Id.isDummy(id))
  let colorBalance = switch Data.Scoring.Score.sum(colorScores)->Data.Scoring.Score.Sum.toFloat {
  | x if x < 0.0 => "White +" ++ x->abs_float->Float.toString
  | x if x > 0.0 => "Black +" ++ x->Float.toString
  | _ => "Even"
  }

  let opponentResults =
    opponentResults
    ->List.toArray
    ->Array.mapWithIndex((i, (opId, result)) =>
      <li key={Data.Id.toString(opId) ++ ("-" ++ Int.toString(i))}>
        {[
          getPlayer(opId).Data.Player.firstName,
          getPlayer(opId).lastName,
          "-",
          switch result {
          | Zero
          | NegOne /* Shouldn't be used here */ => "Lost"
          | One => "Won"
          | Half => "Draw"
          },
        ]
        ->Js.Array2.joinWith(" ")
        ->React.string}
      </li>
    )
    ->React.array
  let avoidListHtml =
    avoidPairs
    ->Option.map(Data.Config.Pair.Set.toMap)
    ->Option.flatMap(Map.get(_, player.id))
    ->Option.getWithDefault(list{})
    ->List.map(pId =>
      switch Map.get(players, pId) {
      /* don't show players not in this tourney */
      | None => React.null
      | Some({Data.Player.firstName: firstName, lastName, _}) =>
        <li key={Data.Id.toString(pId)}> {React.string(firstName ++ (" " ++ lastName))} </li>
      }
    )
    ->List.toArray
    ->Array.reverse
    ->React.array
  let rating =
    <>
      {origRating->React.int}
      {switch newRating {
      | None => React.null
      | Some(newRating) =>
        <span>
          {React.string(" (")}
          {Numeral.fromInt(newRating - origRating)->Numeral.format("+0")->React.string}
          {React.string(")")}
        </span>
      }}
    </>
  {
    player: player,
    hasBye: hasBye,
    colorBalance: colorBalance,
    score: Data.Scoring.Score.calcScore(results, ~adjustment)->Data.Scoring.Score.Sum.toFloat,
    rating: rating,
    opponentResults: opponentResults,
    avoidListHtml: avoidListHtml,
  }
}
