open Belt;

/**
 * Begin the sortable table hook.
 */
type getter('a) =
  | GetString((. 'a) => string)
  | GetInt((. 'a) => int)
  | GetFloat((. 'a) => float)
  | GetDate((. 'a) => Js.Date.t);

/**
 * Arrays or lists? I'm using arrays because this data only exists to be
 * rendered in React.
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
    | GetString(f) =>
      direction(compare, (. str) => f(. str)->Utils.String.toLowerCase)
    | GetInt(f) => direction(compare, f)
    | GetFloat(f) => direction(compare, f)
    | GetDate(f) =>
      direction(compare, (. date) => f(. date)->Js.Date.getTime)
    };
  let table = Belt.SortArray.stableSortBy(newState.table, sortFunc);
  {...newState, table};
};

let useSortedTable = (~table, ~column, ~isDescending) => {
  let initialState = {table, column, isDescending};
  let (state, dispatch) = React.Uncurried.useReducer(sortedTableReducer, initialState);
  React.useEffect0(() => {
    dispatch(. SortWithoutUpdating);
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
        ? dispatch(. SetIsDescending(!data.isDescending))
        : dispatch(. SetColumn(sortColumn));
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
             <Externals.VisuallyHidden>
               {React.string("Sort ascending.")}
             </Externals.VisuallyHidden>
           </span>
         : <span style=chevronStyle>
             <Icons.ChevronDown />
             <Externals.VisuallyHidden>
               {React.string("Sort descending.")}
             </Externals.VisuallyHidden>
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

/**
 * For the two components that use this, their logic is basically the same but
 * their markup is slightly different. We may want to just merge them into one
 * component instead of managing two similar components and one higher-order
 * component.
 */
type scoreInfo = {
  player: Data.Player.t,
  hasBye: bool,
  colorBalance: string,
  score: float,
  rating: React.element,
  opponentResults: React.element,
  avoidListHtml: React.element,
};

let useScoreInfo =
    (
      ~player,
      ~scoreData,
      ~avoidPairs=?,
      ~getPlayer,
      ~players,
      ~origRating,
      ~newRating,
      (),
    ) => {
  open Data;
  let {Scoring.colorScores, opponentResults, results, _} =
    switch (Map.get(scoreData, player.Player.id)) {
    | Some(data) => data
    | None => Scoring.createBlankScoreData(player.Player.id)
    };
  let hasBye = Map.has(opponentResults, Data.Id.dummy);
  let colorBalance =
    switch (Utils.List.sumF(colorScores)) {
    | x when x < 0.0 => "White +" ++ x->abs_float->Js.Float.toString
    | x when x > 0.0 => "Black +" ++ x->Js.Float.toString
    | _ => "Even"
    };
  let avoidMap =
    Option.mapWithDefault(
      avoidPairs,
      Data.Id.Map.make(),
      Config.Pair.Set.toMap,
    );
  let avoidList =
    switch (Map.get(avoidMap, player.Player.id)) {
    | None => []
    | Some(avoidList) => avoidList
    };
  let score = Utils.List.sumF(results);
  let opponentResults =
    opponentResults
    ->Map.toArray
    ->Array.map(((opId, result)) =>
        <li key={Data.Id.toString(opId)}>
          {[
             getPlayer(opId).Player.firstName,
             getPlayer(opId).Player.lastName,
             "-",
             switch (result) {
             | 0.0 => "Lost"
             | 1.0 => "Won"
             | 0.5 => "Draw"
             | _ => "Draw"
             },
           ]
           ->Utils.String.concat(~sep=" ")
           ->React.string}
        </li>
      )
    ->React.array;
  let avoidListHtml =
    avoidList
    ->List.map(pId =>
        switch (Map.get(players, pId)) {
        /*  don't show players not in this tourney*/
        | None => React.null
        | Some({Player.firstName, lastName, _}) =>
          <li key={Data.Id.toString(pId)}>
            {React.string(firstName ++ " " ++ lastName)}
          </li>
        }
      )
    ->List.toArray
    ->Array.reverse
    ->React.array;
  let rating =
    <>
      {origRating->Js.Int.toString->React.string}
      {switch (newRating) {
       | None => React.null
       | Some(newRating) =>
         <span>
           {React.string(" (")}
           {Numeral.fromInt(newRating - origRating)
            ->Numeral.format("+0")
            ->React.string}
           {React.string(")")}
         </span>
       }}
    </>;
  {
    player,
    hasBye,
    colorBalance,
    score,
    rating,
    opponentResults,
    avoidListHtml,
  };
};
