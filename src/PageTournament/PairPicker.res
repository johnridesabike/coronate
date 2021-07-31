/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Data
module Id = Data.Id

let autoPair = (~pairData, ~byeValue, ~playerMap, ~byeQueue) => {
  /* the pairData includes any players who were already matched. We need to
   only include the specified players. */
  let filteredData = Map.keep(pairData, (id, _) => Map.has(playerMap, id))
  let (pairdataNoByes, byePlayerData) = Pairing.setByePlayer(byeQueue, Id.dummy, filteredData)
  let pairs = Pairing.pairPlayers(pairdataNoByes)->MutableQueue.fromArray
  switch byePlayerData {
  | Some(player) => MutableQueue.add(pairs, (Pairing.id(player), Id.dummy))
  | None => ()
  }
  let getPlayer = Player.getMaybe(playerMap)
  MutableQueue.map(pairs, ((whiteId, blackId)) => {
    let white = getPlayer(whiteId)
    let black = getPlayer(blackId)
    {
      Match.id: Id.random(),
      whiteOrigRating: white.rating,
      blackOrigRating: black.rating,
      whiteNewRating: white.rating,
      blackNewRating: black.rating,
      whiteId: whiteId,
      blackId: blackId,
      result: Match.Result.scoreByeMatch(
        ~default=NotSet,
        ~white=whiteId,
        ~black=blackId,
        ~byeValue,
      ),
    }
  })
}

type listEntry = {
  player: Player.t,
  ideal: float,
}

type num = Zero | One | Two

type state = {
  p1: option<Id.t>,
  p2: option<Id.t>,
  result: Match.Result.t,
  num: num,
  byeValue: Config.ByeValue.t, // cached from global config
}

let numFromPair = (a, b) =>
  switch (a, b) {
  | (None, None) => Zero
  | (Some(_), Some(_)) => Two
  | _ => One
  }

let validateResult = (a, b, byeValue, default) =>
  switch (a, b) {
  | (Some(white), Some(black)) => Match.Result.scoreByeMatch(~white, ~black, ~default, ~byeValue)
  | _ => NotSet
  }

type action = RemoveP1 | RemoveP2 | Add(Id.t) | SetResult(Match.Result.t) | Reverse | Clear

let reducer = ({p1, p2, result, byeValue, _} as state, action) =>
  switch action {
  | RemoveP1 => {
      ...state,
      p1: None,
      num: numFromPair(None, p2),
      result: NotSet,
    }
  | RemoveP2 => {
      ...state,
      p2: None,
      num: numFromPair(p1, None),
      result: NotSet,
    }
  | SetResult(result) => {...state, result: result}
  | Reverse => {
      ...state,
      p1: p2,
      p2: p1,
      result: Match.Result.reverse(result),
    }
  | Add(id) =>
    let (p1, p2) = switch (p1, p2) {
    | (None, p2) => (Some(id), p2)
    | (p1, None) => (p1, Some(id))
    | _ => (p1, p2)
    }
    {
      ...state,
      p1: p1,
      p2: p2,
      num: numFromPair(p1, p2),
      result: validateResult(p1, p2, byeValue, result),
    }
  | Clear => {...state, p1: None, p2: None, num: Zero, result: NotSet}
  }

let useStageState = byeValue =>
  React.useReducer(reducer, {p1: None, p2: None, num: Zero, result: NotSet, byeValue: byeValue})

let sortByName = Hooks.GetString((. x) => x.player.firstName)
let sortByIdeal = Hooks.GetFloat((. x) => x.ideal)

