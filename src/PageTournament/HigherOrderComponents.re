/* Some components live in different parts of the app and require different
   markup but share the same underlying logic and data. Use these modules to
   compose them. */
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
    let round = Rounds.get(roundList, roundId);
    let isThisTheLastRound = roundId === Rounds.getLastKey(roundList);
    let unmatched =
      switch (round, isThisTheLastRound) {
      | (Some(round), true) =>
        let matched = Rounds.Round.getMatched(round);
        Map.String.removeMany(activePlayers, matched);
      | (None, _)
      | (Some(_), false) => Map.String.empty
      };
    let unmatchedCount = Map.String.size(unmatched);
    /* make a new list so as not to affect auto-pairing*/
    let unmatchedWithDummy =
      unmatchedCount mod 2 !== 0
        ? Map.String.set(
            unmatched,
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
      switch (Map.String.get(scoreData, player.Player.id)) {
      | Some(data) => data
      | None => Scoring.createBlankScoreData(player.id)
      };
    let hasBye = Map.String.has(opponentResults, Player.dummy_id);
    let colorBalance =
      switch (Utils.List.sumF(colorScores)) {
      | x when x < 0.0 => "White +" ++ (x |> abs_float |> Js.Float.toString)
      | x when x > 0.0 => "Black +" ++ (x |> Js.Float.toString)
      | _ => "Even"
      };
    let avoidMap =
      Option.mapWithDefault(
        avoidPairs,
        Map.String.empty,
        Config.AvoidPairs.toMap,
      );
    let avoidList =
      switch (Map.String.get(avoidMap, player.id)) {
      | None => []
      | Some(avoidList) => avoidList
      };
    let score = Utils.List.sumF(results);
    let opponentResults =
      Map.String.toArray(opponentResults)
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
      Utils.List.toReactArrayReverse(avoidList, pId =>
        switch (Map.String.get(players, pId)) {
        /*  don't show players not in this tourney*/
        | None => React.null
        | Some({Player.firstName, lastName}) =>
          <li key=pId> {React.string(firstName ++ " " ++ lastName)} </li>
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
             {Numeral.fromInt(newRating - origRating)
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