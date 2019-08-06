open Belt;
open Data;

type listEntry = {
  player: Player.t,
  ideal: float,
};

let sortByName = Hooks.GetString(x => x.player.firstName);
let sortByIdeal = Hooks.GetFloat(x => x.ideal);

module SelectList = {
  [@react.component]
  let make = (~pairData, ~stagedPlayers, ~setStagedPlayers, ~unmatched) => {
    let (p1, p2) = stagedPlayers;
    let initialTable =
      unmatched
      |> Map.String.valuesToArray
      |> Js.Array.map(player => {player, ideal: 0.0});
    let (sorted, sortedDispatch) =
      Hooks.useSortedTable(
        ~table=initialTable,
        ~column=sortByName,
        ~isDescending=false,
      );
    let isNullSelected = p1 === None || p2 === None;
    let isOnePlayerSelected = p1 !== p2 && isNullSelected;
    let isPlayerSelectable = id => {
      switch (stagedPlayers) {
      | (Some(_), Some(_)) => false
      | (Some(p1), None) => p1 !== id
      | (None, Some(p2)) => p2 !== id
      | (None, None) => true
      };
    };
    /* Hydrate the ideal to the table */
    React.useEffect4(
      () => {
        let calcIdealOrNot = player => {
          let selectedId =
            switch (stagedPlayers) {
            | (Some(id), None) => Some(id)
            | (None, Some(id)) => Some(id)
            | (None, None)
            | (Some(_), Some(_)) => None
            };
          switch (selectedId) {
          | None => 0.0
          | Some(id) =>
            switch (pairData->Map.String.get(id)) {
            | None => 0.0 /* It's a bye player */
            | Some(selectedPlayer) =>
              switch (player) {
              | None => 0.0 /* It's a bye player */
              | Some(player) =>
                Pairing.calcPairIdeal(selectedPlayer, player)
                /. Pairing.maxPriority
              }
            }
          };
        };
        let table =
          unmatched
          |> Map.String.valuesToArray
          |> Js.Array.map(player =>
               {
                 player,
                 ideal: calcIdealOrNot(pairData->Map.String.get(player.id)),
               }
             );
        sortedDispatch(Hooks.SetTable(table));
        None;
      },
      (unmatched, pairData, sortedDispatch, stagedPlayers),
    );
    /* only use unmatched players if this is the last round. */
    let selectPlayer = id => {
      switch (stagedPlayers) {
      | (None, Some(p2)) => setStagedPlayers(_ => (Some(id), Some(p2)))
      | (Some(p1), None) => setStagedPlayers(_ => (Some(p1), Some(id)))
      | (None, None) => setStagedPlayers(_ => (Some(id), None))
      | (Some(_), Some(_)) => ()
      };
    };
    if (Map.String.size(unmatched) === 0) {
      React.null;
    } else {
      <table className="content">
        <thead>
          <tr>
            <th>
              <Utils.VisuallyHidden>
                {React.string("Controls")}
              </Utils.VisuallyHidden>
            </th>
            <th>
              <Hooks.SortButton
                sortColumn=sortByName data=sorted dispatch=sortedDispatch>
                {React.string("Name")}
              </Hooks.SortButton>
            </th>
            <th>
              <Hooks.SortButton
                sortColumn=sortByIdeal data=sorted dispatch=sortedDispatch>
                {React.string("Ideal")}
              </Hooks.SortButton>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.table
           |> Js.Array.map(({player, ideal}) =>
                <tr key={player.id}>
                  <td>
                    <button
                      className="button-ghost"
                      disabled={!isPlayerSelectable(player.id)}
                      onClick={_ => selectPlayer(player.id)}>
                      <Icons.UserPlus />
                      <Utils.VisuallyHidden>
                        {["Add", player.firstName, player.lastName]
                         |> String.concat(" ")
                         |> React.string}
                      </Utils.VisuallyHidden>
                    </button>
                  </td>
                  <td>
                    {React.string(player.firstName ++ " " ++ player.lastName)}
                  </td>
                  <td>
                    {React.string(
                       isOnePlayerSelected
                         ? Numeral.(ideal->make->format("%")) : "-",
                     )}
                  </td>
                </tr>
              )
           |> React.array}
        </tbody>
      </table>;
    };
  };
};

