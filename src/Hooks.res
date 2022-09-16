/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
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
  | GetString(f) => direction(compare, (. str) => f(. str)->Js.String2.toLowerCase)
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
        ? ReactDOM.Style.make(~opacity="1", ())
        : ReactDOM.Style.make(~opacity="0", ())
    <button
      className="button-micro button-text-ghost title-20"
      style={ReactDOM.Style.make(~width="100%", ())}
      onClick={_ => setKeyOrToggleDir()}>
      <span ariaHidden=true>
        <Icons.ChevronUp style={ReactDOM.Style.make(~opacity="0", ())} />
      </span>
      children
      {if data.isDescending {
        <span style=chevronStyle>
          <Icons.ChevronUp />
          <Externals.VisuallyHidden> {React.string("Sort ascending.")} </Externals.VisuallyHidden>
        </span>
      } else {
        <span style=chevronStyle>
          <Icons.ChevronDown />
          <Externals.VisuallyHidden> {React.string("Sort descending.")} </Externals.VisuallyHidden>
        </span>
      }}
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
