open Belt;
open TournamentDataReducers;
open TournamentData;

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
      (
        ~playerId,
        ~scoreData,
        ~origRating,
        ~newRating,
        ~getPlayer: string => Data.Player.t,
      ) => {
    let player = getPlayer(playerId);
    let (colorScores, opponentResults, results) =
      switch (scoreData->Map.String.get(playerId)) {
      | Some((data: Scoring.scoreData)) => (
          data.colorScores,
          data.opponentResults,
          data.results,
        )
      | None => ([], Map.String.empty, [])
      };
    let colorBalance = Utils.listSumFloat(colorScores);
    let hasBye =
      opponentResults
      |> Map.String.keysToArray
      |> Js.Array.includes(Data.dummy_id);
    let oppResultsEntries = opponentResults |> Map.String.toArray;
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
      <dt> {"Score" |> React.string} </dt>
      <dd>
        {results |> Utils.listSumFloat |> Js.Float.toString |> React.string}
      </dd>
      <dt> {"Rating" |> React.string} </dt>
      <dd id={"rating-" ++ playerId}>
        {origRating |> Js.Int.toString |> React.string}
        {" (" |> React.string}
        {float_of_int(newRating - origRating)
         ->Numeral.make
         ->Numeral.format("+0")
         |> React.string}
        {")" |> React.string}
      </dd>
      <dt> {"Color balance" |> React.string} </dt>
      <dd> {prettyBalance |> React.string} </dd>
      <dt> {"Has had a bye round" |> React.string} </dt>
      <dd> {(hasBye ? "Yes" : "No") |> React.string} </dd>
      <dt> {"Opponent history" |> React.string} </dt>
      <dd>
        <ol>
          {oppResultsEntries
           |> Js.Array.mapi(((opId, result), i)
                /* don't show the most recent (current) opponent*/
                =>
                  i < (oppResultsEntries |> Js.Array.length) - 1
                    ? <li key=opId>
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
                    : React.null
                )
           |> React.array}
        </ol>
      </dd>
    </dl>;
  };
};

[@bs.deriving jsConverter]
type resultCodes = [
  | [@bs.as "White"] `White
  | [@bs.as "Black"] `Black
  | [@bs.as "Draw"] `Draw
  | [@bs.as "NotSet"] `NotSet
];

