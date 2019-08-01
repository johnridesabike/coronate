open Belt;
open TournamentData;
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
        <dd> {score |> Js.Float.toString |> React.string} </dd>
        <dt> {React.string("Rating")} </dt>
        <dd ariaLabel={"Rating for " ++ fullName}> rating </dd>
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
        ~match,
        ~roundId,
        ~selectedMatch,
        ~setSelectedMatch,
        ~scoreData,
        ~tournament,
        ~className="",
      ) => {
    let {
      TournamentData.tourney,
      setTourney,
      players,
      getPlayer,
      playersDispatch,
    } = tournament;
    let (isModalOpen, setIsModalOpen) = React.useState(() => false);
    let whitePlayer = getPlayer(match.Match.whiteId);
    let blackPlayer = getPlayer(match.blackId);
    let isDummyRound =
      [|match.whiteId, match.blackId|]
      |> Js.Array.includes(Data.Player.dummy_id);

    let whiteName =
      [|whitePlayer.firstName, whitePlayer.lastName|]
      |> Js.Array.joinWith(" ");
    let blackName =
      [|blackPlayer.firstName, blackPlayer.lastName|]
      |> Js.Array.joinWith(" ");

    let resultDisplay = playerColor => {
      let won =
        <Icons.Award
          className=Css.(style([color(Utils.PhotonColors.yellow_70)]))
        />;
      let lost =
        <Utils.VisuallyHidden> {React.string("Lost")} </Utils.VisuallyHidden>;
      switch (match.result) {
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
      let result = Match.Result.fromString(jsResultCode);
      /* if it hasn't changed, then do nothing*/
      if (match.result !== result) {
        let white = players->Map.String.getExn(match.whiteId);
        let black = players->Map.String.getExn(match.blackId);
        let newWhiteScore = result->Match.Result.(toFloat(White));
        let newBlackScore = result->Match.Result.(toFloat(Black));
        let newRatings =
          switch (result) {
          | NotSet => (match.whiteOrigRating, match.blackOrigRating)
          | BlackWon
          | WhiteWon
          | Draw =>
            Scoring.Ratings.calcNewRatings(
              (match.whiteOrigRating, match.blackOrigRating),
              (white.matchCount, black.matchCount),
              (newWhiteScore, newBlackScore),
            )
          };
        let (whiteNewRating, blackNewRating) = newRatings;
        playersDispatch(Set(white.id, {...white, rating: whiteNewRating}));
        playersDispatch(Set(black.id, {...black, rating: blackNewRating}));
        switch (match.result) {
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
        | Draw when result === NotSet =>
          playersDispatch(
            Set(white.id, {...white, matchCount: white.matchCount - 1}),
          );
          playersDispatch(
            Set(black.id, {...black, matchCount: black.matchCount - 1}),
          );
        | WhiteWon
        | BlackWon
        | Draw => ()
        };
        setTourney({
          ...tourney,
          roundList:
            Match.setResult(
              ~matchId=match.id,
              ~result,
              ~roundId,
              ~roundList=tourney.roundList,
              ~newRatings,
            ),
        });
      };
    };
    let setMatchResultBlur = event => {
      setMatchResult(event->ReactEvent.Focus.target##value);
    };
    let setMatchResultChange = event => {
      setMatchResult(event->ReactEvent.Form.target##value);
    };
    <tr
      className={Cn.make([
        className,
        selectedMatch->Option.mapWithDefault("", x =>
          x
          ->Js.Nullable.toOption
          ->Option.mapWithDefault("", id =>
              match.id === id ? "selected" : "buttons-on-hover"
            )
        ),
      ])}>
      <th className={Cn.make([Style.rowId, "table__number"])} scope="row">
        {pos + 1 |> string_of_int |> React.string}
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
          value={Match.Result.toString(match.result)}
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
      {isCompact
         ? React.null
         : <td className={Cn.make([Style.controls, "data__input"])}>
             {selectedMatch->Option.mapWithDefault(React.null, x =>
                x
                ->Js.Nullable.toOption
                ->Option.mapWithDefault(true, id => id !== match.id)
                  ? <button
                      className="button-ghost"
                      title="Edit match"
                      onClick={_ =>
                        setSelectedMatch->Option.mapWithDefault((), x =>
                          x(_ => Js.Nullable.return(match.id))
                        )
                      }>
                      <Icons.Circle />
                      <Utils.VisuallyHidden>
                        {[|"Edit match for", whiteName, "versus", blackName|]
                         |> Js.Array.joinWith(" ")
                         |> React.string}
                      </Utils.VisuallyHidden>
                    </button>
                  : <button
                      className="button-ghost button-pressed"
                      title="End editing match"
                      onClick={_ =>
                        setSelectedMatch->Option.mapWithDefault((), x =>
                          x(_ => Js.Nullable.null)
                        )
                      }>
                      <Icons.CheckCircle />
                    </button>
              )}
             <button
               className="button-ghost"
               title="Open match information."
               onClick={_ => setIsModalOpen(_ => true)}>
               <Icons.Info />
               <Utils.VisuallyHidden>
                 {[|
                    "View information for match:",
                    whiteName,
                    "versus",
                    blackName,
                  |]
                  |> Js.Array.joinWith(" ")
                  |> React.string}
               </Utils.VisuallyHidden>
             </button>
             {switch (scoreData) {
              | None => React.null
              | Some(scoreData) =>
                <Utils.Dialog
                  isOpen=isModalOpen
                  onDismiss={_ => setIsModalOpen(_ => false)}>
                  <button
                    className="button-micro button-primary"
                    onClick={_ => setIsModalOpen(_ => false)}>
                    {React.string("close")}
                  </button>
                  <p> {React.string(tourney.name)} </p>
                  <p>
                    {[|
                       "Round ",
                       Js.Int.toString(roundId + 1),
                       " match ",
                       Js.Int.toString(pos + 1),
                     |]
                     |> Js.Array.joinWith(" ")
                     |> React.string}
                  </p>
                  <Utils.PanelContainer>
                    <Utils.Panel>
                      <PlayerMatchInfo
                        player={getPlayer(match.whiteId)}
                        origRating={match.whiteOrigRating}
                        newRating={Some(match.whiteNewRating)}
                        getPlayer
                        scoreData
                        players
                      />
                    </Utils.Panel>
                    <Utils.Panel>
                      <PlayerMatchInfo
                        player={getPlayer(match.blackId)}
                        origRating={match.blackOrigRating}
                        newRating={Some(match.blackNewRating)}
                        getPlayer
                        scoreData
                        players
                      />
                    </Utils.Panel>
                  </Utils.PanelContainer>
                </Utils.Dialog>
              }}
           </td>}
    </tr>;
  };
};

module RoundTable = {
  [@react.component]
  let make =
      (
        ~isCompact=false,
        ~roundId,
        ~selectedMatch=?,
        ~setSelectedMatch=?,
        ~tournament,
        ~scoreData=?,
      ) => {
    let tourney = tournament.tourney;
    let matchList = tourney.roundList->Array.getUnsafe(roundId);
    <table className=Style.table>
      {matchList |> Js.Array.length === 0
         ? React.null
         : <>
             <caption className={isCompact ? "title-30" : "title-40"}>
               {React.string("Round ")}
               {roundId + 1 |> Js.Int.toString |> React.string}
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
        {matchList
         |> Js.Array.mapi((match: Match.t, pos) =>
              <MatchRow
                key={match.id}
                isCompact
                match
                pos
                roundId
                selectedMatch
                setSelectedMatch
                scoreData
                tournament
                className=Style.td
              />
            )
         |> React.array}
      </tbody>
    </table>;
  };
};

let findById = (id, list) =>
  (list |> Js.Array.filter((x: Match.t) => x.id === id))->Array.getUnsafe(0);

module Round = {
  [@react.component]
  let make = (~roundId, ~tournament, ~scoreData) => {
    let {TournamentData.tourney, players, setTourney, playersDispatch} = tournament;
    let matchList = tourney.roundList->Array.get(roundId);
    let (selectedMatch, setSelectedMatch) =
      React.useState(() => Js.Nullable.null);

    let unMatch = (matchId, matchList) => {
      let match = findById(matchId, matchList);
      if (match.result !== NotSet) {
        /* checks if the match has been scored yet & resets the players'
           records */
        [|
          (match.whiteId, match.whiteOrigRating),
          (match.blackId, match.blackOrigRating),
        |]
        |> Js.Array.forEach(((id, rating)) =>
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
           );
      };
      /* I don't actually know if this copy is necessary */
      let roundList = tourney.roundList |> Js.Array.copy;
      roundList->Array.set(
        roundId,
        roundList->Array.getExn(roundId)
        |> Js.Array.filter((match: Match.t) => match.id !== matchId),
      )
      |> ignore;
      setTourney({...tourney, roundList});
      setSelectedMatch(_ => Js.Nullable.null);
    };

    let swapColors = matchId => {
      setTourney({
        ...tourney,
        roundList:
          Match.swapColors(~matchId, ~roundId, ~roundList=tourney.roundList),
      });
    };

    let moveMatch = (matchId, direction, matchList) => {
      let oldIndex =
        matchList |> Js.Array.indexOf(findById(matchId, matchList));
      let newIndex = oldIndex + direction >= 0 ? oldIndex + direction : 0;
      /* I don't actually know if this copy is necessary */
      let roundList = tourney.roundList |> Js.Array.copy;
      roundList->Array.set(
        roundId,
        roundList
        ->Array.getExn(roundId)
        ->Utils.Array.swap(oldIndex, newIndex),
      )
      |> ignore;
      setTourney({...tourney, roundList});
    };

    switch (matchList) {
    | None => <Pages.NotFound />
    | Some(matchList) =>
      <div className="content-area">
        <div className="toolbar">
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Option.map(x => unMatch(x, matchList))
              ->ignore
            }>
            <Icons.Trash />
            {React.string(" Unmatch")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Option.map(x => swapColors(x))
              ->ignore
            }>
            <Icons.Repeat />
            {React.string(" Swap colors")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Option.map(x => moveMatch(x, -1, matchList))
              ->ignore
            }>
            <Icons.ArrowUp />
            {React.string(" Move up")}
          </button>
          {React.string(" ")}
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Option.map(x => moveMatch(x, 1, matchList))
              ->ignore
            }>
            <Icons.ArrowDown />
            {React.string(" Move down")}
          </button>
        </div>
        {matchList |> Js.Array.length === 0
           ? <p> {React.string("No players matched yet.")} </p> : React.null}
        <RoundTable
          roundId
          selectedMatch
          setSelectedMatch
          tournament
          scoreData
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
              {[|
                 " Unmatched players (",
                 unmatchedCount |> Js.Int.toString,
                 ")",
               |]
               |> Js.Array.joinWith("")
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