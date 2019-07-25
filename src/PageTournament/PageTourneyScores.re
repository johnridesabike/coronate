open Belt;
open Data;

module Style = {
  open Css;
  open Utils.PhotonColors;
  let table =
    style([borderCollapse(`collapse), unsafe("width", "min-content")]);
  let topHeader = style([verticalAlign(`bottom)]);
  /*
   .scores__compact .row:nth-child(odd) {
       background-color: var(--white-100);
   }
   */
  let compact = style([]);
  let row =
    style([
      selector(":nth-of-type(even)", [backgroundColor(white_100)]),
      selector(":nth-of-type(odd)", [backgroundColor(grey_20)]),
    ]);
  let rowTd =
    style([
      borderWidth(`px(1)),
      borderColor(grey_40),
      borderStyle(`solid),
    ]);
  let rowTh =
    style([
      borderBottomStyle(`solid),
      borderWidth(`px(1)),
      borderColor(grey_40),
      backgroundColor(white_100),
    ]);
  let playerName = style([textAlign(`left), color(grey_90)]);
  let rank = style([textAlign(`center), color(grey_90)]);
  let number = style([padding(`px(4))]);
};

module ScoreTable = {
  [@react.component]
  let make = (~isCompact=false, ~tourney, ~getPlayer, ~title) => {
    let tieBreaks = tourney.Tournament.tieBreaks;
    let roundList = tourney.roundList;
    let tieBreakNames = Scoring.getTieBreakNames(tieBreaks);
    let standingTree =
      Data.rounds2Matches(~roundList, ())
      |> Data.Converters.matches2ScoreData
      |> Scoring.createStandingList(tieBreaks)
      |> Js.Array.filter(standing =>
           !Data.Player.isDummyId(standing.Scoring.id)
         )
      |> Scoring.createStandingTree;
    <table
      className={Cn.make([Style.table, Style.compact->Cn.ifTrue(isCompact)])}>
      <caption
        className={Cn.make([
          "title-30"->Cn.ifTrue(isCompact),
          "title-40"->Cn.ifTrue(!isCompact),
        ])}>
        {React.string(title)}
      </caption>
      <thead>
        <tr className=Style.topHeader>
          <th className="title-10" scope="col"> {React.string("Rank")} </th>
          <th className="title-10" scope="col"> {React.string("Name")} </th>
          <th className="title-10" scope="col"> {React.string("Score")} </th>
          {isCompact
             ? React.null
             : tieBreakNames
               |> Js.Array.mapi((name, i) =>
                    <th
                      key={i |> string_of_int}
                      className="title-10"
                      scope="col">
                      {React.string(name)}
                    </th>
                  )
               |> React.array}
        </tr>
      </thead>
      <tbody>
        {standingTree
         |> Js.Array.mapi((standingsFlat, rank) =>
              standingsFlat
              |> Js.Array.mapi((standing: Scoring.standing, i) =>
                   <tr key={standing.id} className=Style.row>
                     {i === 0
                        // Only display the rank once
                        ? <th
                            className={Cn.make([
                              "table__number",
                              Style.number,
                              Style.rank,
                              Style.rowTh,
                            ])}
                            rowSpan={standingsFlat |> Js.Array.length}
                            scope="row">
                            {rank + 1 |> string_of_int |> React.string}
                          </th>
                        : React.null}
                     /* use <td> if it's compact.*/
                     {isCompact
                        ? <td
                            className={Cn.make([
                              Style.rowTd,
                              Style.playerName,
                            ])}>
                            {React.string(
                               getPlayer(standing.id).Player.firstName,
                             )}
                            {React.string(Utils.Entities.nbsp)}
                            {React.string(getPlayer(standing.id).lastName)}
                          </td>  /* Use the name as a header if not compact. */
                        : <th
                            className={Cn.make([
                              Style.rowTh,
                              Style.playerName,
                            ])}
                            /*dataTestid={rank |>string_of_int}*/
                            scope="row">
                            {React.string(getPlayer(standing.id).firstName)}
                            {React.string(Utils.Entities.nbsp)}
                            {React.string(getPlayer(standing.id).lastName)}
                          </th>}
                     <td
                       className={Cn.make([
                         Style.number,
                         Style.rowTd,
                         "table__number",
                       ])}>
                       /*dataTestid={dashify(
                           getPlayer(standing.id).firstName
                           + getPlayer(standing.id).lastName
                           + " score",
                         )}*/

                         Numeral.(standing.score->make->format("1/2"))
                         ->React.string
                       </td>
                     {isCompact
                        ? React.null
                        : standing.tieBreaks
                          |> Js.Array.mapi((score, j) =>
                               <td
                                 key={j |> string_of_int}
                                 className={Cn.make([
                                   Style.rowTd,
                                   "table__number",
                                 ])}>
                                 /*dataTestid={dashify(
                                     getPlayer(standing.id).firstName
                                     + getPlayer(standing.id).lastName
                                     + tieBreakNames[j],
                                   )}*/

                                   Numeral.(score->make->format("1/2"))
                                   ->React.string
                                 </td>
                             )
                          |> React.array}
                   </tr>
                 )
              |> React.array
            )
         |> React.array}
      </tbody>
    </table>;
  };
};

module SelectTieBreaks = {
  [@react.component]
  let make = (~tourney, ~tourneyDispatch) => {
    let tieBreaks = tourney.Tournament.tieBreaks;
    let (selectedTb, setSelectedTb) = React.useState(() => None);
    let defaultId = x =>
      switch (x) {
      | Some(x) => x
      | None =>
        switch (selectedTb) {
        | Some(x) => x
        | None => 1 /* This should never happen.*/
        }
      };

    let toggleTb = id =>
      if (tieBreaks |> Js.Array.includes(defaultId(id))) {
        tourneyDispatch(TournamentDataReducers.DelTieBreak(defaultId(id)));
        setSelectedTb(_ => None);
      } else {
        tourneyDispatch(TournamentDataReducers.AddTieBreak(defaultId(id)));
      };

    let moveTb = direction => {
      switch (selectedTb) {
      | None => ()
      | Some(selectedTb) =>
        let index = tieBreaks |> Js.Array.indexOf(selectedTb);
        tourneyDispatch(MoveTieBreak(index, index + direction));
      };
    };

    <Utils.PanelContainer className="content-area">
      <Utils.Panel>
        <div className="toolbar">
          <button
            className="button-micro"
            disabled={selectedTb === None}
            onClick={_ => toggleTb(None)}>
            {React.string("Toggle")}
          </button>
          <button
            className="button-micro"
            disabled={selectedTb === None}
            onClick={_ => moveTb(-1)}>
            <Icons.ArrowUp />
            {React.string(" Move up")}
          </button>
          <button
            className="button-micro"
            disabled={selectedTb === None}
            onClick={_ => moveTb(1)}>
            <Icons.ArrowDown />
            {React.string(" Move down")}
          </button>
          <button
            className={Cn.make([
              "button-micro",
              "button-primary"->Cn.ifSome(selectedTb),
            ])}
            disabled={selectedTb === None}
            onClick={_ => setSelectedTb(_ => None)}>
            {React.string("Done")}
          </button>
        </div>
        <table>
          <caption className="title-30">
            {React.string("Selected tiebreak methods")}
          </caption>
          <thead>
            <tr>
              <th> {React.string("Name")} </th>
              <th>
                <Utils.VisuallyHidden>
                  {React.string("Controls")}
                </Utils.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {tieBreaks
             |> Js.Array.map(id =>
                  <tr
                    key={id |> string_of_int}
                    className={Cn.make([
                      "selected"->Cn.ifTrue(selectedTb === Some(id)),
                    ])}>
                    <td>
                      {Scoring.tieBreakMethods->Array.getExn(id).name
                       |> React.string}
                    </td>
                    <td style={ReactDOMRe.Style.make(~width="48px", ())}>
                      <button
                        className="button-micro"
                        disabled={
                          selectedTb !== None && selectedTb !== Some(id)
                        }
                        onClick={_ =>
                          switch (selectedTb) {
                          | None => setSelectedTb(_ => Some(id))
                          | Some(selectedTb) =>
                            selectedTb === id
                              ? setSelectedTb(_ => None)
                              : setSelectedTb(_ => Some(id))
                          }
                        }>
                        {React.string(
                           switch (selectedTb) {
                           | None => "Edit"
                           | Some(selectedTb) =>
                             selectedTb === id ? "Done" : "Edit"
                           },
                         )}
                      </button>
                    </td>
                  </tr>
                )
             |> React.array}
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <div className="toolbar"> {React.string(Utils.Entities.nbsp)} </div>
        <table style={ReactDOMRe.Style.make(~marginTop="16px", ())}>
          <caption className="title-30">
            {React.string("Available tiebreak methods")}
          </caption>
          <thead>
            <tr>
              <th> {React.string("Name")} </th>
              <th>
                <Utils.VisuallyHidden>
                  {React.string("Controls")}
                </Utils.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {Scoring.tieBreakMethods
             |> Js.Array.map((m: Scoring.tieBreakData) =>
                  <tr key={m.id |> string_of_int}>
                    <td>
                      <span
                        className={
                          tieBreaks |> Js.Array.includes(m.id)
                            ? "disabled" : "enabled"
                        }>
                        {React.string(m.name)}
                      </span>
                    </td>
                    <td>
                      {tieBreaks |> Js.Array.includes(m.id)
                         ? React.null
                         : <button
                             className="button-micro"
                             onClick={_ => toggleTb(Some(m.id))}>
                             {React.string("Add")}
                           </button>}
                    </td>
                  </tr>
                )
             |> React.array}
          </tbody>
        </table>
      </Utils.Panel>
    </Utils.PanelContainer>;
  };
};

[@react.component]
let make = (~tournament) => {
  let {TournamentData.getPlayer, TournamentData.tourney} = tournament;
  let tourneyDispatch = tournament.tourneyDispatch;
  Utils.Tabs.(
    <Tabs>
      <TabList>
        <Tab> <Icons.List /> {React.string(" Scores")} </Tab>
        <Tab> <Icons.Settings /> {React.string(" Edit tiebreak rules")} </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ScoreTable tourney getPlayer title="Score detail" />
        </TabPanel>
        <TabPanel> <SelectTieBreaks tourney tourneyDispatch /> </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

module Crosstable = {
  [@react.component]
  let make = (~tournament) => {
    let {TournamentData.tourney, TournamentData.getPlayer} = tournament;
    let {Data.Tournament.tieBreaks, Data.Tournament.roundList} = tourney;
    let scoreData =
      Data.rounds2Matches(~roundList, ()) |> Data.Converters.matches2ScoreData;
    let standings = Scoring.createStandingList(tieBreaks, scoreData);

    let getXScore = (player1Id, player2Id) =>
      if (player1Id === player2Id) {
        <Icons.X className="disabled" />;
      } else {
        switch (scoreData->Map.String.get(player1Id)) {
        | None => React.null
        | Some(scoreData) =>
          switch (scoreData.opponentResults->Map.String.get(player2Id)) {
          | None => React.null
          | Some(result) =>
            Numeral.make(result)->Numeral.format("1/2")->React.string
          }
        };
      };

    let getRatingChangeTds = playerId => {
      let firstRating =
        scoreData->Map.String.getExn(playerId).firstRating->float_of_int;
      let lastRating =
        switch (scoreData->Map.String.getExn(playerId).ratings) {
        | [] => firstRating
        | [rating, ..._] => rating->float_of_int
        };
      let change =
        Numeral.make(lastRating -. firstRating)->Numeral.format("+0");
      <>
        <td className={Cn.make([Style.rowTd, "table__number"])}>
          {lastRating |> Js.Float.toString |> React.string}
        </td>
        <td className={Cn.make([Style.rowTd, "table__number body-10"])}>
          {React.string(change)}
        </td>
      </>;
    };

    <table className=Style.table>
      <caption> {React.string("Crosstable")} </caption>
      <thead>
        <tr>
          <th> {React.string("#")} </th>
          <th> {React.string("Name")} </th>
          /* Display a rank as a shorthand for each player. */
          {standings
           |> Js.Array.mapi((_, rank) =>
                <th key={rank |> string_of_int}>
                  {rank + 1 |> string_of_int |> React.string}
                </th>
              )
           |> React.array}
          <th> {React.string("Score")} </th>
          <th colSpan=2> {React.string("Rating")} </th>
        </tr>
      </thead>
      <tbody>
        {standings
         |> Js.Array.mapi((standing: Scoring.standing, index) =>
              <tr key={index |> string_of_int} className=Style.row>
                <th
                  className={Cn.make([Style.rowTh, Style.rank])} scope="col">
                  {index + 1 |> string_of_int |> React.string}
                </th>
                <th
                  className={Cn.make([Style.rowTh, Style.playerName])}
                  scope="row">
                  {React.string(getPlayer(standing.id).firstName)}
                  {React.string(Utils.Entities.nbsp)}
                  {React.string(getPlayer(standing.id).lastName)}
                </th>
                /* Output a cell for each other player */
                {standings
                 |> Js.Array.mapi((opponent: Scoring.standing, index2) =>
                      <td
                        key={index2 |> string_of_int}
                        className={Cn.make([Style.rowTd, "table__number"])}>
                        {getXScore(standing.id, opponent.id)}
                      </td>
                    )
                 |> React.array}
                /* Output their score and rating change */
                <td className={Cn.make([Style.rowTd, "table__number"])}>
                  {Numeral.make(standing.score)
                   ->Numeral.format("1/2")
                   ->React.string}
                </td>
                {getRatingChangeTds(standing.id)}
              </tr>
            )
         |> React.array}
      </tbody>
    </table>;
    /* Output a row for each player */
  };
};