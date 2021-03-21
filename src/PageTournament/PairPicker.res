open Belt
open Data
module Id = Data.Id

let autoPair = (~pairData, ~byeValue, ~playerMap, ~byeQueue) => {
  /* the pairData includes any players who were already matched. We need to
   only include the specified players. */
  let filteredData = pairData->Map.keep((id, _) => playerMap->Map.has(id))
  let (pairdataNoByes, byePlayerData) = Pairing.setByePlayer(byeQueue, Data.Id.dummy, filteredData)
  let pairs = Pairing.pairPlayers(pairdataNoByes)->MutableQueue.fromArray
  switch byePlayerData {
  | Some(player) => MutableQueue.add(pairs, (player.id, Data.Id.dummy))
  | None => ()
  }
  let getPlayer = Data.Player.getMaybe(playerMap)
  MutableQueue.map(pairs, ((whiteId, blackId)) =>
    Data.Match.scoreByeMatch(
      ~byeValue,
      {
        id: Data.Id.random(),
        whiteOrigRating: getPlayer(whiteId).rating,
        blackOrigRating: getPlayer(blackId).rating,
        whiteNewRating: getPlayer(whiteId).rating,
        blackNewRating: getPlayer(blackId).rating,
        whiteId: whiteId,
        blackId: blackId,
        result: NotSet,
      },
    )
  )
}

type listEntry = {
  player: Player.t,
  ideal: float,
}

let sortByName = Hooks.GetString((. x) => x.player.firstName)
let sortByIdeal = Hooks.GetFloat((. x) => x.ideal)