type color =
  | White
  | Black;

module Stage = {
  [@react.component]
  let make =
      (
        ~getPlayer,
        ~pairData,
        ~roundId,
        ~stagedPlayers,
        ~setStagedPlayers,
        ~setTourney,
        ~byeValue,
        ~tourney,
        ~round,
      ) => {
    let (white, black) = stagedPlayers;
    let {Tournament.roundList} = tourney;
    let noneAreSelected =
      switch (stagedPlayers) {
      | (None, None) => true
      | (Some(_), Some(_))
      | (Some(_), None)
      | (None, Some(_)) => false
      };
    let twoAreSelected =
      switch (stagedPlayers) {
      | (Some(_), Some(_)) => true
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => false
      };
    let whiteName =
      switch (white) {
      | None => ""
      | Some(player) =>
        getPlayer(player).Player.firstName
        ++ " "
        ++ getPlayer(player).lastName
      };
    let blackName =
      switch (black) {
      | None => ""
      | Some(player) =>
        getPlayer(player).firstName ++ " " ++ getPlayer(player).lastName
      };

    let unstage = color => {
      switch (color) {
      | White => setStagedPlayers(((_, p2)) => (None, p2))
      | Black => setStagedPlayers(((p1, _)) => (p1, None))
      };
    };

    let match = _ => {
      switch (stagedPlayers) {
      | (Some(white), Some(black)) =>
        let newRound =
          round->Rounds.Round.addMatches([|
            Match.manualPair(
              (getPlayer(white), getPlayer(black)),
              byeValue,
            ),
          |]);
        switch (roundList->Rounds.set(roundId, newRound)) {
        | Some(roundList) => setTourney({...tourney, roundList})
        | None => ()
        };
        setStagedPlayers(_ => (None, None));
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => ()
      };
    };

    let matchIdeal = {
      switch (stagedPlayers) {
      | (Some(p1), Some(p2)) =>
        switch (Map.String.(pairData->get(p1), pairData->get(p2))) {
        | (Some(p1Data), Some(p2Data)) =>
          let ideal = Pairing.calcPairIdeal(p1Data, p2Data);
          Numeral.((ideal /. Pairing.maxPriority)->make->format("%"));
        | (None, None)
        | (Some(_), None)
        | (None, Some(_)) => ""
        }
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => ""
      };
    };

    <div>
      <h2> {React.string("Selected for matching:")} </h2>
      <div className="content">
        <p>
          {React.string("White: ")}
          {switch (white) {
           | Some(_) =>
             <>
               {React.string(whiteName ++ " ")}
               <button
                 ariaLabel={"remove " ++ whiteName}
                 className="button-micro"
                 onClick={_ => unstage(White)}>
                 <Icons.UserMinus />
                 {React.string(" Remove")}
               </button>
             </>
           | None => React.null
           }}
        </p>
        <p>
          {React.string("Black: ")}
          {switch (black) {
           | Some(_) =>
             <>
               {React.string(blackName ++ " ")}
               <button
                 ariaLabel={"remove " ++ blackName}
                 className="button-micro"
                 onClick={_ => unstage(Black)}>
                 <Icons.UserMinus />
                 {React.string(" Remove")}
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
          onClick={_ =>
            setStagedPlayers(((oldWhite, oldBlack)) => (oldBlack, oldWhite))
          }>
          <Icons.Repeat />
          {React.string(" Swap colors")}
        </button>
        {React.string(" ")}
        <button
          className="button-primary" disabled={!twoAreSelected} onClick=match>
          <Icons.Check />
          {React.string(" Match selected")}
        </button>
      </div>
    </div>;
  };
};

module PlayerInfo =
  HigherOrderComponents.WithScoreInfo({
    [@react.component]
    let make =
        (
          ~hasBye,
          ~colorBalance,
          ~player,
          ~score,
          ~rating,
          ~opponentResults,
          ~avoidListHtml,
        ) => {
      let fullName = player.Player.firstName ++ " " ++ player.lastName;
      <dl className="player-card">
        <h3> {React.string(fullName)} </h3>
        <p>
          {React.string("Score: ")}
          {score |> Js.Float.toString |> React.string}
        </p>
        <p id={"rating-" ++ player.id}> {React.string("Rating: ")} rating </p>
        <p> {React.string("Color balance: " ++ colorBalance)} </p>
        <p>
          {React.string("Has had a bye round: " ++ (hasBye ? "Yes" : "No"))}
        </p>
        <p> {React.string("Opponent history:")} </p>
        <ol> opponentResults </ol>
        <p> {React.string("Players to avoid:")} </p>
        avoidListHtml
      </dl>;
    };
  });

[@react.component]
let make =
    (
      ~roundId,
      ~tournament,
      ~scoreData,
      ~unmatched,
      ~unmatchedCount,
      ~unmatchedWithDummy,
    ) => {
  let (stagedPlayers, setStagedPlayers) = React.useState(() => (None, None));
  let (p1, p2) = stagedPlayers;
  let (config, _) = Db.useConfig();
  let {Config.avoidPairs, byeValue} = config;
  let {
    LoadTournament.tourney,
    activePlayers,
    players,
    getPlayer,
    setTourney,
    playersDispatch,
  } = tournament;
  let {Tournament.roundList, byeQueue} = tourney;
  let round = roundList->Rounds.get(roundId);
  let (isModalOpen, setIsModalOpen) = React.useState(() => false);
  /* `createPairingData` is relatively expensive */
  let pairData =
    React.useMemo3(
      () =>
        scoreData
        |> Converters.createPairingData(activePlayers, avoidPairs)
        |> Pairing.setUpperHalves,
      (activePlayers, avoidPairs, scoreData),
    );
  /* Clean staged players if they were removed from the tournament */
  React.useEffect4(
    () => {
      switch (p1) {
      | None => ()
      | Some(p1) =>
        switch (unmatchedWithDummy->Map.String.get(p1)) {
        | None => setStagedPlayers(((_, p2)) => (None, p2))
        | Some(_) => ()
        }
      };
      switch (p2) {
      | None => ()
      | Some(p2) =>
        switch (unmatchedWithDummy->Map.String.get(p2)) {
        | None => setStagedPlayers(((p1, _)) => (p1, None))
        | Some(_) => ()
        }
      };
      None;
    },
    (unmatchedWithDummy, p1, p2, setStagedPlayers),
  );
  let autoPair = round => {
    let newRound =
      round->Rounds.Round.addMatches(
        Match.autoPair(~pairData, ~byeValue, ~byeQueue, ~playerMap=unmatched)
        ->List.toArray,
      );
    switch (roundList->Rounds.set(roundId, newRound)) {
    | Some(roundList) => setTourney({...tourney, roundList})
    | None => ()
    };
  };
  switch (round) {
  | None => <div> {React.string("No round available.")} </div>
  | Some(round) =>
    <div
      className="content-area"
      style={ReactDOMRe.Style.make(~width="720px", ())}>
      <div className="toolbar">
        <button
          className="button-primary"
          disabled={unmatchedCount === 0}
          onClick={_ => autoPair(round)}>
          {React.string("Auto-pair unmatched players")}
        </button>
        {React.string(" ")}
        <button onClick={_ => setIsModalOpen(_ => true)}>
          {React.string("Add or remove players from the roster.")}
        </button>
      </div>
      <Utils.PanelContainer>
        <Utils.Panel>
          <SelectList
            setStagedPlayers
            stagedPlayers
            unmatched=unmatchedWithDummy
            pairData
          />
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
            {[|p1, p2|]
             |> Js.Array.map(id =>
                  switch (id) {
                  | None => React.null
                  | Some(playerId) =>
                    <Utils.Panel key=playerId>
                      <PlayerInfo
                        player={getPlayer(playerId)}
                        scoreData
                        players
                        avoidPairs
                        origRating={getPlayer(playerId).rating}
                        newRating=None
                        getPlayer
                      />
                    </Utils.Panel>
                  }
                )
             |> React.array}
          </Utils.PanelContainer>
        </Utils.Panel>
      </Utils.PanelContainer>
      <Utils.Dialog
        isOpen=isModalOpen onDismiss={_ => setIsModalOpen(_ => false)}>
        <button
          className="button-micro" onClick={_ => setIsModalOpen(_ => false)}>
          {React.string("Done")}
        </button>
        <PageTourneyPlayers.Selecting
          tourney
          setTourney
          players
          playersDispatch
        />
      </Utils.Dialog>
    </div>
  };
};