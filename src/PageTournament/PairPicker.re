open Belt;
open Data;
open TournamentDataReducers;

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
    let stagePlayersOption = Js.Nullable.(p1->toOption, p2->toOption);

    let initialTable =
      unmatched->Map.String.valuesToArray
      |> Js.Array.map(player => {player, ideal: 0.0});
    let (sorted, sortedDispatch) =
      Hooks.useSortedTable(
        ~table=initialTable,
        ~column=sortByName,
        ~isDescending=false,
      );
    let isNullSelected = [|p1, p2|] |> Js.Array.includes(Js.Nullable.null);
    let isOnePlayerSelected = p1 !== p2 && isNullSelected;
    let isPlayerSelectable = id => {
      switch (stagePlayersOption) {
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
            switch (stagePlayersOption) {
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
      (unmatched, pairData, sortedDispatch, stagePlayersOption),
    );
    /* only use unmatched players if this is the last round. */
    let selectPlayer = id => {
      switch (stagePlayersOption) {
      | (None, Some(p2)) =>
        setStagedPlayers(_ =>
          (Js.Nullable.return(id), Js.Nullable.return(p2))
        )
      | (Some(p1), None) =>
        setStagedPlayers(_ =>
          (Js.Nullable.return(p1), Js.Nullable.return(id))
        )
      | (None, None) =>
        setStagedPlayers(_ => (Js.Nullable.return(id), Js.Nullable.null))
      | (Some(_), Some(_)) => ()
      };
    };
    unmatched |> Map.String.keysToArray |> Js.Array.length === 0
      ? React.null
      : <table className="content">
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
                          {[|"Add", player.firstName, player.lastName|]
                           |> Js.Array.joinWith(" ")
                           |> React.string}
                        </Utils.VisuallyHidden>
                      </button>
                    </td>
                    <td>
                      {React.string(
                         player.firstName ++ " " ++ player.lastName,
                       )}
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
        ~tourneyDispatch,
        ~byeValue,
      ) => {
    let (white, black) = stagedPlayers;
    let stagedPlayersOption = Js.Nullable.(white->toOption, black->toOption);
    let (whiteOpt, blackOpt) = stagedPlayersOption;
    let noneAreSelected =
      switch (stagedPlayersOption) {
      | (None, None) => true
      | (Some(_), Some(_))
      | (Some(_), None)
      | (None, Some(_)) => false
      };
    let twoAreSelected =
      switch (stagedPlayersOption) {
      | (Some(_), Some(_)) => true
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => false
      };
    let whiteName =
      switch (whiteOpt) {
      | None => ""
      | Some(player) =>
        getPlayer(player).Player.firstName
        ++ " "
        ++ getPlayer(player).lastName
      };
    let blackName =
      switch (blackOpt) {
      | None => ""
      | Some(player) =>
        getPlayer(player).firstName ++ " " ++ getPlayer(player).lastName
      };

    let unstage = color => {
      switch (color) {
      | White => setStagedPlayers(((_, p2)) => (Js.Nullable.null, p2))
      | Black => setStagedPlayers(((p1, _)) => (p1, Js.Nullable.null))
      };
    };

    let match = _ => {
      switch (stagedPlayersOption) {
      | (Some(white), Some(black)) =>
        tourneyDispatch(
          ManualPair(
            byeValue,
            (getPlayer(white), getPlayer(black)),
            roundId,
          ),
        );
        setStagedPlayers(_ => (Js.Nullable.null, Js.Nullable.null));
      | (None, None)
      | (Some(_), None)
      | (None, Some(_)) => ()
      };
    };

    let matchIdeal = {
      switch (stagedPlayersOption) {
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
          {switch (whiteOpt) {
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
          {switch (blackOpt) {
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

module PlayerInfo = {
  [@react.component]
  let make = (~playerId, ~players, ~getPlayer, ~scoreData, ~avoidPairs) => {
    let avoidMap =
      avoidPairs->Set.reduce(Map.String.empty, Data.AvoidPairs.reduceToMap);
    let playerData =
      switch (scoreData->Map.String.get(playerId)) {
      | None => Scoring.createBlankScoreData(playerId)
      | Some(data) => data
      };
    let colorScores = playerData.colorScores;
    let opponentResults = playerData.opponentResults;
    let results = playerData.results;
    let colorBalance = Utils.List.sumF(colorScores);
    let player = getPlayer(playerId);
    let hasBye =
      opponentResults
      |> Map.String.keysToArray
      |> Js.Array.includes(Data.Player.dummy_id);
    let avoidList =
      switch (avoidMap->Map.String.get(playerId)) {
      | None => []
      | Some(avoidList) => avoidList
      };
    let prettyBalance =
      switch (colorBalance) {
      | x when x < 0.0 => "White +" ++ (x |> abs_float |> Js.Float.toString)
      | x when x > 0.0 => "Black +" ++ (x |> Js.Float.toString)
      | _ => "Even"
      };

    <dl className="player-card">
      <h3>
        {React.string(player.Player.firstName ++ " " ++ player.lastName)}
      </h3>
      <p>
        {React.string("Score: ")}
        {Utils.List.sumF(results) |> Js.Float.toString |> React.string}
      </p>
      <p id={"rating-" ++ player.id}>
        {React.string("Rating: ")}
        {player.rating |> Js.Int.toString |> React.string}
      </p>
      <p> {React.string("Color balance: " ++ prettyBalance)} </p>
      <p>
        {React.string("Has had a bye round: " ++ (hasBye ? "Yes" : "No"))}
      </p>
      <p> {React.string("Opponent history:")} </p>
      <ol>
        {opponentResults
         ->Map.String.toArray
         ->Array.map(((opId, result)) =>
             <li key=opId>
               {[|
                  getPlayer(opId).firstName,
                  getPlayer(opId).lastName,
                  "-",
                  /*
                   TODO: This should be in sync with the `Match.Result` types
                   */
                  switch (result) {
                  | 0.0 => "Lost"
                  | 1.0 => "Won"
                  | 0.5 => "Draw"
                  | _ => "Draw"
                  },
                |]
                |> Js.Array.joinWith(" ")
                |> React.string}
             </li>
           )
         ->React.array}
      </ol>
      <p> {React.string("Players to avoid:")} </p>
      <ol>
        {avoidList->Utils.List.toReactArray(pId =>
           switch (players->Map.String.get(pId)) {
           /*  don't show players not in this tourney*/
           | None => React.null
           | Some(_) =>
             <li key=pId>
               {React.string(
                  getPlayer(pId).firstName ++ " " ++ getPlayer(pId).lastName,
                )}
             </li>
           }
         )}
      </ol>
    </dl>;
  };
};

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
  let (stagedPlayers, setStagedPlayers) =
    React.useState(() => (Js.Nullable.null, Js.Nullable.null));
  let (p1, p2) = stagedPlayers;
  let (config, _) = Db.useConfig();
  let avoidPairs = config.avoidPairs;
  let byeValue = config.byeValue;
  let {
    TournamentData.tourney,
    TournamentData.activePlayers,
    TournamentData.players,
    TournamentData.getPlayer,
    TournamentData.tourneyDispatch,
  } = tournament;
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
      switch (p1->Js.Nullable.toOption) {
      | None => ()
      | Some(p1) =>
        switch (unmatchedWithDummy->Map.String.get(p1)) {
        | None => setStagedPlayers(((_, p2)) => (Js.Nullable.null, p2))
        | Some(_) => ()
        }
      };
      switch (p2->Js.Nullable.toOption) {
      | None => ()
      | Some(p2) =>
        switch (unmatchedWithDummy->Map.String.get(p2)) {
        | None => setStagedPlayers(((p1, _)) => (p1, Js.Nullable.null))
        | Some(_) => ()
        }
      };
      None;
    },
    (unmatchedWithDummy, p1, p2, setStagedPlayers),
  );
  <div
    className="content-area"
    style={ReactDOMRe.Style.make(~width="720px", ())}>
    <div className="toolbar">
      <button
        className="button-primary"
        disabled={unmatchedCount === 0}
        onClick={_ =>
          tourneyDispatch(
            AutoPair(config.byeValue, roundId, pairData, unmatched, tourney),
          )
        }>
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
          tourneyDispatch
          getPlayer
          byeValue
        />
        <Utils.PanelContainer>
          {[|p1, p2|]
           |> Js.Array.map(id =>
                switch (id->Js.Nullable.toOption) {
                | None => React.null
                | Some(playerId) =>
                  <Utils.Panel key=playerId>
                    <PlayerInfo
                      playerId
                      scoreData
                      players
                      getPlayer
                      avoidPairs
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
      <PageTourneyPlayers.Selecting tourney tourneyDispatch />
    </Utils.Dialog>
  </div>;
};