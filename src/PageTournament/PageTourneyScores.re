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
    let {Tournament.tieBreaks, roundList} = tourney;
    let tieBreakNames = tieBreaks |> Js.Array.map(Tournament.mapTieBreakName);
    let standingTree =
      Rounds.rounds2Matches(~roundList, ())
      ->Converters.matches2ScoreData
      ->Scoring.createStandingList(tieBreaks)
      ->List.keep(standing => !Data.Player.isDummyId(standing.Scoring.id))
      ->Scoring.createStandingTree;
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
        {standingTree->Utils.List.toReactArrayReverseWithIndex(
           (rank, standingsFlat) =>
           standingsFlat->Utils.List.toReactArrayReverseWithIndex(
             (i, standing) =>
             <tr key={standing.id} className=Style.row>
               {i === 0
                  /* Only display the rank once */
                  ? <th
                      className={Cn.make([
                        "table__number",
                        Style.number,
                        Style.rank,
                        Style.rowTh,
                      ])}
                      rowSpan={List.size(standingsFlat)}
                      scope="row">
                      {rank + 1 |> string_of_int |> React.string}
                    </th>
                  : React.null}
               /* It just uses <td> if it's compact.*/
               {isCompact
                  ? <td className={Cn.make([Style.rowTd, Style.playerName])}>
                      {React.string(getPlayer(standing.id).Player.firstName)}
                      {React.string(Utils.Entities.nbsp)}
                      {React.string(getPlayer(standing.id).lastName)}
                    </td>  /* Use the name as a header if not compact. */
                  : <th
                      className={Cn.make([Style.rowTh, Style.playerName])}
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

                   Numeral.(standing.score->make->format("1/2"))->React.string
                 </td>
               {isCompact
                  ? React.null
                  : standing.tieBreaks
                    ->Utils.List.toReactArray(((j, score)) =>
                        <td
                          key={Tournament.mapTieBreakName(j)}
                          className={Cn.make([Style.rowTd, "table__number"])}>
                          /*dataTestid={dashify(
                              getPlayer(standing.id).firstName
                              + getPlayer(standing.id).lastName
                              + tieBreakNames[j],
                            )}*/

                            Numeral.(score->make->format("1/2"))->React.string
                          </td>
                      )}
             </tr>
           )
         )}
      </tbody>
    </table>;
  };
};

