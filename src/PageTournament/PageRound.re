open Belt;
open Data;
module Id = Data.Id;

module Style = {
  open Css;
  open Utils.PhotonColors;
  let winnerSelect = style([width(`percent(100.0)), fontSize(`em(1.0))]);
  let table =
    style([
      width(`percent(100.0)),
      selector(
        " tr:not(:last-of-type)",
        [
          borderBottomStyle(`solid),
          borderWidth(`px(1)),
          borderColor(grey_40),
        ],
      ),
    ]);
  let td = style([padding2(~v=`px(8), ~h=`px(4))]);
  let rowId =
    style([width(`px(20)), padding(`px(4)), textAlign(`center)]);
  let controls = style([width(`px(72))]);
  let matchResult = style([width(`px(140))]);
  let playerResult = style([width(`px(32)), textAlign(`center)]);
};

module PlayerMatchInfo = {
  [@react.component]
  let make =
      (~player, ~origRating, ~newRating, ~getPlayer, ~scoreData, ~players) => {
    let Hooks.{
          player,
          hasBye,
          colorBalance,
          score,
          rating,
          opponentResults,
          avoidListHtml,
        } =
      Hooks.useScoreInfo(
        ~player,
        ~scoreData,
        ~getPlayer,
        ~players,
        ~origRating,
        ~newRating,
        (),
      );
    let fullName = player.Player.firstName ++ " " ++ player.Player.lastName;
    <dl className="player-card">
      <h3> fullName->React.string </h3>
      <dt> "Score"->React.string </dt>
      <dd> score->React.float </dd>
      <dt> "Rating"->React.string </dt>
      <Utils.TestId testId={"rating-" ++ player.Player.id->Data.Id.toString}>
        <dd ariaLabel={"Rating for " ++ fullName}> rating </dd>
      </Utils.TestId>
      <dt> "Color balance"->React.string </dt>
      <dd> colorBalance->React.string </dd>
      <dt> "Has had a bye round"->React.string </dt>
      <dd> {React.string(hasBye ? "Yes" : "No")} </dd>
      <dt> "Opponent history"->React.string </dt>
      <dd> <ol> opponentResults </ol> </dd>
      <p> "Players to avoid:"->React.string </p>
      avoidListHtml
    </dl>;
  };
};

