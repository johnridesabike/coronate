open Belt;
open Data;
module Id = Data.Id;

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

type size =
  | Compact
  | Expanded;

let isCompact =
  fun
  | Compact => true
  | Expanded => false;

module ScoreTable = {
  [@react.component]
  let make = (~size=Expanded, ~tourney, ~getPlayer, ~title) => {
    let Tournament.{tieBreaks, roundList, scoreAdjustments, _} = tourney;
    let tieBreakNames = Array.map(tieBreaks, Scoring.TieBreak.toPrettyString);
    let standingTree =
      Converters.tournament2ScoreData(~roundList, ~scoreAdjustments)
      ->Scoring.createStandingList(tieBreaks)
      ->List.keep(({id, _}) => !Data.Id.isDummy(id))
      ->Scoring.createStandingTree;
    <table className=Cn.(Style.table <:> Style.compact->on(isCompact(size)))>
      <caption
        className=Cn.(
          "title-30"->on(isCompact(size))
          <:> "title-40"->on(!isCompact(size))
        )>
        {React.string(title)}
      </caption>
      <thead>
        <tr className=Style.topHeader>
          <th className="title-10" scope="col"> {React.string("Rank")} </th>
          <th className="title-10" scope="col"> {React.string("Name")} </th>
          <th className="title-10" scope="col"> {React.string("Score")} </th>
          {switch (size) {
           | Compact => React.null
           | Expanded =>
             Array.mapWithIndex(tieBreakNames, (i, name) =>
               <th key={Int.toString(i)} className="title-10" scope="col">
                 {React.string(name)}
               </th>
             )
             ->React.array
           }}
        </tr>
      </thead>
      <tbody>
        {standingTree
         ->List.toArray
         ->Array.reverse
         ->Array.mapWithIndex((rank, standingsFlat) =>
             standingsFlat
             ->List.toArray
             ->Array.reverse
             ->Array.mapWithIndex((i, standing) =>
                 <tr
                   key={standing.Scoring.id->Data.Id.toString}
                   className=Style.row>
                   {i == 0
                      /* Only display the rank once */
                      ? <th
                          className=Cn.(
                            "table__number"
                            <:> Style.number
                            <:> Style.rank
                            <:> Style.rowTh
                          )
                          rowSpan={List.size(standingsFlat)}
                          scope="row">
                          {React.int(rank + 1)}
                        </th>
                      : React.null}
                   /* It just uses <td> if it's compact.*/
                   {switch (size) {
                    | Compact =>
                      <td className=Cn.(Style.rowTd <:> Style.playerName)>
                        {getPlayer(standing.Scoring.id).Player.firstName
                         |> React.string}
                        Utils.Entities.nbsp->React.string
                        {getPlayer(standing.Scoring.id).Player.lastName
                         |> React.string}
                      </td> /* Use the name as a header if not compact. */
                    | Expanded =>
                      <Utils.TestId
                        testId={
                          "rank-"
                          ++ Int.toString(rank + 1)
                          ++ "."
                          ++ Int.toString(i)
                        }>
                        <th
                          className=Cn.(Style.rowTh <:> Style.playerName)
                          scope="row">
                          {getPlayer(standing.Scoring.id).Player.firstName
                           |> React.string}
                          Utils.Entities.nbsp->React.string
                          {getPlayer(standing.Scoring.id).Player.lastName
                           |> React.string}
                        </th>
                      </Utils.TestId>
                    }}
                   <td
                     className=Cn.(
                       Style.number <:> Style.rowTd <:> "table__number"
                     )>
                     {standing.Scoring.score
                      ->Scoring.Score.Sum.toNumeral
                      ->Numeral.format("1/2")
                      ->React.string}
                   </td>
                   {switch (size) {
                    | Compact => React.null
                    | Expanded =>
                      standing.Scoring.tieBreaks
                      ->List.toArray
                      ->Array.map(((j, score)) =>
                          <td
                            key={Scoring.TieBreak.toString(j)}
                            className=Cn.(Style.rowTd <:> "table__number")>
                            {score
                             ->Scoring.Score.Sum.toNumeral
                             ->Numeral.format("1/2")
                             ->React.string}
                          </td>
                        )
                      ->React.array
                    }}
                 </tr>
               )
             ->React.array
           )
         ->React.array}
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
        | None => Scoring.TieBreak.Median /* This should never happen.*/
        }
      };

    let toggleTb = id =>
      if (Js.Array2.includes(tieBreaks, defaultId(id))) {
        setTourney(
          Tournament.{
            ...tourney,
            tieBreaks:
              Js.Array2.filter(tourney.tieBreaks, tbId =>
                !Scoring.TieBreak.eq(defaultId(id), tbId)
              ),
          },
        );
        setSelectedTb(_ => None);
      } else {
        setTourney(
          Tournament.{
            ...tourney,
            tieBreaks:
              Js.Array2.concat(tourney.tieBreaks, [|defaultId(id)|]),
          },
        );
      };

    let moveTb = direction => {
      switch (selectedTb) {
      | None => ()
      | Some(selectedTb) =>
        let index = Js.Array2.indexOf(tieBreaks, selectedTb);
        setTourney(
          Tournament.{
            ...tourney,
            tieBreaks:
              Utils.Array.swap(tourney.tieBreaks, index, index + direction),
          },
        );
      };
    };

    <Utils.PanelContainer className="content-area">
      <Utils.Panel>
        <div className="toolbar">
          <button
            className="button-micro"
            disabled={selectedTb == None}
            onClick={_ => toggleTb(None)}>
            {React.string("Toggle")}
          </button>
          <button
            className="button-micro"
            disabled={selectedTb == None}
            onClick={_ => moveTb(-1)}>
            <Icons.ArrowUp />
            {React.string(" Move up")}
          </button>
          <button
            className="button-micro"
            disabled={selectedTb == None}
            onClick={_ => moveTb(1)}>
            <Icons.ArrowDown />
            {React.string(" Move down")}
          </button>
          <button
            className=Cn.(
              "button-micro" <:> "button-primary"->onSome(selectedTb)
            )
            disabled={selectedTb == None}
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
                <Externals.VisuallyHidden>
                  {React.string("Controls")}
                </Externals.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {Array.map(tieBreaks, tieBreak =>
               <tr
                 key={Scoring.TieBreak.toString(tieBreak)}
                 className=Cn.(
                   mapSome(selectedTb, x => x == tieBreak ? "selected" : "")
                 )>
                 <td>
                   {Scoring.TieBreak.toPrettyString(tieBreak)->React.string}
                 </td>
                 <td style={ReactDOMRe.Style.make(~width="48px", ())}>
                   <button
                     className="button-micro"
                     disabled={
                       selectedTb != None && selectedTb !== Some(tieBreak)
                     }
                     onClick={_ =>
                       switch (selectedTb) {
                       | None => setSelectedTb(_ => Some(tieBreak))
                       | Some(selectedTb) =>
                         Scoring.TieBreak.eq(selectedTb, tieBreak)
                           ? setSelectedTb(_ => None)
                           : setSelectedTb(_ => Some(tieBreak))
                       }
                     }>
                     {React.string(
                        switch (selectedTb) {
                        | None => "Edit"
                        | Some(selectedTb) =>
                          Scoring.TieBreak.eq(selectedTb, tieBreak)
                            ? "Done" : "Edit"
                        },
                      )}
                   </button>
                 </td>
               </tr>
             )
             ->React.array}
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
                <Externals.VisuallyHidden>
                  {React.string("Controls")}
                </Externals.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {Scoring.TieBreak.(
               [|
                 Median,
                 Solkoff,
                 Cumulative,
                 CumulativeOfOpposition,
                 MostBlack,
               |]
             )
             ->Array.map(tieBreak =>
                 <tr key={Scoring.TieBreak.toString(tieBreak)}>
                   <td>
                     <span
                       className={
                         Js.Array2.includes(tieBreaks, tieBreak)
                           ? "disabled" : "enabled"
                       }>
                       {tieBreak->Scoring.TieBreak.toPrettyString->React.string}
                     </span>
                   </td>
                   <td>
                     {Js.Array2.includes(tieBreaks, tieBreak)
                        ? React.null
                        : <button
                            className="button-micro"
                            onClick={_ => toggleTb(Some(tieBreak))}>
                            {React.string("Add")}
                          </button>}
                   </td>
                 </tr>
               )
             ->React.array}
          </tbody>
        </table>
      </Utils.Panel>
    </Utils.PanelContainer>;
  };
};