module SelectTieBreaks = {
  [@react.component]
  let make = (~tourney, ~setTourney) => {
    let tieBreaks = tourney.Tournament.tieBreaks;
    let (selectedTb, setSelectedTb) = React.useState(() => None);
    let defaultId = x =>
      switch (x) {
      | Some(x) => x
      | None =>
        switch (selectedTb) {
        | Some(x) => x
        | None => Scoring.Median /* This should never happen.*/
        }
      };

    let toggleTb = id =>
      if (tieBreaks |> Js.Array.includes(defaultId(id))) {
        setTourney({
          ...tourney,
          tieBreaks:
            tourney.tieBreaks
            |> Js.Array.filter(tbId => defaultId(id) !== tbId),
        });
        setSelectedTb(_ => None);
      } else {
        setTourney({
          ...tourney,
          tieBreaks: tourney.tieBreaks |> Js.Array.concat([|defaultId(id)|]),
        });
      };

    let moveTb = direction => {
      switch (selectedTb) {
      | None => ()
      | Some(selectedTb) =>
        let index = tieBreaks |> Js.Array.indexOf(selectedTb);
        setTourney({
          ...tourney,
          tieBreaks:
            tourney.tieBreaks->Utils.Array.swap(index, index + direction),
        });
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
             |> Js.Array.map(tieBreak =>
                  <tr
                    key={Tournament.tieBreakToString(tieBreak)}
                    className={Cn.make([
                      "selected"->Cn.ifTrue(selectedTb === Some(tieBreak)),
                    ])}>
                    <td>
                      {Tournament.mapTieBreakName(tieBreak) |> React.string}
                    </td>
                    <td style={ReactDOMRe.Style.make(~width="48px", ())}>
                      <button
                        className="button-micro"
                        disabled={
                          selectedTb !== None && selectedTb !== Some(tieBreak)
                        }
                        onClick={_ =>
                          switch (selectedTb) {
                          | None => setSelectedTb(_ => Some(tieBreak))
                          | Some(selectedTb) =>
                            selectedTb === tieBreak
                              ? setSelectedTb(_ => None)
                              : setSelectedTb(_ => Some(tieBreak))
                          }
                        }>
                        {React.string(
                           switch (selectedTb) {
                           | None => "Edit"
                           | Some(selectedTb) =>
                             selectedTb === tieBreak ? "Done" : "Edit"
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
            {[|
               Scoring.Median,
               Solkoff,
               Cumulative,
               CumulativeOfOpposition,
               MostBlack,
             |]
             |> Js.Array.map(tieBreak =>
                  <tr key={Tournament.tieBreakToString(tieBreak)}>
                    <td>
                      <span
                        className={
                          tieBreaks |> Js.Array.includes(tieBreak)
                            ? "disabled" : "enabled"
                        }>
                        {tieBreak |> Tournament.mapTieBreakName |> React.string}
                      </span>
                    </td>
                    <td>
                      {tieBreaks |> Js.Array.includes(tieBreak)
                         ? React.null
                         : <button
                             className="button-micro"
                             onClick={_ => toggleTb(Some(tieBreak))}>
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
  let {LoadTournament.getPlayer, tourney, setTourney} = tournament;
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
        <TabPanel> <SelectTieBreaks tourney setTourney /> </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

module Crosstable = {
  let getXScore = (scoreData, player1Id, player2Id) =>
    if (player1Id === player2Id) {
      <Icons.X className="disabled" />;
    } else {
      switch (Map.String.get(scoreData, player1Id)) {
      | None => React.null
      | Some(scoreData) =>
        switch (Map.String.get(scoreData.Scoring.opponentResults, player2Id)) {
        | None => React.null
        | Some(result) =>
          Numeral.make(result)->Numeral.format("1/2")->React.string
        }
      };
    };

  let getRatingChangeTds = (scoreData, playerId) => {
    let firstRating =
      scoreData->Map.String.getExn(playerId).Scoring.firstRating;
    let lastRating =
      switch (Map.String.getExn(scoreData, playerId).ratings) {
      | [] => firstRating
      | [rating, ..._] => rating
      };
    let change =
      float_of_int(lastRating - firstRating)
      ->Numeral.make
      ->Numeral.format("+0");
    <>
      <td className={Cn.make([Style.rowTd, "table__number"])}>
        {lastRating |> Js.Int.toString |> React.string}
      </td>
      <td className={Cn.make([Style.rowTd, "table__number body-10"])}>
        {React.string(change)}
      </td>
    </>;
  };

  [@react.component]
  let make = (~tournament) => {
    let {LoadTournament.tourney, getPlayer} = tournament;
    let {Tournament.tieBreaks, roundList} = tourney;
    let scoreData =
      Rounds.rounds2Matches(~roundList, ()) |> Converters.matches2ScoreData;
    let standings = Scoring.createStandingList(scoreData, tieBreaks);

    <table className=Style.table>
      <caption> {React.string("Crosstable")} </caption>
      <thead>
        <tr>
          <th> {React.string("#")} </th>
          <th> {React.string("Name")} </th>
          /* Display a rank as a shorthand for each player. */
          {Utils.List.toReactArrayWithIndex(standings, (rank, _) =>
             <th key={string_of_int(rank)}>
               {rank + 1 |> string_of_int |> React.string}
             </th>
           )}
          <th> {React.string("Score")} </th>
          <th colSpan=2> {React.string("Rating")} </th>
        </tr>
      </thead>
      <tbody>
        {Utils.List.toReactArrayWithIndex(standings, (index, standing) =>
           <tr key={string_of_int(index)} className=Style.row>
             <th className={Cn.make([Style.rowTh, Style.rank])} scope="col">
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
             {Utils.List.toReactArrayWithIndex(standings, (index2, opponent) =>
                <td
                  key={string_of_int(index2)}
                  className={Cn.make([Style.rowTd, "table__number"])}>
                  {getXScore(scoreData, standing.id, opponent.id)}
                </td>
              )}
             /* Output their score and rating change */
             <td className={Cn.make([Style.rowTd, "table__number"])}>
               {Numeral.make(standing.score)
                ->Numeral.format("1/2")
                ->React.string}
             </td>
             {getRatingChangeTds(scoreData, standing.id)}
           </tr>
         )}
      </tbody>
    </table>;
  };
};