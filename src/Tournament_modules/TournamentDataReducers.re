let scoreByeMatch = (byeValue, match: Data.Match.t) =>
  if (match.whiteId === Data.dummy_id) {
    {...match, whiteScore: 0.0, blackScore: byeValue};
  } else if (match.blackId === Data.dummy_id) {
    {...match, whiteScore: byeValue, blackScore: 0.0};
  } else {
    match;
  };

let autoPair =
    (~pairData, ~byeValue, ~playerDict, ~tourney: Data.Tournament.t) => {
  /* the pairData includes any players who were already matched. We need to
     only include the specified players. */
  let playerIds = playerDict |> Js.Dict.keys;
  let filteredData = Js.Dict.empty();
  let _ =
    Js.Dict.(
      Js.Array.(
        pairData
        |> values
        |> forEach((datum: Pairing.t) =>
             if (playerIds |> includes(datum.id)) {
               filteredData->set(datum.id, datum);
             }
           )
      )
    );
  let (pairdataNoByes, byePlayerData) =
    Pairing.setByePlayer(tourney.byeQueue, Data.dummy_id, filteredData);
  let pairs = Pairing.pairPlayers(pairdataNoByes);
  let pairsWithBye =
    switch (byePlayerData) {
    | Some(player) =>
      pairs |> Js.Array.concat([|(player.id, Data.dummy_id)|])
    | None => pairs
    };
  let getPlayer = Data.Player.getPlayerMaybe(playerDict);
  let newMatchList =
    pairsWithBye
    |> Js.Array.map(((whiteId, blackId)) =>
         Data.Match.{
           id: Utils.nanoid(),
           whiteOrigRating: getPlayer(whiteId).rating,
           blackOrigRating: getPlayer(blackId).rating,
           whiteNewRating: getPlayer(whiteId).rating,
           blackNewRating: getPlayer(blackId).rating,
           whiteId,
           blackId,
           whiteScore: 0.0,
           blackScore: 0.0,
         }
       );
  newMatchList |> Js.Array.map(scoreByeMatch(byeValue));
};

let manualPair = ((white: Data.Player.t, black: Data.Player.t), byeValue) => {
  Data.Match.{
    id: Utils.nanoid(),
    whiteScore: 0.0,
    blackScore: 0.0,
    whiteId: white.id,
    blackId: black.id,
    whiteOrigRating: white.rating,
    blackOrigRating: black.rating,
    whiteNewRating: white.rating,
    blackNewRating: black.rating,
  }
  |> scoreByeMatch(byeValue);
};

type actionTournament =
  | AddRound
  | DelLastRound
  | AddTieBreak(int)
  | DelTieBreak(int)
  | MoveTieBreak(int, int)
  | SetPlayers(array(Data.id))
  | SetByQueue(array(Data.id))
  | SetName(string)
  | AutoPair(
      float,
      int,
      Js.Dict.t(Pairing.t),
      Js.Dict.t(Data.Player.t),
      Data.Tournament.t,
    )
  | ManualPair(float, (Data.Player.t, Data.Player.t), int)
  | SetDate(Js.Date.t)
  | SetMatchResult(Data.id, (int, int), (float, float), int)
  | DelMatch(Data.id, int)
  | SwapColors(Data.id, int)
  | MoveMatch(int, int, int)
  | UpdateByeScores(float)
  | SetTournament(Data.Tournament.t);

