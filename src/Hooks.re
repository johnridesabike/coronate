open Belt;

/*
   Begin the sortable table hook.
 */
type getter('a) =
  | GetString('a => string)
  | GetInt('a => int)
  | GetFloat('a => float)
  | GetDate('a => Js.Date.t);

/*
   Arrays or lists? I'm using arrays because this data only exists to be rendered
   in React.
 */
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

let sortedTableReducer = (state, action) => {
  let newState =
    switch (action) {
    | SetTable(table) => {...state, table}
    | SetIsDescending(isDescending) => {...state, isDescending}
    | SetColumn(column) => {...state, column}
    | SortWithoutUpdating => state
    };
  let direction = newState.isDescending ? Utils.descend : Utils.ascend;
  let sortFunc =
    switch (newState.column) {
    | GetString(func) => direction(str => str->func->Js.String2.toLowerCase)
    | GetInt(func) => direction(func)
    | GetFloat(func) => direction(func)
    | GetDate(func) => direction(func)
    };
  let table = SortArray.stableSortBy(newState.table, sortFunc);
  {...newState, table};
};

let useSortedTable = (~table, ~column, ~isDescending) => {
  let initialState = {table, column, isDescending};
  let (state, dispatch) = React.useReducer(sortedTableReducer, initialState);
  React.useEffect0(() => {
    dispatch(SortWithoutUpdating);
    None;
  });
  (state, dispatch);
};

module SortButton = {
  [@react.component]
  let make = (~children, ~sortColumn, ~data, ~dispatch) => {
    /*
       These === comparisons *only* work if the `sortKey` values are definined
       outside a React component. If you try to define them inline, e.g.
       `<... sortKey=KeyString(nameGet)...>` then the comparisons will always
       return false. This is due to how Bucklescript compiles and how JS
       comparisons work. IDK if there's a more idiomatic ReasonML way to do this
       and ensure correct comparisons.
     */
    let setKeyOrToggleDir = () => {
      data.column === sortColumn
        ? dispatch(SetIsDescending(!data.isDescending))
        : dispatch(SetColumn(sortColumn));
    };
    let chevronStyle =
      ReactDOMRe.Style.(
        data.column === sortColumn
          ? make(~opacity="1", ()) : make(~opacity="0", ())
      );
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
             <Utils.VisuallyHidden>
               {React.string("Sort ascending.")}
             </Utils.VisuallyHidden>
           </span>
         : <span style=chevronStyle>
             <Icons.ChevronDown />
             <Utils.VisuallyHidden>
               {React.string("Sort descending.")}
             </Utils.VisuallyHidden>
           </span>}
    </button>;
  };
};

let useLoadingCursorUntil = isLoaded => {
  React.useEffect1(
    () => {
      let _ =
        isLoaded
          ? [%bs.raw "document.body.style.cursor = \"auto\""]
          : [%bs.raw "document.body.style.cursor = \"wait\""];
      let reset = () => [%bs.raw "document.body.style.cursor = \"auto\""];
      Some(reset);
    },
    [|isLoaded|],
  );
};