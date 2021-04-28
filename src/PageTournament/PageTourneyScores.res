/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Data
module Id = Data.Id

type size = Compact | Expanded

module ScoreTable = {
  @react.component
  let make = (~size, ~tourney: Tournament.t, ~getPlayer, ~title) => {
    let {tieBreaks, roundList, scoreAdjustments, _} = tourney
    let standingTree =
      Scoring.fromTournament(~roundList, ~scoreAdjustments)
      ->Scoring.createStandingArray(tieBreaks)
      ->Array.keep(({id, _}) => !Data.Id.isDummy(id))
      ->Scoring.createStandingTree(~tieBreaks)
    <table className={"pagescores__table"}>
      <caption
        className={switch size {
        | Compact => "title-30"
        | Expanded => "title-40"
        }}>
        {React.string(title)}
      </caption>
      <thead>
        <tr className="pagescores__topheader">
          <th className="title-10" scope="col"> {React.string("Rank")} </th>
          <th className="title-10" scope="col"> {React.string("Name")} </th>
          <th className="title-10" scope="col"> {React.string("Score")} </th>
          {switch size {
          | Compact => React.null
          | Expanded =>
            tieBreaks
            ->Array.map(tb =>
              <th key={Scoring.TieBreak.toString(tb)} className="title-10" scope="col">
                {tb->Scoring.TieBreak.toPrettyString->React.string}
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
            <tr key={standing.id->Data.Id.toString} className="pagescores__row">
              {i == 0
              /* Only display the rank once */
                ? <th
                    className={"table__number pagescores__number pagescores__rank pagescores__row-th"}
                    rowSpan={List.size(standingsFlat)}
                    scope="row">
                    {React.int(rank + 1)}
                  </th>
                : React.null}
              {/* It just uses <td> if it's compact. */
              switch size {
              | Compact =>
                <td className={"pagescores__row-td pagescores__playername"}>
                  {standing.id->getPlayer->Player.fullName->React.string}
                </td> /* Use the name as a header if not compact. */
              | Expanded =>
                <Utils.TestId
                  testId={"rank-" ++ (Int.toString(rank + 1) ++ ("." ++ Int.toString(i)))}>
                  <th className={"pagescores__row-th pagescores__playername"} scope="row">
                    {standing.id->getPlayer->Player.fullName->React.string}
                  </th>
                </Utils.TestId>
              }}
              <td className={"pagescores__number pagescores__row-td table__number"}>
                {standing.score->Scoring.Score.Sum.toNumeral->Numeral.format("1/2")->React.string}
              </td>
              {switch size {
              | Compact => React.null
              | Expanded =>
                tieBreaks
                ->Array.map(tb =>
                  <td
                    key={Scoring.TieBreak.toString(tb)}
                    className={"pagescores__row-td table__number"}>
                    {Scoring.getTieBreak(standing, tb)
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
    </table>
  }
}

module SelectTieBreaks = {
  @react.component
  let make = (~tourney: Tournament.t, ~setTourney) => {
    let {tieBreaks, _} = tourney
    let (selectedTb: option<Scoring.TieBreak.t>, setSelectedTb) = React.useState(() => None)
    let defaultId = x =>
      switch x {
      | Some(x) => x
      | None =>
        switch selectedTb {
        | Some(x) => x
        | None => Median /* This should never happen. */
        }
      }

    let toggleTb = id =>
      if Js.Array2.includes(tieBreaks, defaultId(id)) {
        setTourney({
          ...tourney,
          tieBreaks: Js.Array2.filter(tourney.tieBreaks, tbId => defaultId(id) != tbId),
        })
        setSelectedTb(_ => None)
      } else {
        setTourney({
          ...tourney,
          tieBreaks: Js.Array2.concat(tourney.tieBreaks, [defaultId(id)]),
        })
      }

    let moveTb = direction =>
      switch selectedTb {
      | None => ()
      | Some(selectedTb) =>
        let index = Js.Array2.indexOf(tieBreaks, selectedTb)
        setTourney({
          ...tourney,
          tieBreaks: Utils.Array.swap(tourney.tieBreaks, index, index + direction),
        })
      }

    <Utils.PanelContainer className="content-area">
      <Utils.Panel>
        <div className="toolbar">
          <button
            className="button-micro" disabled={selectedTb == None} onClick={_ => toggleTb(None)}>
            {React.string("Toggle")}
          </button>
          <button className="button-micro" disabled={selectedTb == None} onClick={_ => moveTb(-1)}>
            <Icons.ArrowUp /> {React.string(" Move up")}
          </button>
          <button className="button-micro" disabled={selectedTb == None} onClick={_ => moveTb(1)}>
            <Icons.ArrowDown /> {React.string(" Move down")}
          </button>
          <button
            className={Cn.append("button-micro", "button-primary"->Cn.onSome(selectedTb))}
            disabled={selectedTb == None}
            onClick={_ => setSelectedTb(_ => None)}>
            {React.string("Done")}
          </button>
        </div>
        <table>
          <caption className="title-30"> {React.string("Selected tiebreak methods")} </caption>
          <thead>
            <tr>
              <th> {React.string("Name")} </th>
              <th>
                <Externals.VisuallyHidden> {React.string("Controls")} </Externals.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {Array.map(tieBreaks, tieBreak =>
              <tr
                key={Scoring.TieBreak.toString(tieBreak)}
                className={Option.mapWithDefault(selectedTb, "", x =>
                  x == tieBreak ? "selected" : ""
                )}>
                <td> {Scoring.TieBreak.toPrettyString(tieBreak)->React.string} </td>
                <td style={ReactDOMRe.Style.make(~width="48px", ())}>
                  <button
                    className="button-micro"
                    disabled={selectedTb != None && selectedTb !== Some(tieBreak)}
                    onClick={_ =>
                      switch selectedTb {
                      | None => setSelectedTb(_ => Some(tieBreak))
                      | Some(selectedTb) =>
                        selectedTb == tieBreak
                          ? setSelectedTb(_ => None)
                          : setSelectedTb(_ => Some(tieBreak))
                      }}>
                    {React.string(
                      switch selectedTb {
                      | None => "Edit"
                      | Some(selectedTb) => selectedTb == tieBreak ? "Done" : "Edit"
                      },
                    )}
                  </button>
                </td>
              </tr>
            )->React.array}
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <div className="toolbar"> {React.string(HtmlEntities.nbsp)} </div>
        <table style={ReactDOMRe.Style.make(~marginTop="16px", ())}>
          <caption className="title-30"> {React.string("Available tiebreak methods")} </caption>
          <thead>
            <tr>
              <th> {React.string("Name")} </th>
              <th>
                <Externals.VisuallyHidden> {React.string("Controls")} </Externals.VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody className="content">
            {[Scoring.TieBreak.Median, Solkoff, Cumulative, CumulativeOfOpposition, MostBlack]
            ->Array.map(tieBreak =>
              <tr key={Scoring.TieBreak.toString(tieBreak)}>
                <td>
                  <span
                    className={Js.Array2.includes(tieBreaks, tieBreak) ? "disabled" : "enabled"}>
                    {tieBreak->Scoring.TieBreak.toPrettyString->React.string}
                  </span>
                </td>
                <td>
                  {Js.Array2.includes(tieBreaks, tieBreak)
                    ? React.null
                    : <button className="button-micro" onClick={_ => toggleTb(Some(tieBreak))}>
                        {React.string("Add")}
                      </button>}
                </td>
              </tr>
            )
            ->React.array}
          </tbody>
        </table>
      </Utils.Panel>
    </Utils.PanelContainer>
  }
}

@react.component
let make = (~tournament: LoadTournament.t) => {
  let {getPlayer, tourney, setTourney, _} = tournament
  open Externals.ReachTabs
  <Tabs>
    <TabList>
      <Tab> <Icons.List /> {React.string(" Scores")} </Tab>
      <Tab> <Icons.Settings /> {React.string(" Edit tiebreak rules")} </Tab>
    </TabList>
    <TabPanels>
      <TabPanel> <ScoreTable size=Expanded tourney getPlayer title="Score detail" /> </TabPanel>
      <TabPanel> <SelectTieBreaks tourney setTourney /> </TabPanel>
    </TabPanels>
  </Tabs>
}

module Crosstable = {
  let getXScore = (scoreData, player1Id, player2Id) =>
    if Id.eq(player1Id, player2Id) {
      <Icons.X className="pagescores__x" />
    } else {
      switch Map.get(scoreData, player1Id) {
      | None => React.null
      | Some(scoreData) =>
        switch Scoring.oppResultsToSumById(scoreData, player2Id) {
        | None => React.null
        | Some(result) => result->Scoring.Score.Sum.toNumeral->Numeral.format("1/2")->React.string
        }
      }
    }

  let getRatingChangeTds = (scoreData, playerId) => {
    let firstRating =
      Map.get(scoreData, playerId)->Option.map(x => x.Scoring.firstRating)->Option.getWithDefault(0)
    let lastRating =
      Map.get(scoreData, playerId)
      ->Option.flatMap(x => List.head(x.ratings))
      ->Option.getWithDefault(firstRating)
    let change = Numeral.fromInt(lastRating - firstRating)->Numeral.format("+0")
    <>
      <td className={"pagescores__row-td table__number"}> {lastRating->React.int} </td>
      <td className={"pagescores__row-td table__number body-10"}> {React.string(change)} </td>
    </>
  }

  @react.component
  let make = (
    ~tournament as {
      tourney: {tieBreaks, roundList, scoreAdjustments, _},
      getPlayer,
      _,
    }: LoadTournament.t,
  ) => {
    let scoreData = Scoring.fromTournament(~roundList, ~scoreAdjustments)
    let standings = Scoring.createStandingArray(scoreData, tieBreaks)

    <table className="pagescores__table">
      <caption> {React.string("Crosstable")} </caption>
      <thead>
        <tr>
          <th> {React.string("#")} </th>
          <th> {React.string("Name")} </th>
          {/* Display a rank as a shorthand for each player. */
          standings
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
        ->Array.mapWithIndex((index, standing) =>
          <tr key={Int.toString(index)} className="pagescores__row">
            <th className={"pagescores__row-th pagescores__rank"} scope="col">
              {React.int(index + 1)}
            </th>
            <th className={"pagescores__row-th pagescores__playername"} scope="row">
              {standing.id->getPlayer->Player.fullName->React.string}
            </th>
            {/* Output a cell for each other player */
            standings
            ->Array.mapWithIndex((index2, opponent) =>
              <td key={Int.toString(index2)} className={"pagescores__row-td table__number"}>
                {getXScore(scoreData, standing.id, opponent.id)}
              </td>
            )
            ->React.array}
            /* Output their score and rating change */
            <td className={"pagescores__row-td table__number"}>
              {standing.score->Scoring.Score.Sum.toNumeral->Numeral.format("1/2")->React.string}
            </td>
            {getRatingChangeTds(scoreData, standing.id)}
          </tr>
        )
        ->React.array}
      </tbody>
    </table>
  }
}