let tournamentReducer = (state: Data.Tournament.t, action) => {
  switch (action) {
  | AddRound => {
      ...state,
      roundList: state.roundList |> Js.Array.concat([|[||]|]),
    }
  | DelLastRound => {
      ...state,
      roundList: state.roundList |> Js.Array.slice(~start=0, ~end_=-1),
    }
  | AddTieBreak(idToAdd) => {
      ...state,
      tieBreaks: state.tieBreaks |> Js.Array.concat([|idToAdd|]),
    }
  | DelTieBreak(idToDel) => {
      ...state,
      tieBreaks: state.tieBreaks |> Js.Array.filter(tbId => idToDel !== tbId),
    }
  | MoveTieBreak(oldIndex, newIndex) => {
      ...state,
      tieBreaks: state.tieBreaks |> Utils.move(oldIndex, newIndex),
    }
  | SetPlayers(playerIds) => {...state, playerIds}
  | SetByQueue(byeQueue) => {...state, byeQueue}
  | SetName(name) => {...state, name}
  | AutoPair(byeValue, roundId, pairData, playerDict, tourney) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    Js.Array.(
      roundList->unsafe_set(
        roundId,
        roundList->unsafe_get(roundId)
        |> concat(autoPair(~pairData, ~byeValue, ~tourney, ~playerDict)),
      )
    );
    {...state, roundList};
  | ManualPair(byeValue, (white, black), roundId) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    Js.Array.(
      roundList->unsafe_set(
        roundId,
        roundList->unsafe_get(roundId)
        |> concat([|manualPair((white, black), byeValue)|]),
      )
    );
    {...state, roundList};
  | SetDate(date) => {...state, date}
  | SetMatchResult(
      matchId,
      (whiteNewRating, blackNewRating),
      (whiteScore, blackScore),
      roundId,
    ) =>
    /* This is a lot of nested values, but right now I'm not sure what the
       easier way of doing this is*/
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    Js.Array.(
      roundList->unsafe_set(roundId, roundList->unsafe_get(roundId) |> copy)
    );
    let matchIndex =
      Js.Array.(
        roundList->unsafe_get(roundId)
        |> findIndex((match: Data.Match.t) => match.id === matchId)
      );
    let match = roundList[roundId][matchIndex];
    roundList[roundId][matchIndex] =
      Data.Match.{
        ...match,
        whiteScore,
        blackScore,
        whiteNewRating,
        blackNewRating,
      };
    {...state, roundList};
  | DelMatch(matchId, roundId) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    roundList[roundId] =
      roundList[roundId]
      |> Js.Array.filter((match: Data.Match.t) => match.id !== matchId);
    {...state, roundList};
  | SwapColors(matchId, roundId) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    Js.Array.(
      roundList->unsafe_set(roundId, roundList->unsafe_get(roundId) |> copy)
    );
    let matchIndex =
      Js.Array.(
        roundList->unsafe_get(roundId)
        |> findIndex((match: Data.Match.t) => match.id === matchId)
      );
    let oldMatch =
      Js.Array.(roundList->unsafe_get(roundId)->unsafe_get(matchIndex));
    /* TODO: clean this up. It just reverses the values */
    roundList[roundId][matchIndex] =
      Data.Match.{
        ...oldMatch,
        whiteId: oldMatch.blackId,
        blackId: oldMatch.whiteId,
        whiteScore: oldMatch.blackScore,
        blackScore: oldMatch.whiteScore,
        whiteOrigRating: oldMatch.blackOrigRating,
        blackOrigRating: oldMatch.whiteOrigRating,
        whiteNewRating: oldMatch.blackNewRating,
        blackNewRating: oldMatch.whiteNewRating,
      };
    {...state, roundList};
  | MoveMatch(oldIndex, newIndex, roundId) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    roundList[roundId] = roundList[roundId] |> Utils.move(oldIndex, newIndex);
    {...state, roundList};
  | UpdateByeScores(newValue) =>
    let roundList =
      Js.Array.(
        state.roundList
        |> map(round =>
             round |> map(match => match |> scoreByeMatch(newValue))
           )
      );
    {...state, roundList};
  | SetTournament(tourney) => tourney
  };
};

type actionPlayer =
  | SetPlayer(Data.Player.t)
  | DelPlayer(Data.id)
  | SetMatchCount(Data.id, int)
  | SetRating(Data.id, int)
  | SetPlayers(Belt.Map.String.t(Data.Player.t));

let playersReducer = (state, action) => {
  open Belt.Map.String;
  switch (action) {
  | SetPlayer(player) =>
    state->set(player.id, player);
  | DelPlayer(id) =>
    /*You should delete all avoid-pairs with the id too.*/
    state->remove(id);
  | SetMatchCount(id, matchCount) =>
    let player = state->getExn(id);
    state->set(id, Data.Player.{...player, matchCount});
  | SetRating(id, rating) =>
    let player = state->getExn(id);
    state->set(id, Data.Player.{...player, rating});
  | SetPlayers(state) => state
  };
};