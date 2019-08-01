open Belt;
open Data;

type actionTournament =
  | AddRound
  | DelLastRound
  | AddTieBreak(int)
  | DelTieBreak(int)
  | MoveTieBreak(int, int)
  | AutoPair(
      ByeValue.t,
      int,
      Map.String.t(Pairing.t),
      Map.String.t(Player.t),
      Tournament.t,
    )
  | ManualPair(ByeValue.t, (Player.t, Player.t), int)
  | SetMatchResult(string, (int, int), Match.Result.t, int)
  | DelMatch(string, int)
  | SwapColors(string, int)
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
  | AutoPair(byeValue, roundId, pairData, playerMap, tourney) =>
    /* I don't actually know if this copy is necessary */
    let roundList = state.roundList |> Js.Array.copy;
    Js.Array.(
      roundList->unsafe_set(
        roundId,
        roundList->unsafe_get(roundId)
        |> concat(
             Match.autoPair(
               ~pairData,
               ~byeValue,
               ~byeQueue=tourney.byeQueue,
               ~playerMap,
             ),
           ),
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
        |> concat([|Match.manualPair((white, black), byeValue)|]),
      )
    );
    {...state, roundList};
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
    /* This just reverses the values */
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
             round |> map(match => match |> Match.scoreByeMatch(newValue))
           )
      );
    {...state, roundList};
  | SetTournament(tourney) => tourney
  };
};

type actionPlayer =
  | SetPlayer(Player.t)
  | DelPlayer(string)
  | SetPlayers(Map.String.t(Player.t));

let playersReducer = (state, action) => {
  Map.String.(
    switch (action) {
    | SetPlayer(player) => state->set(player.id, player)
    /*You should delete all avoid-pairs with the id too.*/
    | DelPlayer(id) => state->remove(id)
    | SetPlayers(state) => state
    }
  );
};