module SelectPlayerRow = {
  let isPlayerSelectable = (state, id) =>
    switch (state.p1, state.p2) {
    | (Some(_), Some(_)) => false
    | (Some(id'), None) | (None, Some(id')) => !Id.eq(id', id)
    | (None, None) => true
    }

  @react.component
  let make = (~player: Player.t, ~ideal, ~state, ~dispatch) =>
    <tr className={Player.Type.toString(player.type_)}>
      <td>
        <button
          className="button-ghost"
          disabled={!isPlayerSelectable(state, player.id)}
          onClick={_ => dispatch(Add(player.id))}>
          <Icons.UserPlus />
          <Externals.VisuallyHidden>
            {`Add ${Player.fullName(player)}`->React.string}
          </Externals.VisuallyHidden>
        </button>
      </td>
      <td className="pageround__selectlist-name"> {player->Player.fullName->React.string} </td>
      <td>
        {switch state.num {
        | One => ideal->Numeral.make->Numeral.format("%")->React.string
        | Zero | Two => "-"->React.string
        }}
      </td>
    </tr>
}

module SelectList = {
  @react.component
  let make = (~pairData, ~state, ~dispatch, ~unmatched) => {
    let initialTable =
      unmatched->Map.valuesToArray->Array.map(player => {player: player, ideal: 0.0})
    let (sorted, sortedDispatch) = Hooks.useSortedTable(
      ~table=initialTable,
      ~column=sortByName,
      ~isDescending=false,
    )

    /* Hydrate the ideal to the table */
    React.useEffect4(() => {
      let calcIdealOrNot = player =>
        switch (state.p1, state.p2) {
        | (Some(id), None) | (None, Some(id)) =>
          switch Map.get(pairData, id) {
          | None => 0.0 /* It's a bye player */
          | Some(selectedPlayer) =>
            switch player {
            | None => 0.0 /* It's a bye player */
            | Some(player) => Pairing.calcPairIdeal(selectedPlayer, player) /. Pairing.maxPriority
            }
          }
        | _ => 0.0
        }
      let table =
        unmatched
        ->Map.valuesToArray
        ->Array.map(player => {
          player: player,
          ideal: calcIdealOrNot(pairData->Map.get(player.id)),
        })

      sortedDispatch(SetTable(table))
      None
    }, (unmatched, pairData, sortedDispatch, state))

    /* only use unmatched players if this is the last round. */
    if Map.size(unmatched) == 0 {
      React.null
    } else {
      <table className="content pageround__select-list">
        <thead>
          <tr>
            <th>
              <Externals.VisuallyHidden> {React.string("Controls")} </Externals.VisuallyHidden>
            </th>
            <th>
              <Hooks.SortButton sortColumn=sortByName data=sorted dispatch=sortedDispatch>
                {React.string("Name")}
              </Hooks.SortButton>
            </th>
            <th>
              <Hooks.SortButton sortColumn=sortByIdeal data=sorted dispatch=sortedDispatch>
                {React.string("Ideal")}
              </Hooks.SortButton>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.table
          ->Array.map(({player, ideal}) =>
            <SelectPlayerRow key={player.id->Id.toString} player ideal state dispatch />
          )
          ->React.array}
          <SelectPlayerRow player=Player.dummy ideal=0.0 state dispatch />
        </tbody>
      </table>
    }
  }
}