module MatchRow = {
  [@react.component]
  let make =
      (
        ~isCompact=false,
        ~pos,
        ~m,
        ~roundId,
        ~selectedMatch=?,
        ~setSelectedMatch,
        ~scoreData,
        ~tournament,
        ~className="",
      ) => {
    open Match;
    let LoadTournament.{
          tourney,
          setTourney,
          players,
          getPlayer,
          playersDispatch,
          _,
        } = tournament;
    let Tournament.{roundList, _} = tourney;
    let dialog = Hooks.useBool(false);
    let whitePlayer = getPlayer(m.whiteId);
    let blackPlayer = getPlayer(m.blackId);
    let isDummyRound =
      Data.Id.isDummy(m.whiteId) || Data.Id.isDummy(m.blackId);

    let whiteName =
      [whitePlayer.firstName, whitePlayer.lastName]
      ->Utils.String.concat(~sep=" ");
    let blackName =
      [blackPlayer.firstName, blackPlayer.lastName]
      ->Utils.String.concat(~sep=" ");

    let resultDisplay = playerColor => {
      let won =
        <Icons.Award
          className=Css.(style([color(Utils.PhotonColors.yellow_70)]))
        />;
      let lost =
        <Externals.VisuallyHidden>
          {React.string("Lost")}
        </Externals.VisuallyHidden>;
      switch (m.result) {
      | Match.Result.NotSet =>
        <Externals.VisuallyHidden>
          {React.string("Not set")}
        </Externals.VisuallyHidden>
      | Match.Result.Draw =>
        /* TODO: find a better icon for draws.*/
        <span
          ariaLabel="Draw"
          role="img"
          style={ReactDOMRe.Style.make(~filter="grayscale(70%)", ())}>
          {React.string({js|🤝|js})}
        </span>
      | Match.Result.BlackWon =>
        switch (playerColor) {
        | Scoring.Color.White => lost
        | Scoring.Color.Black => won
        }
      | Match.Result.WhiteWon =>
        switch (playerColor) {
        | Scoring.Color.White => won
        | Scoring.Color.Black => lost
        }
      };
    };

    let setMatchResult = jsResultCode => {
      let newResult = Match.Result.fromString(jsResultCode);
      /* if it hasn't changed, then do nothing*/
      if (m.result != newResult) {
        let white = players->Map.getExn(m.whiteId);
        let black = players->Map.getExn(m.blackId);
        let (whiteNewRating, blackNewRating) =
          switch (newResult) {
          | Match.Result.NotSet => (m.whiteOrigRating, m.blackOrigRating)
          | Match.Result.(BlackWon | WhiteWon | Draw) =>
            Ratings.calcNewRatings(
              ~whiteRating=m.whiteOrigRating,
              ~blackRating=m.blackOrigRating,
              ~whiteMatchCount=white.Player.matchCount,
              ~blackMatchCount=black.Player.matchCount,
              ~result=newResult,
            )
          };
        let white = Player.{...white, rating: whiteNewRating};
        let black = Player.{...black, rating: blackNewRating};
        switch (m.result) {
        /* If the result hasn't been scored yet, increment the matchCounts */
        | Match.Result.NotSet =>
          playersDispatch(
            Db.Set(
              white.Player.id,
              Player.{...white, matchCount: white.matchCount + 1},
            ),
          );
          playersDispatch(
            Db.Set(
              black.Player.id,
              Player.{...black, matchCount: black.matchCount + 1},
            ),
          );
        /* If the result is being un-scored, decrement the matchCounts */
        | Match.Result.(WhiteWon | BlackWon | Draw)
            when newResult === Match.Result.NotSet =>
          playersDispatch(
            Db.Set(
              white.Player.id,
              Player.{...white, matchCount: white.matchCount - 1},
            ),
          );
          playersDispatch(
            Db.Set(
              black.Player.id,
              Player.{...black, matchCount: black.matchCount - 1},
            ),
          );
        /* Simply update the players with new ratings. */
        | Match.Result.(WhiteWon | BlackWon | Draw) =>
          playersDispatch(Db.Set(white.Player.id, white));
          playersDispatch(Db.Set(black.Player.id, black));
        };
        let newMatch = {
          ...m,
          result: newResult,
          whiteNewRating,
          blackNewRating,
        };
        roundList
        ->Rounds.setMatch(roundId, newMatch)
        ->Option.map(roundList =>
            setTourney(Tournament.{...tourney, roundList})
          )
        ->ignore;
      };
    };
    let setMatchResultBlur = event => {
      setMatchResult(ReactEvent.Focus.target(event)##value);
    };
    let setMatchResultChange = event => {
      setMatchResult(ReactEvent.Form.target(event)##value);
    };
    <tr
      className=Cn.(
        className
        <:> Option.mapWithDefault(selectedMatch, "", id =>
              Id.eq(m.id, id) ? "selected" : "buttons-on-hover"
            )
      )>
      <th className=Cn.(Style.rowId <:> "table__number") scope="row">
        {string_of_int(pos + 1)->React.string}
      </th>
      <td className=Style.playerResult>
        {resultDisplay(Scoring.Color.White)}
      </td>
      <Utils.TestId testId={"match-" ++ string_of_int(pos) ++ "-white"}>
        <td
          className=Cn.(
            "table__player row__player"
            <:> Player.Type.toString(whitePlayer.Player.type_)
          )
          id={"match-" ++ string_of_int(pos) ++ "-white"}>
          {React.string(whiteName)}
        </td>
      </Utils.TestId>
      <td className=Style.playerResult>
        {resultDisplay(Scoring.Color.Black)}
      </td>
      <Utils.TestId testId={"match-" ++ string_of_int(pos) ++ "-black"}>
        <td
          className=Cn.(
            "table__player row__player"
            <:> Player.Type.toString(blackPlayer.Player.type_)
          )
          id={"match-" ++ string_of_int(pos) ++ "-black"}>
          {React.string(blackName)}
        </td>
      </Utils.TestId>
      <td className=Cn.(Style.matchResult <:> "data__input row__controls")>
        <select
          className=Style.winnerSelect
          disabled=isDummyRound
          value={Match.Result.toString(m.result)}
          onBlur=setMatchResultBlur
          onChange=setMatchResultChange>
          <option value=Match.Result.(toString(NotSet))>
            {React.string("Select winner")}
          </option>
          <option value=Match.Result.(toString(WhiteWon))>
            {React.string("White won")}
          </option>
          <option value=Match.Result.(toString(BlackWon))>
            {React.string("Black won")}
          </option>
          <option value=Match.Result.(toString(Draw))>
            {React.string("Draw")}
          </option>
        </select>
      </td>
      {switch (isCompact, setSelectedMatch) {
       | (false, None)
       | (true, _) => React.null
       | (false, Some(setSelectedMatch)) =>
         <td className=Cn.(Style.controls <:> "data__input")>
           {selectedMatch->Option.mapWithDefault(true, id => !Id.eq(id, m.id))
              ? <button
                  className="button-ghost"
                  title="Edit match"
                  onClick={_ => setSelectedMatch(_ => Some(m.id))}>
                  <Icons.Circle />
                  <Externals.VisuallyHidden>
                    {["Edit match for", whiteName, "versus", blackName]
                     ->Utils.String.concat(~sep=" ")
                     ->React.string}
                  </Externals.VisuallyHidden>
                </button>
              : <button
                  className="button-ghost button-pressed"
                  title="End editing match"
                  onClick={_ => setSelectedMatch(_ => None)}>
                  <Icons.CheckCircle />
                </button>}
           <button
             className="button-ghost"
             title="Open match information."
             onClick={_ => dialog.setTrue()}>
             <Icons.Info />
             <Externals.VisuallyHidden>
               {[
                  "View information for match:",
                  whiteName,
                  "versus",
                  blackName,
                ]
                ->Utils.String.concat(~sep=" ")
                ->React.string}
             </Externals.VisuallyHidden>
           </button>
           {switch (scoreData) {
            | None => React.null
            | Some(scoreData) =>
              <Externals.Dialog
                isOpen={dialog.state}
                onDismiss={_ => dialog.setFalse()}
                ariaLabel="Match information">
                <button
                  className="button-micro button-primary"
                  onClick={_ => dialog.setFalse()}>
                  {React.string("close")}
                </button>
                <p> {React.string(tourney.Tournament.name)} </p>
                <p>
                  {[
                     "Round",
                     Int.toString(roundId + 1),
                     "match",
                     Int.toString(pos + 1),
                   ]
                   ->Utils.String.concat(~sep=" ")
                   ->React.string}
                </p>
                <Utils.PanelContainer>
                  <Utils.Panel>
                    <PlayerMatchInfo
                      player={getPlayer(m.whiteId)}
                      origRating={m.whiteOrigRating}
                      newRating={Some(m.whiteNewRating)}
                      getPlayer
                      scoreData
                      players
                    />
                  </Utils.Panel>
                  <Utils.Panel>
                    <PlayerMatchInfo
                      player={getPlayer(m.blackId)}
                      origRating={m.blackOrigRating}
                      newRating={Some(m.blackNewRating)}
                      getPlayer
                      scoreData
                      players
                    />
                  </Utils.Panel>
                </Utils.PanelContainer>
              </Externals.Dialog>
            }}
         </td>
       }}
    </tr>;
  };
};

module RoundTable = {
  [@react.component]
  let make =
      (
        ~isCompact=false,
        ~roundId,
        ~matches,
        ~selectedMatch=?,
        ~setSelectedMatch=?,
        ~tournament,
        ~scoreData=?,
      ) => {
    <table className=Style.table>
      {Js.Array.length(matches) == 0
         ? React.null
         : <>
             <caption className={isCompact ? "title-30" : "title-40"}>
               {React.string("Round ")}
               {React.int(roundId + 1)}
             </caption>
             <thead>
               <tr>
                 <th className=Style.rowId scope="col">
                   {React.string("#")}
                 </th>
                 <th scope="col">
                   <Externals.VisuallyHidden>
                     {React.string("White result")}
                   </Externals.VisuallyHidden>
                 </th>
                 <th className="row__player" scope="col">
                   {React.string("White")}
                 </th>
                 <th scope="col">
                   <Externals.VisuallyHidden>
                     {React.string("Black result")}
                   </Externals.VisuallyHidden>
                 </th>
                 <th className="row__player" scope="col">
                   {React.string("Black")}
                 </th>
                 <th className="row__result" scope="col">
                   {React.string("Match result")}
                 </th>
                 {isCompact
                    ? React.null
                    : <th className="row__controls" scope="col">
                        <Externals.VisuallyHidden>
                          {React.string("Controls")}
                        </Externals.VisuallyHidden>
                      </th>}
               </tr>
             </thead>
           </>}
      <tbody className="content">
        {Array.mapWithIndex(matches, (pos, m: Match.t) =>
           <MatchRow
             key={m.Match.id->Data.Id.toString}
             isCompact
             m
             pos
             roundId
             ?selectedMatch
             setSelectedMatch
             scoreData
             tournament
             className=Style.td
           />
         )
         ->React.array}
      </tbody>
    </table>;
  };
};

module Round = {
  [@react.component]
  let make = (~roundId, ~tournament, ~scoreData) => {
    let LoadTournament.{tourney, players, setTourney, playersDispatch, _} = tournament;
    let Tournament.{roundList, _} = tourney;
    let (selectedMatch, setSelectedMatch) = React.useState(() => None);

    let unMatch = (matchId, round) => {
      switch (round->Rounds.Round.getMatchById(matchId)) {
      /* checks if the match has been scored yet & resets the players'
         records */
      | Some(match) when match.Match.result !== Match.Result.NotSet =>
        Match.[
          (match.whiteId, match.whiteOrigRating),
          (match.blackId, match.blackOrigRating),
        ]
        ->List.forEach(((id, rating)) =>
            switch (players->Map.get(id)) {
            /* If there was a dummy player or a deleted player then bail
               on the dispatch. */
            | None => ()
            | Some(player) =>
              playersDispatch(
                Db.Set(
                  player.Player.id,
                  Player.{
                    ...player,
                    rating,
                    matchCount: player.matchCount - 1,
                  },
                ),
              )
            }
          )
      | None
      | Some(_) => ()
      };
      let newRound = round->Rounds.Round.removeMatchById(matchId);
      switch (roundList->Rounds.set(roundId, newRound)) {
      | Some(roundList) => setTourney(Tournament.{...tourney, roundList})
      | None => ()
      };
      setSelectedMatch(_ => None);
    };

    let swapColors = (matchId, round) => {
      switch (round->Rounds.Round.getMatchById(matchId)) {
      | Some(match) =>
        let newMatch = Match.swapColors(match);
        roundList
        ->Rounds.setMatch(roundId, newMatch)
        ->Option.map(roundList =>
            setTourney(Tournament.{...tourney, roundList})
          )
        ->ignore;
      | None => ()
      };
    };

    let moveMatch = (matchId, direction, round) => {
      switch (Rounds.Round.moveMatch(round, matchId, direction)) {
      | None => ()
      | Some(newRound) =>
        switch (Rounds.set(roundList, roundId, newRound)) {
        | Some(roundList) => setTourney(Tournament.{...tourney, roundList})
        | None => ()
        }
      };
    };

    switch (Rounds.get(tourney.Tournament.roundList, roundId)) {
    | None => <Pages.NotFound />
    | Some(matches) =>
      <div className="content-area">
        <div className="toolbar">
          <button
            className="button-micro"
            disabled={selectedMatch == None}
            onClick={_ =>
              selectedMatch->Option.map(unMatch(_, matches))->ignore
            }>
            <Icons.Trash />
            {React.string(" Unmatch")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch == None}
            onClick={_ =>
              selectedMatch->Option.map(swapColors(_, matches))->ignore
            }>
            <Icons.Repeat />
            {React.string(" Swap colors")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch == None}
            onClick={_ =>
              selectedMatch->Option.map(moveMatch(_, -1, matches))->ignore
            }>
            <Icons.ArrowUp />
            {React.string(" Move up")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch == None}
            onClick={_ =>
              selectedMatch->Option.map(moveMatch(_, 1, matches))->ignore
            }>
            <Icons.ArrowDown />
            {React.string(" Move down")}
          </button>
        </div>
        {Rounds.Round.size(matches) == 0
           ? <p> {React.string("No players matched yet.")} </p> : React.null}
        <RoundTable
          roundId
          ?selectedMatch
          setSelectedMatch
          tournament
          scoreData
          matches={Rounds.Round.toArray(matches)}
        />
      </div>
    };
  };
};

[@react.component]
let make = (~roundId, ~tournament) => {
  let LoadTournament.{
        activePlayersCount,
        scoreData,
        unmatched,
        unmatchedCount,
        unmatchedWithDummy,
      } =
    LoadTournament.useRoundData(roundId, tournament);
  let initialTab = unmatchedCount == activePlayersCount ? 1 : 0;
  let (openTab, setOpenTab) = React.useState(() => initialTab);
  /* Auto-switch the tab */
  React.useEffect3(
    () => {
      if (unmatchedCount == activePlayersCount) {
        setOpenTab(_ => 1);
      };
      if (unmatchedCount == 0) {
        setOpenTab(_ => 0);
      };
      None;
    },
    (unmatchedCount, activePlayersCount, setOpenTab),
  );
  Externals.ReachTabs.(
    <Tabs index=openTab onChange={index => setOpenTab(_ => index)}>
      <TabList>
        <Tab disabled={unmatchedCount == activePlayersCount}>
          <Icons.List />
          {React.string(" Matches")}
        </Tab>
        <Tab disabled={unmatchedCount == 0}>
          <Icons.Users />
          {[" Unmatched players (", Int.toString(unmatchedCount), ")"]
           ->Utils.String.concat(~sep="")
           ->React.string}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel> <Round roundId tournament scoreData /> </TabPanel>
        <TabPanel>
          <div>
            {unmatchedCount != 0
               ? <PairPicker
                   roundId
                   tournament
                   unmatched
                   unmatchedWithDummy
                   unmatchedCount
                   scoreData
                 />
               : React.null}
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
