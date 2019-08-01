open Belt;
type getter('a) =
  | GetString('a => string)
  | GetInt('a => int)
  | GetFloat('a => float)
  | GetDate('a => Js.Date.t);

type tableState('a) = {
  isDescending: bool,
  column: getter('a),
  table: Js.Array.t('a),
};

type actionTable('a) =
  | SetIsDescending(bool)
  | SetColumn(getter('a))
  | SetTable(Js.Array.t('a))
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
    | GetString(func) =>
      (str => str |> func |> Js.String.toLowerCase) |> direction
    | GetInt(func) => func |> direction
    | GetFloat(func) => func |> direction
    | GetDate(func) => func |> direction
    };
  let table = newState.table->SortArray.stableSortBy(sortFunc);
  {...newState, table};
};

let useSortedTable = (~table, ~column, ~isDescending) => {
  let initialState = {table, column, isDescending};
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
/*
   Experimental. I was trying to make a hook that will convert one useReducer's
   output into a variant that looks like `'state => Loading | Loaded('state)`
   so that asyncronous data can be handled more gracefully. Because this puts
   one state inside another state, it produces problems where `useEffect` won't
   be able to detect updates to the "actual" state, only the "loading" state.

   My current way of handling async data is to use placeholder (usually empty)
   data that gets replaced once new data loads, and the loading status is
   handled seperately. This is arguably less type-safe, but seems to work well
   with the rest of React's hooks.

   The `Loading('state)` idiom only seems to be effective when the `'state`
   data doesn't change unless it's through another asyncronous update.
   Unfotunately, this app currently is designed to load state, manipulate it,
   and then save it back asyncronously. 

   There may be a better way of doing this. In fact, I may want to drop the
   `useEffect` save strategy in favor of manually saving. The `useEffect` has
   its own limitations, especially when it comes to deleting DB entries. (It
   just deletes any entries that aren't in the state, assuming they were once
   loaded and then deleted.)

 module Async = {
   type t('a) =
     | Loading
     | Loaded('a)
     | Error(string);

   type status =
     | IsLoading
     | IsLoaded
     | IsError(string);

   type action =
     | SetIsLoading
     | SetSuccess
     | SetError(string);

   let reducer = (_, action) => action;

   let useAsyncStatus = () => {
     React.useReducer(reducer, IsLoading);
   };

   let mapWithDefault = (state, default, fn) =>
     switch (state) {
     | Loading
     | Error(_) => default
     | Loaded(state) => fn(state)
     };

   let getWithDefault = (state, default) =>
     switch (state) {
     | Loading
     | Error(_) => default
     | Loaded(state) => state
     };
 };
  */