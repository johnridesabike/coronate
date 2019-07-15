open Belt;
open TournamentDataReducers;

type listEntry = {
  player: Data.Player.t,
  ideal: float,
};

let sortByName = Hooks.KeyString((x: listEntry) => x.player.firstName);
let sortByIdeal = Hooks.KeyFloat((x: listEntry) => x.ideal);

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
        ~key=sortByName,
        ~isDescending=true,
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
            | _ => None
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
      | _ => ()
      };
    };
    unmatched |> Map.String.keysToArray |> Js.Array.length === 0
      ? React.null
      : <table className="content">
          <thead>
            <tr>
              <th>
                <Utils.VisuallyHidden>
                  {"Controls" |> React.string}
                </Utils.VisuallyHidden>
              </th>
              <th>
                <Hooks.SortButton
                  sortKey=sortByName data=sorted dispatch=sortedDispatch>
                  {"Name" |> React.string}
                </Hooks.SortButton>
              </th>
              <th>
                <Hooks.SortButton
                  sortKey=sortByIdeal data=sorted dispatch=sortedDispatch>
                  {"Ideal" |> React.string}
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
                      {player.firstName
                       ++ " "
                       ++ player.lastName
                       |> React.string}
                    </td>
                    <td>
                      {(
                         isOnePlayerSelected
                           ? Externals.Numeral.(ideal->numeral->format("%"))
                           : "-"
                       )
                       |> React.string}
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
        ~getPlayer: string => Data.Player.t,
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
      | _ => false
      };
    let twoAreSelected =
      switch (stagedPlayersOption) {
      | (Some(_), Some(_)) => true
      | _ => false
      };
    let whiteName =
      switch (whiteOpt) {
      | None => ""
      | Some(player) =>
        getPlayer(player).firstName ++ " " ++ getPlayer(player).lastName
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
      | _ => ()
      };
    };

    let matchIdeal = {
      switch (stagedPlayersOption) {
      | (Some(p1), Some(p2)) =>
        switch (Map.String.(pairData->get(p1), pairData->get(p2))) {
        | (Some(p1Data), Some(p2Data)) =>
          let ideal = Pairing.calcPairIdeal(p1Data, p2Data);
          Externals.Numeral.(
            (ideal /. Pairing.maxPriority)->numeral->format("%")
          );
        | _ => ""
        }
      | _ => ""
      };
    };

    <div>
      <h2> {"Selected for matching:" |> React.string} </h2>
      <div className="content">
        <p>
          {"White: " |> React.string}
          {switch (whiteOpt) {
           | Some(_) =>
             <>
               {whiteName ++ " " |> React.string}
               <button
                 ariaLabel={"remove " ++ whiteName}
                 className="button-micro"
                 onClick={_ => unstage(White)}>
                 <Icons.UserMinus />
                 {" Remove" |> React.string}
               </button>
             </>
           | None => React.null
           }}
        </p>
        <p>
          {"Black: " |> React.string}
          {switch (blackOpt) {
           | Some(_) =>
             <>
               {blackName ++ " " |> React.string}
               <button
                 ariaLabel={"remove " ++ blackName}
                 className="button-micro"
                 onClick={_ => unstage(Black)}>
                 <Icons.UserMinus />
                 {" Remove" |> React.string}
               </button>
             </>
           | None => React.null
           }}
        </p>
        <p> {"Match ideal: " ++ matchIdeal |> React.string} </p>
      </div>
      <div className="toolbar">
        <button
          disabled=noneAreSelected
          onClick={_ =>
            setStagedPlayers(((oldWhite, oldBlack)) => (oldBlack, oldWhite))
          }>
          <Icons.Repeat />
          {" Swap colors" |> React.string}
        </button>
        {" " |> React.string}
        <button
          className="button-primary" disabled={!twoAreSelected} onClick=match>
          <Icons.Check />
          {" Match selected" |> React.string}
        </button>
      </div>
    </div>;
  };
};

module PlayerInfo = {
  [@react.component]
  let make =
      (
        ~playerId,
        ~players,
        ~getPlayer: string => Data.Player.t,
        ~scoreData,
        ~avoidPairs,
      ) => {
    let avoidMap =
      avoidPairs
      |> Js.Array.reduce(Converters.avoidPairReducer, Map.String.empty);
    let playerData =
      switch (scoreData->Map.String.get(playerId)) {
      | None => Scoring.createBlankScoreData(playerId)
      | Some(data) => data
      };
    let colorScores = playerData.colorScores;
    let opponentResults = playerData.opponentResults;
    let results = playerData.results;
    let colorBalance = Utils.arraySumFloat(colorScores);
    let player = getPlayer(playerId);
    let hasBye =
      opponentResults
      |> Map.String.keysToArray
      |> Js.Array.includes(Data.dummy_id);
    let avoidList =
      switch (avoidMap->Map.String.get(playerId)) {
      | None => [||]
      | Some(avoidList) => avoidList
      };
    let prettyBalance =
      if (colorBalance < 0.0) {
        "White +" ++ (colorBalance |> Utils.absf |> Js.Float.toString);
      } else if (colorBalance > 0.0) {
        "Black +" ++ (colorBalance |> Js.Float.toString);
      } else {
        "Even";
      };

    <dl className="player-card">
      <h3> {player.firstName ++ " " ++ player.lastName |> React.string} </h3>
      <p>
        {"Score: " |> React.string}
        {Utils.arraySumFloat(results) |> Js.Float.toString |> React.string}
      </p>
      <p id={"rating-" ++ player.id}>
        {"Rating: " |> React.string}
        {player.rating |> Js.Int.toString |> React.string}
      </p>
      <p> {"Color balance: " ++ prettyBalance |> React.string} </p>
      <p>
        {"Has had a bye round: " ++ (hasBye ? "Yes" : "No") |> React.string}
      </p>
      <p> {"Opponent history:" |> React.string} </p>
      <ol>
        {opponentResults
         ->Map.String.toArray
         ->Array.map(((opId, result)) =>
             <li key=opId>
               {[|
                  getPlayer(opId).firstName,
                  getPlayer(opId).lastName,
                  "-",
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
      <p> {"Players to avoid:" |> React.string} </p>
      <ol>
        {avoidList
         |> Js.Array.map(pId =>
              switch (players->Map.String.get(pId)) {
              /*  don't show players not in this tourney*/
              | None => React.null
              | Some(_) =>
                <li key=pId>
                  {getPlayer(pId).firstName
                   ++ " "
                   ++ getPlayer(pId).lastName
                   |> React.string}
                </li>
              }
            )
         |> React.array}
      </ol>
    </dl>;
  };
};

[@react.component]
let make =
    (
      ~roundId,
      ~tournament: TournamentData.t,
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
  let tourney = tournament.tourney;
  let activePlayers = tournament.activePlayers;
  let players = tournament.players;
  let getPlayer = tournament.getPlayer;
  let tourneyDispatch = tournament.tourneyDispatch;
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
        | _ => ()
        }
      };
      switch (p2->Js.Nullable.toOption) {
      | None => ()
      | Some(p2) =>
        switch (unmatchedWithDummy->Map.String.get(p2)) {
        | None => setStagedPlayers(((p1, _)) => (p1, Js.Nullable.null))
        | _ => ()
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
        {"Auto-pair unmatched players" |> React.string}
      </button>
      {" " |> React.string}
      <button onClick={_ => setIsModalOpen(_ => true)}>
        {"Add or remove players from the roster." |> React.string}
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
        {"Done" |> React.string}
      </button>
      <PageTourneyPlayers.Selecting tourney tourneyDispatch />
    </Utils.Dialog>
  </div>;
};