module MatchRow = {
  [@react.component]
  let make =
      (
        ~isCompact=false,
        ~pos,
        ~match: Data.Match.t,
        ~roundId,
        ~selectedMatch,
        ~setSelectedMatch,
        ~scoreData,
        ~tournament,
        ~className="",
      ) => {
    let tourney = tournament.tourney;
    let tourneyDispatch = tournament.tourneyDispatch;
    let players = tournament.players;
    let getPlayer = tournament.getPlayer;
    let playersDispatch = tournament.playersDispatch;
    let (isModalOpen, setIsModalOpen) = React.useState(() => false);
    let resultCode =
      if (match.whiteScore > match.blackScore) {
        `White;
      } else if (match.blackScore > match.whiteScore) {
        `Black;
      } else if (match.whiteScore === 0.5 && match.blackScore === 0.5) {
        `Draw;
      } else {
        `NotSet;
      };
    let whitePlayer = getPlayer(match.whiteId);
    let blackPlayer = getPlayer(match.blackId);
    let isDummyRound =
      [|match.whiteId, match.blackId|] |> Js.Array.includes(Data.dummy_id);

    let whiteName =
      [|whitePlayer.firstName, whitePlayer.lastName|]
      |> Js.Array.joinWith(" ");
    let blackName =
      [|blackPlayer.firstName, blackPlayer.lastName|]
      |> Js.Array.joinWith(" ");

    let resultDisplay = color => {
      switch (resultCode) {
      | `NotSet =>
        <Utils.VisuallyHidden>
          {"Not set" |> React.string}
        </Utils.VisuallyHidden>
      | `Draw =>
        /* TODO: find a better icon for draws.*/
        <span
          ariaLabel="Draw"
          role="img"
          style={ReactDOMRe.Style.make(~filter="grayscale(100%)", ())}>
          {{js|🤝|js} |> React.string}
        </span>
      | wonOrLost =>
        wonOrLost === color
          ? <Icons.Award /*ariaLabel="Won"*/ />
          : <Utils.VisuallyHidden>
              {"Lost" |> React.string}
            </Utils.VisuallyHidden>
      };
    };

    let setMatchResult = jsResultCode => {
      let safeCode =
        switch (jsResultCode->resultCodesFromJs) {
        | Some(code) => code
        | None => `NotSet
        };
      let result =
        switch (safeCode) {
        | `White => (1.0, 0.0)
        | `Black => (0.0, 1.0)
        | `Draw => (0.5, 0.5)
        | `NotSet => (0.0, 0.0)
        };
      let (newWhiteScore, newBlackScore) = result;
      /* if it hasn't changed, then do nothing*/
      if (match.whiteScore !== newWhiteScore
          || match.blackScore !== newBlackScore) {
        let white = players->Belt.Map.String.getExn(match.whiteId);
        let black = players->Belt.Map.String.getExn(match.blackId);
        let newRatings =
          safeCode === `NotSet
            ? (match.whiteOrigRating, match.blackOrigRating)
            : Scoring.Ratings.calcNewRatings(
                (match.whiteOrigRating, match.blackOrigRating),
                (white.matchCount, black.matchCount),
                (newWhiteScore, newBlackScore),
              );
        let (whiteNewRating, blackNewRating) = newRatings;
        playersDispatch(SetRating(white.id, whiteNewRating));
        playersDispatch(SetRating(black.id, blackNewRating));
        /* if the result hasn't been scored yet, increment the matchCount*/
        if (match.whiteScore +. match.blackScore === 0.0) {
          playersDispatch(SetMatchCount(white.id, white.matchCount + 1));
          playersDispatch(SetMatchCount(black.id, black.matchCount + 1));
        };
        tourneyDispatch(
          SetMatchResult(match.id, newRatings, result, roundId),
        );
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
        selectedMatch->Belt.Option.mapWithDefault("", x =>
          x
          ->Js.Nullable.toOption
          ->Belt.Option.mapWithDefault("", id =>
              match.id === id ? "selected" : "buttons-on-hover"
            )
        ),
      ])}>
      <th className={Cn.make([Style.rowId, "table__number"])} scope="row">
        {pos + 1 |> string_of_int |> React.string}
      </th>
      <td className=Style.playerResult> {resultDisplay(`White)} </td>
      <td
        className={"table__player row__player " ++ whitePlayer.type_}
        id={"match-" ++ string_of_int(pos) ++ "-white"}>
        {whiteName |> React.string}
      </td>
      <td className=Style.playerResult> {resultDisplay(`Black)} </td>
      <td
        className={"table__player row__player " ++ blackPlayer.type_}
        id={"match-" ++ string_of_int(pos) ++ "-black"}>
        {blackName |> React.string}
      </td>
      <td
        className={Cn.make([Style.matchResult, "data__input row__controls"])}>
        <select
          className=Style.winnerSelect
          disabled=isDummyRound
          value={resultCode |> resultCodesToJs}
          onBlur=setMatchResultBlur
          onChange=setMatchResultChange>
          <option value={`NotSet |> resultCodesToJs}>
            {"Select winner" |> React.string}
          </option>
          <option value={`White |> resultCodesToJs}>
            {"White won" |> React.string}
          </option>
          <option value={`Black |> resultCodesToJs}>
            {"Black won" |> React.string}
          </option>
          <option value={`Draw |> resultCodesToJs}>
            {"Draw" |> React.string}
          </option>
        </select>
      </td>
      {isCompact
         ? React.null
         : <td className={Cn.make([Style.controls, "data__input"])}>
             {selectedMatch->Belt.Option.mapWithDefault(React.null, x =>
                x
                ->Js.Nullable.toOption
                ->Belt.Option.mapWithDefault(true, id => id !== match.id)
                  ? <button
                      className="button-ghost"
                      title="Edit match"
                      onClick={_ =>
                        setSelectedMatch->Belt.Option.mapWithDefault((), x =>
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
                        setSelectedMatch->Belt.Option.mapWithDefault((), x =>
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
                    {"close" |> React.string}
                  </button>
                  <p> {tourney.name |> React.string} </p>
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
                        playerId={match.whiteId}
                        origRating={match.whiteOrigRating}
                        newRating={match.whiteNewRating}
                        getPlayer
                        scoreData
                      />
                    </Utils.Panel>
                    <Utils.Panel>
                      <PlayerMatchInfo
                        playerId={match.blackId}
                        origRating={match.blackOrigRating}
                        newRating={match.blackNewRating}
                        getPlayer
                        scoreData
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
    let matchList = tourney.roundList->Belt.Array.getUnsafe(roundId);
    <table className=Style.table>
      {matchList |> Js.Array.length === 0
         ? React.null
         : <>
             <caption className={isCompact ? "title-30" : "title-40"}>
               {"Round " |> React.string}
               {roundId + 1 |> Js.Int.toString |> React.string}
               {" matches" |> React.string}
             </caption>
             <thead>
               <tr>
                 <th className=Style.rowId scope="col">
                   {"#" |> React.string}
                 </th>
                 <th scope="col">
                   <Utils.VisuallyHidden>
                     {"White result" |> React.string}
                   </Utils.VisuallyHidden>
                 </th>
                 <th className="row__player" scope="col">
                   {"White" |> React.string}
                 </th>
                 <th scope="col">
                   <Utils.VisuallyHidden>
                     {"Black result" |> React.string}
                   </Utils.VisuallyHidden>
                 </th>
                 <th className="row__player" scope="col">
                   {"Black" |> React.string}
                 </th>
                 <th className="row__result" scope="col">
                   {"Match result" |> React.string}
                 </th>
                 {isCompact
                    ? React.null
                    : <th className="row__controls" scope="col">
                        <Utils.VisuallyHidden>
                          {"Controls" |> React.string}
                        </Utils.VisuallyHidden>
                      </th>}
               </tr>
             </thead>
           </>}
      <tbody className="content">
        {matchList
         |> Js.Array.mapi((match: Data.Match.t, pos) =>
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
  (list |> Js.Array.filter((x: Data.Match.t) => x.id === id))
  ->Belt.Array.getUnsafe(0);

module Round = {
  [@react.component]
  let make = (~roundId, ~tournament, ~scoreData) => {
    let tourney = tournament.tourney;
    let players = tournament.players;
    let tourneyDispatch = tournament.tourneyDispatch;
    let playersDispatch = tournament.playersDispatch;
    let matchList = tourney.roundList->Belt.Array.get(roundId);
    let (selectedMatch, setSelectedMatch) =
      React.useState(() => Js.Nullable.null);

    let unMatch = (matchId, matchList) => {
      let match = findById(matchId, matchList);
      if (match.whiteScore +. match.blackScore !== 0.0) {
        /* checks if the match has been scored yet & resets the players'
           records */
        [|
          (match.whiteId, match.whiteOrigRating),
          (match.blackId, match.blackOrigRating),
        |]
        |> Js.Array.forEach(((id, rating)) =>
             switch (players->Belt.Map.String.get(id)) {
             /* If there was a dummy player or a deleted player then bail
                on the dispatch. */
             | None => ()
             | Some(player) =>
               playersDispatch(SetMatchCount(id, player.matchCount - 1));
               playersDispatch(SetRating(id, rating));
             }
           );
      };
      tourneyDispatch(DelMatch(matchId, roundId));
      setSelectedMatch(_ => Js.Nullable.null);
    };

    let swapColors = matchId => {
      tourneyDispatch(SwapColors(matchId, roundId));
    };

    let moveMatch = (matchId, direction, matchList) => {
      let oldIndex =
        matchList |> Js.Array.indexOf(findById(matchId, matchList));
      let newIndex = oldIndex + direction >= 0 ? oldIndex + direction : 0;
      tourneyDispatch(MoveMatch(oldIndex, newIndex, roundId));
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
              ->Belt.Option.map(x => unMatch(x, matchList))
              ->ignore
            }>
            <Icons.Trash />
            {" Unmatch" |> React.string}
          </button>
          {" " |> React.string}
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Belt.Option.map(x => swapColors(x))
              ->ignore
            }>
            <Icons.Repeat />
            {" Swap colors" |> React.string}
          </button>
          {" " |> React.string}
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Belt.Option.map(x => moveMatch(x, -1, matchList))
              ->ignore
            }>
            <Icons.ArrowUp />
            {" Move up" |> React.string}
          </button>
          {" " |> React.string}
          <button
            className="button-micro"
            disabled={selectedMatch === Js.Nullable.null}
            onClick={_ =>
              selectedMatch
              ->Js.Nullable.toOption
              ->Belt.Option.map(x => moveMatch(x, 1, matchList))
              ->ignore
            }>
            <Icons.ArrowDown />
            {" Move down" |> React.string}
          </button>
        </div>
        {matchList |> Js.Array.length === 0
           ? <p> {"No players matched yet." |> React.string} </p> : React.null}
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

/* I extracted this logic to its own module so it could be easily
   reused (e.g. in testing). It may have also made the whole component tree more
   complicated, though. */
module type UsesRoundData = {
  [@react.component]
  let make:
    (
      ~roundId: int,
      ~tournament: TournamentData.t,
      ~activePlayersCount: int,
      ~scoreData: Map.String.t(Scoring.scoreData),
      ~unmatched: Map.String.t(Data.Player.t),
      ~unmatchedCount: int,
      ~unmatchedWithDummy: Map.String.t(Data.Player.t)
    ) =>
    React.element;
};
module WithRoundData = (BaseComponent: UsesRoundData) => {
  [@react.component]
  let make = (~roundId, ~tournament) => {
    let {
      TournamentData.tourney,
      TournamentData.activePlayers,
      TournamentData.getPlayer,
    } = tournament;
    let {Data.Tournament.roundList} = tourney;
    /* matches2ScoreData is relatively expensive*/
    let scoreData =
      React.useMemo1(
        () =>
          Data.Converters.matches2ScoreData(
            Data.rounds2Matches(~roundList, ()),
          ),
        [|roundList|],
      );
    /* Only calculate unmatched players for the latest round. Old rounds
       don't get to add new players.
       Should this be memoized?
       only use unmatched players if this is the last round. */
    let unmatched =
      roundId === (roundList |> Js.Array.length) - 1
        ? Data.getUnmatched(roundList, activePlayers, roundId)
        : Map.String.empty;
    let unmatchedCount =
      unmatched |> Map.String.keysToArray |> Js.Array.length;
    /* make a new list so as not to affect auto-pairing*/
    /* TODO: replace these dicts with a better data type */
    let unmatchedWithDummy =
      unmatchedCount mod 2 !== 0
        ? unmatched->Map.String.set(Data.dummy_id, getPlayer(Data.dummy_id))
        : unmatched;
    let activePlayersCount =
      activePlayers |> Belt.Map.String.keysToArray |> Js.Array.length;
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

module PageRoundBase = {
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
            {" Matches" |> React.string}
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
};

module PageRound = WithRoundData(PageRoundBase);
[@react.component]
let make = (~roundId, ~tournament) => <PageRound roundId tournament />;