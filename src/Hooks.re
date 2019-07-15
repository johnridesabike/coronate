module Map = Belt.Map.String;

type keyFunc('a) =
  | KeyString('a => string)
  | KeyInt('a => int)
  | KeyFloat('a => float)
  | KeyDate('a => Js.Date.t);

type tableState('a) = {
  isDescending: bool,
  key: keyFunc('a),
  table: Js.Array.t('a),
};

type actionTable('a) =
  | SetIsDescending(bool)
  | SetKey(keyFunc('a))
  | SetTable(Js.Array.t('a))
  | SortWithoutUpdating;

let sortedTableReducer = (state, action) => {
  let newState =
    switch (action) {
    | SetTable(table) => {...state, table}
    | SetIsDescending(isDescending) => {...state, isDescending}
    | SetKey(key) => {...state, key}
    | SortWithoutUpdating => state
    };
  let direction = newState.isDescending ? Utils.descend : Utils.ascend;
  let sortFunc =
    switch (newState.key) {
    | KeyString(func) =>
      (str => str |> func |> Js.String.toLowerCase) |> direction
    | KeyInt(func) => func |> direction
    | KeyFloat(func) => func |> direction
    | KeyDate(func) => func |> direction
    };
  let table = newState.table->Belt.SortArray.stableSortBy(sortFunc);
  {...newState, table};
};

let useSortedTable = (~table, ~key, ~isDescending) => {
  let initialState = {table, key, isDescending};
  let (state, dispatch) = React.useReducer(sortedTableReducer, initialState);
  React.useEffect1(
    () => {
      dispatch(SortWithoutUpdating);
      None;
    },
    [|dispatch|],
  );
  (state, dispatch);
};

module SortButton = {
  [@react.component]
  let make =
      (
        ~children,
        ~sortKey: keyFunc('a),
        ~data: tableState('a),
        ~dispatch: actionTable('a) => unit,
      ) => {
    /*
       These === comparisons *only* work if the `sortKey` values are definined
       outside a React component. If you try to define them inline, e.g.
       `<... sortKey=KeyString(nameGet)...>` then the comparisons will always
       return false. This is due to how Bucklescript compiles and how JS
       comparisons work. IDK if there's a more idiomatic ReasonML way to do this
       and ensure correct comparisons.
     */
    let setKeyOrToggleDir = () => {
      data.key === sortKey
        ? dispatch(SetIsDescending(!data.isDescending))
        : dispatch(SetKey(sortKey));
    };
    let chevronStyle =
      ReactDOMRe.Style.(
        data.key === sortKey
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