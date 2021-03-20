type boolState = {
  state: bool,
  setTrue: unit => unit,
  setFalse: unit => unit,
}

let useBool: bool => boolState

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

let useSortedTable: (
  ~table: array<'a>,
  ~column: getter<'a>,
  ~isDescending: bool,
) => (tableState<'a>, actionTable<'a> => unit)

module SortButton: {
  @react.component
  let make: (
    ~children: React.element,
    ~sortColumn: getter<'a>,
    ~data: tableState<'a>,
    ~dispatch: actionTable<'a> => unit,
  ) => React.element
}

let useLoadingCursorUntil: bool => unit
