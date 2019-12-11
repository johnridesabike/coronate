open Belt;
open Data;

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

module PlayerMatchInfo =
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
        <dt> {React.string("Score")} </dt>
        <dd> {score->Js.Float.toString->React.string} </dd>
        <dt> {React.string("Rating")} </dt>
        <Utils.TestId testId={"rating-" ++ player.id}>
          <dd ariaLabel={"Rating for " ++ fullName}> rating </dd>
        </Utils.TestId>
        <dt> {React.string("Color balance")} </dt>
        <dd> {React.string(colorBalance)} </dd>
        <dt> {React.string("Has had a bye round")} </dt>
        <dd> {React.string(hasBye ? "Yes" : "No")} </dd>
        <dt> {React.string("Opponent history")} </dt>
        <dd> <ol> opponentResults </ol> </dd>
        <p> {React.string("Players to avoid:")} </p>
        avoidListHtml
      </dl>;
    };
  });

module MatchRow = {
  [@react.component]
  let make =
      (
        ~isCompact=false,
        ~pos,
        ~m,
        ~roundId,
        /* Default to `None` so there aren't nested `option`s */
        ~selectedMatch=None,
        ~setSelectedMatch,
        ~scoreData,
        ~tournament,
        ~className="",
      ) => {
    let {
      LoadTournament.tourney,
      setTourney,
      players,
      getPlayer,
      playersDispatch,
    } = tournament;
    let {Tournament.roundList} = tourney;
    let (isModalOpen, setIsModalOpen) = React.useState(() => false);
    let whitePlayer = getPlayer(m.Match.whiteId);
    let blackPlayer = getPlayer(m.blackId);
    let isDummyRound =
      m.whiteId === Player.dummy_id || m.blackId === Player.dummy_id;

    let whiteName =
      [whitePlayer.firstName, whitePlayer.lastName] |> String.concat(" ");
    let blackName =
      [blackPlayer.firstName, blackPlayer.lastName] |> String.concat(" ");

    let resultDisplay = playerColor => {
      let won =
        <Icons.Award
          className=Css.(style([color(Utils.PhotonColors.yellow_70)]))
        />;
      let lost =
        <Utils.VisuallyHidden> {React.string("Lost")} </Utils.VisuallyHidden>;
      switch (m.result) {
      | NotSet =>
        <Utils.VisuallyHidden>
          {React.string("Not set")}
        </Utils.VisuallyHidden>
      | Draw =>
        /* TODO: find a better icon for draws.*/
        <span
          ariaLabel="Draw"
          role="img"
          style={ReactDOMRe.Style.make(~filter="grayscale(70%)", ())}>
          {React.string({js|🤝|js})}
        </span>
      | BlackWon =>
        switch (playerColor) {
        | Match.Result.White => lost
        | Black => won
        }
      | WhiteWon =>
        switch (playerColor) {
        | White => won
        | Black => lost
        }
      };
    };

    let setMatchResult = jsResultCode => {
      let newResult = Match.Result.fromString(jsResultCode);
      /* if it hasn't changed, then do nothing*/
      if (m.result !== newResult) {
        let white = players->Map.String.getExn(m.whiteId);
        let black = players->Map.String.getExn(m.blackId);
        let newWhiteScore = newResult->Match.Result.(toFloat(White));
        let newBlackScore = newResult->Match.Result.(toFloat(Black));
        let (whiteNewRating, blackNewRating) =
          switch (newResult) {
          | NotSet => (m.whiteOrigRating, m.blackOrigRating)
          | BlackWon
          | WhiteWon
          | Draw =>
            Scoring.Ratings.calcNewRatings(
              (m.whiteOrigRating, m.blackOrigRating),
              (white.matchCount, black.matchCount),
              (newWhiteScore, newBlackScore),
            )
          };
        let white = {...white, rating: whiteNewRating};
        let black = {...black, rating: blackNewRating};
        switch (m.result) {
        /* If the result hasn't been scored yet, increment the matchCounts */
        | NotSet =>
          playersDispatch(
            Set(white.id, {...white, matchCount: white.matchCount + 1}),
          );
          playersDispatch(
            Set(black.id, {...black, matchCount: black.matchCount + 1}),
          );
        /* If the result is being un-scored, decrement the matchCounts */
        | WhiteWon
        | BlackWon
        | Draw when newResult === NotSet =>
          playersDispatch(
            Set(white.id, {...white, matchCount: white.matchCount - 1}),
          );
          playersDispatch(
            Set(black.id, {...black, matchCount: black.matchCount - 1}),
          );
        /* Simply update the players with new ratings. */
        | WhiteWon
        | BlackWon
        | Draw =>
          playersDispatch(Set(white.id, white));
          playersDispatch(Set(black.id, black));
        };
        let newMatch = {
          ...m,
          result: newResult,
          whiteNewRating,
          blackNewRating,
        };
        roundList
        ->Rounds.setMatch(roundId, newMatch)
        ->Option.map(roundList => setTourney({...tourney, roundList}))
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
      className={Cn.make([
        className,
        Option.mapWithDefault(selectedMatch, "", id =>
          m.id === id ? "selected" : "buttons-on-hover"
        ),
      ])}>
      <th className={Cn.make([Style.rowId, "table__number"])} scope="row">
        {string_of_int(pos + 1)->React.string}
      </th>
      <td className=Style.playerResult> {resultDisplay(White)} </td>
      <td
        className={Cn.make([
          "table__player row__player",
          Player.Type.toString(whitePlayer.type_),
        ])}
        id={"match-" ++ string_of_int(pos) ++ "-white"}>
        {React.string(whiteName)}
      </td>
      <td className=Style.playerResult> {resultDisplay(Black)} </td>
      <td
        className={Cn.make([
          "table__player row__player",
          Player.Type.toString(blackPlayer.type_),
        ])}
        id={"match-" ++ string_of_int(pos) ++ "-black"}>
        {React.string(blackName)}
      </td>
      <td
        className={Cn.make([Style.matchResult, "data__input row__controls"])}>
        <select
          className=Style.winnerSelect
          disabled=isDummyRound
          value={Match.Result.toString(m.result)}
          onBlur=setMatchResultBlur
          onChange=setMatchResultChange>
          <option value={Match.Result.toString(NotSet)}>
            {React.string("Select winner")}
          </option>
          <option value={Match.Result.toString(WhiteWon)}>
            {React.string("White won")}
          </option>
          <option value={Match.Result.toString(BlackWon)}>
            {React.string("Black won")}
          </option>
          <option value={Match.Result.toString(Draw)}>
            {React.string("Draw")}
          </option>
        </select>
      </td>
      {switch (isCompact, setSelectedMatch) {
       | (false, None)
       | (true, _) => React.null
       | (false, Some(setSelectedMatch)) =>
         <td className={Cn.make([Style.controls, "data__input"])}>
           {selectedMatch->Option.mapWithDefault(true, id => id !== m.id)
              ? <button
                  className="button-ghost"
                  title="Edit match"
                  onClick={_ => setSelectedMatch(_ => Some(m.id))}>
                  <Icons.Circle />
                  <Utils.VisuallyHidden>
                    {["Edit match for", whiteName, "versus", blackName]
                     |> String.concat(" ")
                     |> React.string}
                  </Utils.VisuallyHidden>
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
             onClick={_ => setIsModalOpen(_ => true)}>
             <Icons.Info />
             <Utils.VisuallyHidden>
               {[
                  "View information for match:",
                  whiteName,
                  "versus",
                  blackName,
                ]
                |> String.concat(" ")
                |> React.string}
             </Utils.VisuallyHidden>
           </button>
           {switch (scoreData) {
            | None => React.null
            | Some(scoreData) =>
              <Utils.Dialog
                isOpen=isModalOpen
                onDismiss={_ => setIsModalOpen(_ => false)}
                ariaLabel="Match information">
                <button
                  className="button-micro button-primary"
                  onClick={_ => setIsModalOpen(_ => false)}>
                  {React.string("close")}
                </button>
                <p> {React.string(tourney.name)} </p>
                <p>
                  {[
                     "Round",
                     Js.Int.toString(roundId + 1),
                     "match",
                     Js.Int.toString(pos + 1),
                   ]
                   |> String.concat(" ")
                   |> React.string}
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
              </Utils.Dialog>
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
        /* Default to `None` so there aren't nested `option`s */
        ~selectedMatch=None,
        ~setSelectedMatch=?,
        ~tournament,
        ~scoreData=?,
      ) => {
    <table className=Style.table>
      {Js.Array.length(matches) === 0
         ? React.null
         : <>
             <caption className={isCompact ? "title-30" : "title-40"}>
               {React.string("Round ")}
               {Js.Int.toString(roundId + 1)->React.string}
             </caption>
             <thead>
               <tr>
                 <th className=Style.rowId scope="col">
                   {React.string("#")}
                 </th>
                 <th scope="col">
                   <Utils.VisuallyHidden>
                     {React.string("White result")}
                   </Utils.VisuallyHidden>
                 </th>
                 <th className="row__player" scope="col">
                   {React.string("White")}
                 </th>
                 <th scope="col">
                   <Utils.VisuallyHidden>
                     {React.string("Black result")}
                   </Utils.VisuallyHidden>
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
                        <Utils.VisuallyHidden>
                          {React.string("Controls")}
                        </Utils.VisuallyHidden>
                      </th>}
               </tr>
             </thead>
           </>}
      <tbody className="content">
        {Array.mapWithIndex(matches, (pos, m: Match.t) =>
           <MatchRow
             key={m.id}
             isCompact
             m
             pos
             roundId
             selectedMatch
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
    let {LoadTournament.tourney, players, setTourney, playersDispatch} = tournament;
    let {Tournament.roundList} = tourney;
    let (selectedMatch, setSelectedMatch) = React.useState(() => None);

    let unMatch = (matchId, round) => {
      switch (round->Rounds.Round.getMatchById(matchId)) {
      /* checks if the match has been scored yet & resets the players'
         records */
      | Some(match) when match.result !== NotSet =>
        [
          (match.whiteId, match.whiteOrigRating),
          (match.blackId, match.blackOrigRating),
        ]
        ->List.forEach(((id, rating)) =>
            switch (players->Map.String.get(id)) {
            /* If there was a dummy player or a deleted player then bail
               on the dispatch. */
            | None => ()
            | Some(player) =>
              playersDispatch(
                Set(
                  player.id,
                  {...player, rating, matchCount: player.matchCount - 1},
                ),
              )
            }
          )
      | None
      | Some(_) => ()
      };
      let newRound = round->Rounds.Round.removeMatchById(matchId);
      switch (roundList->Rounds.set(roundId, newRound)) {
      | Some(roundList) => setTourney({...tourney, roundList})
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
        ->Option.map(roundList => setTourney({...tourney, roundList}))
        ->ignore;
      | None => ()
      };
    };

    let moveMatch = (matchId, direction, round) => {
      switch (Rounds.Round.moveMatch(round, matchId, direction)) {
      | None => ()
      | Some(newRound) =>
        switch (Rounds.set(roundList, roundId, newRound)) {
        | Some(roundList) => setTourney({...tourney, roundList})
        | None => ()
        }
      };
    };

    switch (Rounds.get(tourney.roundList, roundId)) {
    | None => <Pages.NotFound />
    | Some(matches) =>
      <div className="content-area">
        <div className="toolbar">
          <button
            className="button-micro"
            disabled={selectedMatch === None}
            onClick={_ =>
              selectedMatch->Option.map(__x => unMatch(__x, matches))->ignore
            }>
            <Icons.Trash />
            {React.string(" Unmatch")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch === None}
            onClick={_ =>
              selectedMatch
              ->Option.map(__x => swapColors(__x, matches))
              ->ignore
            }>
            <Icons.Repeat />
            {React.string(" Swap colors")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch === None}
            onClick={_ =>
              selectedMatch
              ->Option.map(__x => moveMatch(__x, -1, matches))
              ->ignore
            }>
            <Icons.ArrowUp />
            {React.string(" Move up")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch === None}
            onClick={_ =>
              selectedMatch
              ->Option.map(__x => moveMatch(__x, 1, matches))
              ->ignore
            }>
            <Icons.ArrowDown />
            {React.string(" Move down")}
          </button>
        </div>
        {Rounds.Round.size(matches) === 0
           ? <p> {React.string("No players matched yet.")} </p> : React.null}
        <RoundTable
          roundId
          selectedMatch
          setSelectedMatch
          tournament
          scoreData
          matches={Rounds.Round.toArray(matches)}
        />
      </div>
    };
  };
};

module PageRound =
  HigherOrderComponents.WithRoundData({
    [@react.component]
    let make =
        (
          ~roundId,
          ~tournament,
          ~activePlayersCount,
          ~scoreData,
          ~unmatched,
          ~unmatchedCount,
          ~unmatchedWithDummy,
        ) => {
      let initialTab = unmatchedCount === activePlayersCount ? 1 : 0;
      let (openTab, setOpenTab) = React.useState(() => initialTab);
      /* Auto-switch the tab */
      React.useEffect3(
        () => {
          if (unmatchedCount === activePlayersCount) {
            setOpenTab(_ => 1);
          };
          if (unmatchedCount === 0) {
            setOpenTab(_ => 0);
          };
          None;
        },
        (unmatchedCount, activePlayersCount, setOpenTab),
      );
      Utils.Tabs.(
        <Tabs index=openTab onChange={index => setOpenTab(_ => index)}>
          <TabList>
            <Tab disabled={unmatchedCount === activePlayersCount}>
              <Icons.List />
              {React.string(" Matches")}
            </Tab>
            <Tab disabled={unmatchedCount === 0}>
              <Icons.Users />
              {[" Unmatched players (", Js.Int.toString(unmatchedCount), ")"]
               |> String.concat("")
               |> React.string}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel> <Round roundId tournament scoreData /> </TabPanel>
            <TabPanel>
              <div>
                {unmatchedCount !== 0
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
  });

[@react.component]
let make = (~roundId, ~tournament) => <PageRound roundId tournament />;