module SelectList = {
  @react.component
  let make = (~pairData, ~stagedPlayers, ~setStagedPlayers, ~unmatched) => {
    let (p1, p2) = stagedPlayers
    let initialTable =
      unmatched->Map.valuesToArray->Array.map(player => {player: player, ideal: 0.0})
    let (sorted, sortedDispatch) = Hooks.useSortedTable(
      ~table=initialTable,
      ~column=sortByName,
      ~isDescending=false,
    )
    let isNullSelected = p1 == None || p2 == None
    let isOnePlayerSelected = p1 !== p2 && isNullSelected
    let isPlayerSelectable = id =>
      switch stagedPlayers {
      | (Some(_), Some(_)) => false
      | (Some(p1), None) => !Id.eq(p1, id)
      | (None, Some(p2)) => !Id.eq(p2, id)
      | (None, None) => true
      }
    /* Hydrate the ideal to the table */
    React.useEffect4(() => {
      let calcIdealOrNot = player => {
        let selectedId = switch stagedPlayers {
        | (Some(id), None) => Some(id)
        | (None, Some(id)) => Some(id)
        | (None, None)
        | (Some(_), Some(_)) =>
          None
        }
        switch selectedId {
        | None => 0.0
        | Some(id) =>
          switch pairData->Map.get(id) {
          | None => 0.0 /* It's a bye player */
          | Some(selectedPlayer) =>
            switch player {
            | None => 0.0 /* It's a bye player */
            | Some(player) => Pairing.calcPairIdeal(selectedPlayer, player) /. Pairing.maxPriority
            }
          }
        }
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
    }, (unmatched, pairData, sortedDispatch, stagedPlayers))
    /* only use unmatched players if this is the last round. */
    let selectPlayer = id =>
      switch stagedPlayers {
      | (None, Some(p2)) => setStagedPlayers(_ => (Some(id), Some(p2)))
      | (Some(p1), None) => setStagedPlayers(_ => (Some(p1), Some(id)))
      | (None, None) => setStagedPlayers(_ => (Some(id), None))
      | (Some(_), Some(_)) => ()
      }
    if Map.size(unmatched) == 0 {
      React.null
    } else {
      <table className="content">
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
          {sorted.Hooks.table
          ->Array.map(({player, ideal}) => {
            <tr key={player.id->Data.Id.toString}>
              <td>
                <button
                  className="button-ghost"
                  disabled={!isPlayerSelectable(player.id)}
                  onClick={_ => selectPlayer(player.id)}>
                  <Icons.UserPlus />
                  <Externals.VisuallyHidden>
                    {`Add ${player.firstName} ${player.lastName}`->React.string}
                  </Externals.VisuallyHidden>
                </button>
              </td>
              <td> {React.string(player.firstName ++ (" " ++ player.lastName))} </td>
              <td>
                {React.string(isOnePlayerSelected ? ideal->Numeral.make->Numeral.format("%") : "-")}
              </td>
            </tr>
          })
          ->React.array}
        </tbody>
      </table>
    }
  }
}

type color = White | Black

module Stage = {
  @react.component
  let make = (
    ~getPlayer,
    ~pairData,
    ~roundId,
    ~stagedPlayers,
    ~setStagedPlayers,
    ~setTourney,
    ~byeValue,
    ~tourney: Tournament.t,
    ~round,
  ) => {
    let (white, black) = stagedPlayers
    let {roundList, _} = tourney
    let noneAreSelected = switch stagedPlayers {
    | (None, None) => true
    | (Some(_), Some(_))
    | (Some(_), None)
    | (None, Some(_)) => false
    }
    let twoAreSelected = switch stagedPlayers {
    | (Some(_), Some(_)) => true
    | (None, None)
    | (Some(_), None)
    | (None, Some(_)) => false
    }
    let whiteName = switch white {
    | None => ""
    | Some(player) => getPlayer(player).Player.firstName ++ (" " ++ getPlayer(player).lastName)
    }
    let blackName = switch black {
    | None => ""
    | Some(player) => getPlayer(player).firstName ++ (" " ++ getPlayer(player).lastName)
    }

    let unstage = color =>
      switch color {
      | White => setStagedPlayers(((_, p2)) => (None, p2))
      | Black => setStagedPlayers(((p1, _)) => (p1, None))
      }

    let match_ = _ =>
      switch stagedPlayers {
      | (Some(white), Some(black)) =>
        let newRound = Rounds.Round.addMatches(
          round,
          [Match.manualPair((getPlayer(white), getPlayer(black)), byeValue)],
        )
        switch Rounds.set(roundList, roundId, newRound) {
        | Some(roundList) => setTourney({...tourney, roundList: roundList})
        | None => ()
        }
        setStagedPlayers(_ => (None, None))
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => ()
      }

    let matchIdeal = switch stagedPlayers {
    | (Some(p1), Some(p2)) =>
      switch (pairData->Map.get(p1), pairData->Map.get(p2)) {
      | (Some(p1Data), Some(p2Data)) =>
        let ideal = Pairing.calcPairIdeal(p1Data, p2Data)
        (ideal /. Pairing.maxPriority)->Numeral.make->Numeral.format("%")
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => ""
      }
    | (None, None)
    | (Some(_), None)
    | (None, Some(_)) => ""
    }

    <div>
      <h2> {React.string("Selected for matching:")} </h2>
      <div className="content">
        <p>
          {React.string("White: ")}
          {switch white {
          | Some(_) => <>
              {React.string(whiteName ++ " ")}
              <button
                ariaLabel={"remove " ++ whiteName}
                className="button-micro"
                onClick={_ => unstage(White)}>
                <Icons.UserMinus /> {React.string(" Remove")}
              </button>
            </>
          | None => React.null
          }}
        </p>
        <p>
          {React.string("Black: ")}
          {switch black {
          | Some(_) => <>
              {React.string(blackName ++ " ")}
              <button
                ariaLabel={"remove " ++ blackName}
                className="button-micro"
                onClick={_ => unstage(Black)}>
                <Icons.UserMinus /> {React.string(" Remove")}
              </button>
            </>
          | None => React.null
          }}
        </p>
        <p> {React.string("Match ideal: " ++ matchIdeal)} </p>
      </div>
      <div className="toolbar">
        <button
          disabled=noneAreSelected
          onClick={_ => setStagedPlayers(((oldWhite, oldBlack)) => (oldBlack, oldWhite))}>
          <Icons.Repeat /> {React.string(" Swap colors")}
        </button>
        {React.string(" ")}
        <button className="button-primary" disabled={!twoAreSelected} onClick=match_>
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

    let fullName = player.firstName ++ (" " ++ player.lastName)
    <dl className="player-card">
      <h3> {fullName->React.string} </h3>
      <p> {"Score: "->React.string} {score->React.float} </p>
      <p id={"rating-" ++ player.id->Data.Id.toString}> {"Rating: "->React.string} rating </p>
      <p> {React.string("Color balance: " ++ colorBalance)} </p>
      <p> {React.string("Has had a bye round: " ++ (hasBye ? "Yes" : "No"))} </p>
      <p> {"Opponent history:"->React.string} </p>
      <ol> opponentResults </ol>
      <p> {"Players to avoid:"->React.string} </p>
      avoidListHtml
    </dl>
  }
}

@react.component
let make = (
  ~roundId,
  ~tournament: LoadTournament.t,
  ~scoreData,
  ~unmatched,
  ~unmatchedCount,
  ~unmatchedWithDummy,
) => {
  let (stagedPlayers, setStagedPlayers) = React.useState(() => (None, None))
  let (p1, p2) = stagedPlayers
  let ({Config.avoidPairs: avoidPairs, byeValue, _}, _) = Db.useConfig()
  let {tourney, activePlayers, players, getPlayer, setTourney, playersDispatch, _} = tournament
  let {roundList, byeQueue, _} = tourney
  let round = roundList->Rounds.get(roundId)
  let dialog = Hooks.useBool(false)
  /* `createPairingData` is relatively expensive */
  let pairData = React.useMemo3(
    () => Pairing.make(scoreData, activePlayers, avoidPairs)->Pairing.setUpperHalves,
    (activePlayers, avoidPairs, scoreData),
  )
  /* Clean staged players if they were removed from the tournament */
  React.useEffect4(() => {
    switch p1 {
    | None => ()
    | Some(p1) =>
      switch unmatchedWithDummy->Map.get(p1) {
      | None => setStagedPlayers(((_, p2)) => (None, p2))
      | Some(_) => ()
      }
    }
    switch p2 {
    | None => ()
    | Some(p2) =>
      switch unmatchedWithDummy->Map.get(p2) {
      | None => setStagedPlayers(((p1, _)) => (p1, None))
      | Some(_) => ()
      }
    }
    None
  }, (unmatchedWithDummy, p1, p2, setStagedPlayers))
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
    <div className="content-area" style={ReactDOMRe.Style.make(~width="720px", ())}>
      <div className="toolbar">
        <button
          className="button-primary" disabled={unmatchedCount == 0} onClick={_ => autoPair(round)}>
          {React.string("Auto-pair unmatched players")}
        </button>
        {React.string(" ")}
        <button onClick={_ => dialog.setTrue()}>
          {React.string("Add or remove players from the roster.")}
        </button>
      </div>
      <Utils.PanelContainer>
        <Utils.Panel>
          <SelectList setStagedPlayers stagedPlayers unmatched=unmatchedWithDummy pairData />
        </Utils.Panel>
        <Utils.Panel style={ReactDOMRe.Style.make(~flexGrow="1", ())}>
          <Stage
            roundId
            setStagedPlayers
            stagedPlayers
            pairData
            setTourney
            getPlayer
            byeValue
            tourney
            round
          />
          <Utils.PanelContainer>
            {[p1, p2]
            ->Array.map(id =>
              switch id {
              | None => React.null
              | Some(playerId) =>
                <Utils.Panel key={playerId->Data.Id.toString}>
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
      <Externals.Dialog isOpen=dialog.state onDismiss=dialog.setFalse ariaLabel="Select players">
        <button className="button-micro" onClick={_ => dialog.setFalse()}>
          {React.string("Done")}
        </button>
        <PageTourneyPlayers.Selecting tourney setTourney players playersDispatch />
      </Externals.Dialog>
    </div>
  }
}