module Stage = {
  @react.component
  let make = (
    ~getPlayer,
    ~pairData,
    ~roundId,
    ~state,
    ~dispatch,
    ~setTourney,
    ~byeValue,
    ~tourney: Tournament.t,
    ~round,
  ) => {
    let {roundList, _} = tourney

    let whiteName = switch state.p1 {
    | None => ""
    | Some(player) => player->getPlayer->Player.fullName
    }

    let blackName = switch state.p2 {
    | None => ""
    | Some(player) => player->getPlayer->Player.fullName
    }

    let match = _ =>
      switch (state.p1, state.p2) {
      | (Some(white), Some(black)) =>
        let newRound = Rounds.Round.addMatches(
          round,
          [
            Match.manualPair(
              ~white=getPlayer(white),
              ~black=getPlayer(black),
              state.result,
              byeValue,
            ),
          ],
        )
        switch Rounds.set(roundList, roundId, newRound) {
        | Some(roundList) => setTourney({...tourney, roundList: roundList})
        | None => Js.Console.error(`Couldn't add round ${Int.toString(roundId)}`)
        }
        dispatch(Clear)
      | _ => ()
      }

    let matchIdeal = switch (state.p1, state.p2) {
    | (Some(p1), Some(p2)) =>
      switch (Map.get(pairData, p1), Map.get(pairData, p2)) {
      | (Some(p1Data), Some(p2Data)) =>
        let ideal = Pairing.calcPairIdeal(p1Data, p2Data)
        (ideal /. Pairing.maxPriority)->Numeral.make->Numeral.format("%")->React.string
      | _ => React.null
      }
    | _ => React.null
    }

    <div>
      <h2> {React.string("Selected for matching:")} </h2>
      <div className="content">
        <p>
          {React.string("White: ")}
          {switch state.p1 {
          | Some(p) => <>
              <span className={getPlayer(p).type_->Player.Type.toString}>
                {React.string(whiteName ++ " ")}
              </span>
              <button
                ariaLabel={`remove ${whiteName}`}
                className="button-micro"
                onClick={_ => dispatch(RemoveP1)}>
                <Icons.UserMinus /> {React.string(" Remove")}
              </button>
            </>
          | None => React.null
          }}
        </p>
        <p>
          {React.string("Black: ")}
          {switch state.p2 {
          | Some(p) => <>
              <span className={getPlayer(p).type_->Player.Type.toString}>
                {React.string(blackName ++ " ")}
              </span>
              <button
                ariaLabel={`remove ${blackName}`}
                className="button-micro"
                onClick={_ => dispatch(RemoveP2)}>
                <Icons.UserMinus /> {React.string(" Remove")}
              </button>
            </>
          | None => React.null
          }}
        </p>
        <p> {React.string("Match ideal: ")} matchIdeal </p>
      </div>
      <p>
        <label>
          {React.string("Pre-select winner ")}
          <select
            value={Match.Result.toString(state.result)}
            disabled={state.num != Two}
            onBlur={e =>
              ReactEvent.Focus.target(e)["value"]->Match.Result.fromString->SetResult->dispatch}
            onChange={e =>
              ReactEvent.Form.target(e)["value"]->Match.Result.fromString->SetResult->dispatch}>
            <option value={Match.Result.toString(NotSet)}> {React.string("None")} </option>
            <option value={Match.Result.toString(WhiteWon)}> {React.string("White won")} </option>
            <option value={Match.Result.toString(BlackWon)}> {React.string("Black won")} </option>
            <option value={Match.Result.toString(Draw)}> {React.string("Draw")} </option>
          </select>
        </label>
      </p>
      <div className="toolbar">
        <button disabled={state.num == Zero} onClick={_ => dispatch(Reverse)}>
          <Icons.Repeat /> {React.string(" Swap colors")}
        </button>
        {React.string(" ")}
        <button className="button-primary" disabled={state.num != Two} onClick=match>
          <Icons.Check /> {React.string(" Match selected")}
        </button>
      </div>
    </div>
  }
}

module PlayerInfo = {
  @react.component
  let make = (~player, ~scoreData, ~players, ~avoidPairs, ~origRating, ~newRating, ~getPlayer) => {
    let {
      player,
      hasBye,
      colorBalance,
      score,
      rating,
      opponentResults,
      avoidListHtml,
    } = TournamentUtils.getScoreInfo(
      ~player,
      ~scoreData,
      ~getPlayer,
      ~players,
      ~origRating,
      ~newRating,
      ~avoidPairs,
    )
    <div className="player-card">
      <h3> {player->Player.fullName->React.string} </h3>
      <dl>
        <dt> {"Score"->React.string} </dt>
        <dd> {score->React.float} </dd>
        <dt id={`rating-${Id.toString(player.id)}`} />
        <dt> {"Rating"->React.string} </dt>
        <dd> rating </dd>
        <dt> {"Color balance"->React.string} </dt>
        <dd> {colorBalance->React.string} </dd>
        <dt> {"Has had a bye round"->React.string} </dt>
        <dd> {React.string(hasBye ? "Yes" : "No")} </dd>
        <dt> {"Opponent history"->React.string} </dt>
        <dd style={ReactDOMRe.Style.make(~margin="0", ())}> <ol> opponentResults </ol> </dd>
        <dt> {"Players to avoid"->React.string} </dt>
        <dd style={ReactDOMRe.Style.make(~margin="0", ())}> <ul> avoidListHtml </ul> </dd>
      </dl>
    </div>
  }
}

