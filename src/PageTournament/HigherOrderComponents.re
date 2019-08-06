/*
  Some components live in different parts of the app and require different
  markup but share the same underlying logic and data. Use these modules to
  compose them.
 */
open Belt;
open Data;

/* I extracted this logic to its own module so it could be easily
   reused (e.g. in testing). It may have also made the whole component tree more
   complicated. */
module WithRoundData =
       (
         BaseComponent: {
           [@react.component]
           let make:
             (
               ~roundId: int,
               ~tournament: LoadTournament.t,
               ~activePlayersCount: int,
               ~scoreData: Map.String.t(Scoring.t),
               ~unmatched: Map.String.t(Player.t),
               ~unmatchedCount: int,
               ~unmatchedWithDummy: Map.String.t(Player.t)
             ) =>
             React.element;
         },
       ) => {
  [@react.component]
  let make = (~roundId, ~tournament) => {
    let {LoadTournament.tourney, activePlayers, getPlayer} = tournament;
    let {Tournament.roundList} = tourney;
    /* matches2ScoreData is relatively expensive*/
    let scoreData =
      React.useMemo1(
        () =>
          Converters.matches2ScoreData(
            Rounds.rounds2Matches(~roundList, ()),
          ),
        [|roundList|],
      );
    /* Only calculate unmatched players for the latest round. Old rounds
       don't get to add new players.
       Should this be memoized? */
    let round = roundList->Rounds.get(roundId);
    let isThisTheLastRound = roundId === Rounds.getLastKey(roundList);
    let unmatched =
      switch (round, isThisTheLastRound) {
      | (Some(round), true) =>
        let matched = Rounds.Round.getMatched(round);
        activePlayers->Map.String.removeMany(matched);
      | (None, _)
      | (Some(_), false) => Map.String.empty
      };
    let unmatchedCount = Map.String.size(unmatched);
    /* make a new list so as not to affect auto-pairing*/
    let unmatchedWithDummy =
      unmatchedCount mod 2 !== 0
        ? unmatched->Map.String.set(
            Player.dummy_id,
            getPlayer(Player.dummy_id),
          )
        : unmatched;
    let activePlayersCount = Map.String.size(activePlayers);
    <BaseComponent
      roundId
      activePlayersCount
      tournament
      scoreData
      unmatched
      unmatchedCount
      unmatchedWithDummy
    />;
  };
};

/*
   For the two components that use this, their logic is basically the same but
   their markup is slightly different. We may want to just merge them into one
   component instead of managing two similar components and one higher-order
   component.
 */
module WithScoreInfo =
       (
         BaseComponent: {
           [@react.component]
           let make:
             (
               ~hasBye: bool,
               ~colorBalance: string,
               ~player: Player.t,
               ~score: float,
               ~rating: React.element,
               ~opponentResults: React.element,
               ~avoidListHtml: React.element
             ) =>
             React.element;
         },
       ) => {
  [@react.component]
  let make =
      (
        ~player,
        ~scoreData,
        ~avoidPairs=?,
        ~getPlayer,
        ~players,
        ~origRating,
        ~newRating,
      ) => {
    let {Scoring.colorScores, opponentResults, results} =
      switch (scoreData->Map.String.get(player.Player.id)) {
      | Some(data) => data
      | None => Scoring.createBlankScoreData(player.id)
      };
    let hasBye = opponentResults->Map.String.has(Player.dummy_id);
    let colorBalance =
      switch (Utils.List.sumF(colorScores)) {
      | x when x < 0.0 => "White +" ++ (x |> abs_float |> Js.Float.toString)
      | x when x > 0.0 => "Black +" ++ (x |> Js.Float.toString)
      | _ => "Even"
      };
    let avoidMap =
      avoidPairs->Option.mapWithDefault(Map.String.empty, x =>
        x->Set.reduce(Map.String.empty, Config.AvoidPairs.reduceToMap)
      );
    let avoidList =
      switch (avoidMap->Map.String.get(player.id)) {
      | None => []
      | Some(avoidList) => avoidList
      };
    let score = Utils.List.sumF(results);
    let oppResultsEntries = Map.String.toArray(opponentResults);
    let opponentResults =
      oppResultsEntries
      |> Js.Array.map(((opId, result)) =>
           <li key=opId>
             {[
                getPlayer(opId).Player.firstName,
                getPlayer(opId).lastName,
                "-",
                switch (result) {
                | 0.0 => "Lost"
                | 1.0 => "Won"
                | 0.5 => "Draw"
                | _ => "Draw"
                },
              ]
              |> String.concat(" ")
              |> React.string}
           </li>
         )
      |> React.array;
    let avoidListHtml =
      avoidList->Utils.List.toReactArrayReverse(pId =>
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
      );
    let rating =
      <>
        {origRating |> Js.Int.toString |> React.string}
        {switch (newRating) {
         | None => React.null
         | Some(newRating) =>
           <span>
             {React.string(" (")}
             {float_of_int(newRating - origRating)
              ->Numeral.make
              ->Numeral.format("+0")
              ->React.string}
             {React.string(")")}
           </span>
         }}
      </>;
    <BaseComponent
      player
      hasBye
      colorBalance
      score
      rating
      opponentResults
      avoidListHtml
    />;
  };
};