[@react.component]
let make = (~tournament) => {
  let LoadTournament.{getPlayer, tourney, setTourney, _} = tournament;
  Externals.ReachTabs.(
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
    if (Id.eq(player1Id, player2Id)) {
      <Icons.X className="disabled" />;
    } else {
      switch (Map.get(scoreData, player1Id)) {
      | None => React.null
      | Some(scoreData) =>
        switch (Scoring.oppResultsToSumById(scoreData, player2Id)) {
        | None => React.null
        | Some(result) =>
          result
          ->Scoring.Score.Sum.toNumeral
          ->Numeral.format("1/2")
          ->React.string
        }
      };
    };

  let getRatingChangeTds = (scoreData, playerId) => {
    let firstRating = scoreData->Map.getExn(playerId).Scoring.firstRating;
    let lastRating =
      switch (Map.getExn(scoreData, playerId).Scoring.ratings) {
      | [] => firstRating
      | [rating, ..._] => rating
      };
    let change =
      Numeral.fromInt(lastRating - firstRating)->Numeral.format("+0");
    <>
      <td className=Cn.(Style.rowTd <:> "table__number")>
        lastRating->React.int
      </td>
      <td className=Cn.(Style.rowTd <:> "table__number body-10")>
        {React.string(change)}
      </td>
    </>;
  };

  [@react.component]
  let make =
      (
        ~tournament as {
          LoadTournament.tourney: {tieBreaks, roundList, scoreAdjustments, _},
          getPlayer,
          _,
        },
      ) => {
    let scoreData =
      Converters.tournament2ScoreData(~roundList, ~scoreAdjustments);
    let standings = Scoring.createStandingList(scoreData, tieBreaks);

    <table className=Style.table>
      <caption> {React.string("Crosstable")} </caption>
      <thead>
        <tr>
          <th> {React.string("#")} </th>
          <th> {React.string("Name")} </th>
          /* Display a rank as a shorthand for each player. */
          {standings
           ->List.toArray
           ->Array.mapWithIndex((rank, _) =>
               <th key={Int.toString(rank)}> {React.int(rank + 1)} </th>
             )
           ->React.array}
          <th> {React.string("Score")} </th>
          <th colSpan=2> {React.string("Rating")} </th>
        </tr>
      </thead>
      <tbody>
        {standings
         ->List.toArray
         ->Array.mapWithIndex((index, standing) =>
             <tr key={Int.toString(index)} className=Style.row>
               <th className=Cn.(Style.rowTh <:> Style.rank) scope="col">
                 {React.int(index + 1)}
               </th>
               <th className=Cn.(Style.rowTh <:> Style.playerName) scope="row">
                 {React.string(
                    getPlayer(standing.Scoring.id).Player.firstName,
                  )}
                 {React.string(Utils.Entities.nbsp)}
                 {React.string(
                    getPlayer(standing.Scoring.id).Player.lastName,
                  )}
               </th>
               /* Output a cell for each other player */
               {standings
                ->List.toArray
                ->Array.mapWithIndex((index2, opponent) =>
                    <td
                      key={Int.toString(index2)}
                      className=Cn.(Style.rowTd <:> "table__number")>
                      {getXScore(
                         scoreData,
                         standing.Scoring.id,
                         opponent.Scoring.id,
                       )}
                    </td>
                  )
                ->React.array}
               /* Output their score and rating change */
               <td className=Cn.(Style.rowTd <:> "table__number")>
                 {standing.Scoring.score
                  ->Scoring.Score.Sum.toNumeral
                  ->Numeral.format("1/2")
                  ->React.string}
               </td>
               {getRatingChangeTds(scoreData, standing.Scoring.id)}
             </tr>
           )
         ->React.array}
      </tbody>
    </table>;
  };
};