@react.component
let make = (
  ~roundId,
  ~tournament: LoadTournament.t,
  ~scoreData,
  ~unmatched,
  ~unmatchedWithDummy,
) => {
  let ({Config.avoidPairs: avoidPairs, byeValue, _}, _) = Db.useConfig()
  let (state, dispatch) = useStageState(byeValue)
  let {tourney, activePlayers, players, getPlayer, setTourney, playersDispatch, _} = tournament
  let {roundList, byeQueue, _} = tourney
  let round = Rounds.get(roundList, roundId)
  let dialog = Hooks.useBool(false)
  /* `createPairingData` is relatively expensive */
  let pairData = React.useMemo3(
    () => Pairing.make(scoreData, activePlayers, avoidPairs),
    (activePlayers, avoidPairs, scoreData),
  )
  /* Clean staged players if they were removed from the tournament */
  React.useEffect3(() => {
    switch state.p1 {
    | None => ()
    | Some(p1) =>
      switch Map.get(unmatchedWithDummy, p1) {
      | None => dispatch(RemoveP1)
      | Some(_) => ()
      }
    }
    switch state.p2 {
    | None => ()
    | Some(p2) =>
      switch Map.get(unmatchedWithDummy, p2) {
      | None => dispatch(RemoveP2)
      | Some(_) => ()
      }
    }
    None
  }, (unmatchedWithDummy, state, dispatch))

  let autoPair = round => {
    let newRound = Rounds.Round.addMatches(
      round,
      autoPair(~pairData, ~byeValue, ~byeQueue, ~playerMap=unmatched)->MutableQueue.toArray,
    )
    switch Rounds.set(roundList, roundId, newRound) {
    | Some(roundList) => setTourney({...tourney, roundList: roundList})
    | None => ()
    }
  }

  switch round {
  | None => <div> {React.string("No round available.")} </div>
  | Some(round) =>
    <div className="content-area">
      <div className="toolbar">
        <button
          className="button-primary"
          disabled={Map.size(unmatched) == 0}
          onClick={_ => autoPair(round)}>
          {React.string("Auto-pair unmatched players")}
        </button>
        {React.string(" ")}
        <button onClick={_ => dialog.setTrue()}>
          {React.string("Add or remove players from the roster.")}
        </button>
      </div>
      <Utils.PanelContainer>
        <Utils.Panel> <SelectList state dispatch unmatched pairData /> </Utils.Panel>
        <Utils.Panel style={ReactDOMRe.Style.make(~flexGrow="1", ())}>
          <Stage state roundId dispatch pairData setTourney getPlayer byeValue tourney round />
          <Utils.PanelContainer>
            {[state.p1, state.p2]
            ->Array.map(id =>
              switch id {
              | None => React.null
              | Some(playerId) =>
                <Utils.Panel key={playerId->Id.toString}>
                  <PlayerInfo
                    player={getPlayer(playerId)}
                    scoreData
                    players
                    avoidPairs
                    origRating=getPlayer(playerId).rating
                    newRating=None
                    getPlayer
                  />
                </Utils.Panel>
              }
            )
            ->React.array}
          </Utils.PanelContainer>
        </Utils.Panel>
      </Utils.PanelContainer>
      <Externals.Dialog
        isOpen=dialog.state onDismiss=dialog.setFalse ariaLabel="Select players" className="">
        <button className="button-micro" onClick={_ => dialog.setFalse()}>
          {React.string("Done")}
        </button>
        <PageTourneyPlayers.Selecting tourney setTourney players playersDispatch />
      </Externals.Dialog>
    </div>
  }
}
