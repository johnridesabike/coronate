open Belt;
open Data;

let scoreByeMatch = (byeValue, match) =>
  switch (Player.(isDummyId(match.Match.whiteId), isDummyId(match.blackId))) {
  | (true, false) => {
      ...match,
      result: ByeValue.resultForPlayerColor(byeValue, Match.Result.Black),
    }
  | (false, true) => {
      ...match,
      result: ByeValue.resultForPlayerColor(byeValue, Match.Result.White),
    }
  | (false, false) /* lol */
  | (true, true) => match
  };

let autoPair = (~pairData, ~byeValue, ~playerMap, ~tourney) => {
  /* the pairData includes any players who were already matched. We need to
     only include the specified players. */
  let playerIds = playerMap |> Map.String.keysToArray;
  let filteredData =
    pairData->Map.String.reduce(Map.String.empty, (acc, key, datum) =>
      if (playerIds |> Js.Array.includes(key)) {
        acc->Map.String.set(key, datum);
      } else {
        acc;
      }
    );
  let (pairdataNoByes, byePlayerData) =
    Pairing.setByePlayer(
      tourney.Tournament.byeQueue,
      Player.dummy_id,
      filteredData,
    );
  let pairs = Pairing.pairPlayers(pairdataNoByes);
  let pairsWithBye =
    switch (byePlayerData) {
    | Some(player) =>
      pairs |> Js.Array.concat([|(player.id, Player.dummy_id)|])
    | None => pairs
    };
  let getPlayer = Player.getPlayerMaybe(playerMap);
  let newMatchList =
    pairsWithBye
    |> Js.Array.map(((whiteId, blackId)) =>
         Match.{
           id: Utils.nanoid(),
           whiteOrigRating: getPlayer(whiteId).rating,
           blackOrigRating: getPlayer(blackId).rating,
           whiteNewRating: getPlayer(whiteId).rating,
           blackNewRating: getPlayer(blackId).rating,
           whiteId,
           blackId,
           result: Match.Result.NotSet,
         }
       );
  newMatchList |> Js.Array.map(scoreByeMatch(byeValue));
};

let manualPair = ((white, black), byeValue) => {
  Match.{
    id: Utils.nanoid(),
    result: Match.Result.NotSet,
    whiteId: white.Player.id,
    blackId: black.Player.id,
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
  | SetTourneyPlayers(array(id))
  | SetByeQueue(array(id))
  | SetName(string)
  | AutoPair(
      ByeValue.t,
      int,
      Map.String.t(Pairing.t),
      Map.String.t(Player.t),
      Tournament.t,
    )
  | ManualPair(ByeValue.t, (Player.t, Player.t), int)
  | SetDate(Js.Date.t)
  | SetMatchResult(id, (int, int), Match.Result.t, int)
  | DelMatch(id, int)
  | SwapColors(id, int)
  | MoveMatch(int, int, int)
  | UpdateByeScores(ByeValue.t)
  | SetTournament(Tournament.t);

let tournamentReducer = (state, action) => {
  switch (action) {
  | AddRound =>
    Tournament.{
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
      tieBreaks: state.tieBreaks->Utils.Array.swap(oldIndex, newIndex),
    }
  | SetTourneyPlayers(playerIds) => {...state, playerIds}
  | SetByeQueue(byeQueue) => {...state, byeQueue}
  | SetName(name) => {...state, name}
  | AutoPair(byeValue, roundId, pairData, playerMap, tourney) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    Js.Array.(
      roundList->unsafe_set(
        roundId,
        roundList->unsafe_get(roundId)
        |> concat(autoPair(~pairData, ~byeValue, ~tourney, ~playerMap)),
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
      result,
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
        |> findIndex((match: Match.t) => match.id === matchId)
      );
    let match = roundList->Array.getExn(roundId)->Array.getExn(matchIndex);
    roundList
    ->Array.getExn(roundId)
    ->Array.set(
        matchIndex,
        Match.{...match, result, whiteNewRating, blackNewRating},
      )
    |> ignore;
    {...state, roundList};
  | DelMatch(matchId, roundId) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    roundList->Array.set(
      roundId,
      roundList->Array.getExn(roundId)
      |> Js.Array.filter((match: Match.t) => match.id !== matchId),
    )
    |> ignore;
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
        |> findIndex((match: Match.t) => match.id === matchId)
      );
    let oldMatch =
      Js.Array.(roundList->unsafe_get(roundId)->unsafe_get(matchIndex));
    let result =
      Match.Result.(
        switch (oldMatch.result) {
        | WhiteWon => BlackWon
        | BlackWon => WhiteWon
        | Draw => Draw
        | NotSet => NotSet
        }
      );
    /* TODO: clean this up. It just reverses the values */
    roundList
    ->Array.getExn(roundId)
    ->Array.set(
        matchIndex,
        Match.{
          ...oldMatch,
          result,
          whiteId: oldMatch.blackId,
          blackId: oldMatch.whiteId,
          whiteOrigRating: oldMatch.blackOrigRating,
          blackOrigRating: oldMatch.whiteOrigRating,
          whiteNewRating: oldMatch.blackNewRating,
          blackNewRating: oldMatch.whiteNewRating,
        },
      )
    |> ignore;
    {...state, roundList};
  | MoveMatch(oldIndex, newIndex, roundId) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    roundList->Array.set(
      roundId,
      roundList->Array.getExn(roundId)->Utils.Array.swap(oldIndex, newIndex),
    )
    |> ignore;
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
  | SetPlayer(Player.t)
  | DelPlayer(id)
  | SetMatchCount(id, int)
  | SetRating(id, int)
  | SetPlayers(Map.String.t(Player.t));

let playersReducer = (state, action) => {
  Map.String.(
    switch (action) {
    | SetPlayer(player) => state->set(player.id, player)
    | DelPlayer(id) =>
      /*You should delete all avoid-pairs with the id too.*/
      state->remove(id)
    | SetMatchCount(id, matchCount) =>
      let player = state->getExn(id);
      state->set(id, Player.{...player, matchCount});
    | SetRating(id, rating) =>
      let player = state->getExn(id);
      state->set(id, Player.{...player, rating});
    | SetPlayers(state) => state
    }
  );
};