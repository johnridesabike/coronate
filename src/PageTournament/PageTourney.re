open Utils.Router;
open TournamentData;
module Footer = {
  [@react.component]
  let make = (~tournament) => {
    let {roundCount, tourney, isItOver, isNewRoundReady} = tournament;
    let roundList = tourney.roundList;
    let (tooltipText, tooltipKind) =
      if (!isNewRoundReady) {
        (Utils.Entities.nbsp ++ "Round in progress.", Utils.Generic);
      } else if (isItOver) {
        (Utils.Entities.nbsp ++ " All rounds have completed.", Utils.Warning);
      } else {
        (
          Utils.Entities.nbsp ++ " Ready to begin a new round.",
          Utils.Success,
        );
      };
    ReactDOMRe.(
      <>
        <label
          className="win__footer-block"
          style={Style.make(~display="inline-block", ())}>
          {"Rounds: " |> React.string}
          {roundList |> Js.Array.length |> string_of_int |> React.string}
          <small> {" out of " |> React.string} </small>
          {roundCount |> string_of_int |> React.string}
        </label>
        <hr className="win__footer-divider" />
        <Utils.Notification
          kind=tooltipKind
          tooltip=tooltipText
          className="win__footer-block"
          style={Style.make(
            ~backgroundColor="transparent",
            ~color="initial",
            ~display="inline-flex",
            ~margin="0",
            ~minHeight="initial",
            (),
          )}>
          {tooltipText |> React.string}
        </Utils.Notification>
      </>
    );
  };
};

let footerFunc = (tournament, ()) => <Footer tournament />;

let noDraggy = e => ReactEvent.Mouse.preventDefault(e);

module Sidebar = {
  [@react.component]
  let make = (~tournament) => {
    let {
      tourney,
      isItOver,
      isNewRoundReady,
      getPlayer,
      activePlayers,
      playersDispatch,
      tourneyDispatch,
    } = tournament;
    let roundList = tourney.roundList;
    let isComplete = Data.isRoundComplete(roundList, activePlayers);
    let basePath = "/tourneys/" ++ tourney.id;
    let newRound = event => {
      event->ReactEvent.Mouse.preventDefault;
      let confirmText =
        "All rounds have completed. Are you sure you want to begin a new "
        ++ "one?";
      if (isItOver) {
        if (Utils.confirm(confirmText)) {
          tourneyDispatch(AddRound);
        };
      } else {
        tourneyDispatch(AddRound);
      };
    };

    let delLastRound = event => {
      event->ReactEvent.Mouse.preventDefault;
      if (Utils.confirm("Are you sure you want to delete the last round?")) {
        ReasonReactRouter.push("#/tourneys/" ++ tourney.id);
        /* If a match has been scored, then reset it.
           Should this logic be somewhere else? */
        roundList
        |> Utils.last
        |> Js.Array.forEach((match: Data.Match.t) => {
             /* Don't change players who haven't scored.*/
             let whiteScore = match.whiteScore;
             let blackScore = match.blackScore;
             let whiteId = match.whiteId;
             let blackId = match.blackId;
             let whiteOrigRating = match.whiteOrigRating;
             let blackOrigRating = match.blackOrigRating;
             if (whiteScore +. blackScore !== 0.0) {
               [|(whiteId, whiteOrigRating), (blackId, blackOrigRating)|]
               |> Js.Array.forEach(((id, rating)) =>
                    if (id !== Data.dummy_id) {
                      /* Don't try to set the dummy */
                      let matchCount = getPlayer(id).matchCount;
                      playersDispatch(SetMatchCount(id, matchCount - 1));
                      playersDispatch(SetRating(id, rating));
                    }
                  );
             };
           });
        tourneyDispatch(DelLastRound);
        if (roundList |> Js.Array.length === 1) {
          /* Automatically remake round 1.*/
          tourneyDispatch(AddRound);
        };
      };
    };
    <div>
      <nav>
        <ul style={ReactDOMRe.Style.make(~marginTop="0", ())}>
          <li>
            <HashLink to_="/tourneys" onDragStart=noDraggy>
              <Icons.ChevronLeft />
              <span className="sidebar__hide-on-close">
                {" Back" |> React.string}
              </span>
            </HashLink>
          </li>
        </ul>
        <hr />
        <ul>
          <li>
            <HashLink to_={basePath ++ "/setup"} onDragStart=noDraggy>
              <Icons.Settings />
              <span className="sidebar__hide-on-close">
                {" Setup" |> React.string}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_=basePath onDragStart=noDraggy>
              <Icons.Users />
              <span className="sidebar__hide-on-close">
                {" Players" |> React.string}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_={basePath ++ "/status"} onDragStart=noDraggy>
              <Icons.Activity />
              <span className="sidebar__hide-on-close">
                {" Status" |> React.string}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_={basePath ++ "/crosstable"} onDragStart=noDraggy>
              <Icons.Layers />
              <span className="sidebar__hide-on-close">
                {" Crosstable" |> React.string}
              </span>
            </HashLink>
          </li>
          <li>
            <HashLink to_={basePath ++ "/scores"} onDragStart=noDraggy>
              <Icons.List />
              <span className="sidebar__hide-on-close">
                {" Score detail" |> React.string}
              </span>
            </HashLink>
          </li>
        </ul>
        <hr />
        <h5 className="sidebar__hide-on-close sidebar__header">
          {"Rounds" |> React.string}
        </h5>
        <ul className="center-on-close">
          {roundList
           |> Js.Array.mapi((_, id) =>
                <li key={id |> string_of_int}>
                  <HashLink
                    to_={basePath ++ "/round/" ++ string_of_int(id)}
                    onDragStart=noDraggy>
                    {id + 1 |> string_of_int |> React.string}
                    {id |> isComplete
                       ? <span
                           className={Cn.make([
                             "sidebar__hide-on-close",
                             "caption-20",
                           ])}>
                           {" Complete " |> React.string}
                           <Icons.Check />
                         </span>
                       : <span
                           className={Cn.make([
                             "sidebar__hide-on-close",
                             "caption-20",
                           ])}>
                           {" Not complete " |> React.string}
                           <Icons.Alert />
                         </span>}
                  </HashLink>
                </li>
              )
           |> React.array}
        </ul>
      </nav>
      <hr />
      <ul>
        <li>
          <button
            className="sidebar-button"
            disabled={!isNewRoundReady}
            onClick=newRound
            style={ReactDOMRe.Style.make(~width="100%", ())}>
            <Icons.Plus />
            <span className="sidebar__hide-on-close">
              {" New round" |> React.string}
            </span>
          </button>
        </li>
        <li style={ReactDOMRe.Style.make(~textAlign="center", ())}>
          <button
            disabled={roundList |> Js.Array.length === 0}
            onClick=delLastRound
            className="button-micro sidebar-button"
            style={ReactDOMRe.Style.make(~marginTop="8px", ())}>
            <Icons.Trash />
            <span className="sidebar__hide-on-close">
              {" Remove last round" |> React.string}
            </span>
          </button>
        </li>
      </ul>
    </div>;
  };
};

let sidebarFunc = (tournament, ()) => <Sidebar tournament />;

[@react.component]
let make = (~tourneyId, ~hashPath) => {
  <TournamentData tourneyId>
    {tournament =>
       <Window.Body
         footerFunc={footerFunc(tournament)}
         sidebarFunc={sidebarFunc(tournament)}>
         {switch (hashPath) {
          | [""] => <PageTourneyPlayers tournament />
          | ["scores"] => <PageTourneyScores tournament />
          | ["crosstable"] => <PageTourneyScores.Crosstable tournament />
          | ["setup"] => <PageTourneySetup tournament />
          | ["status"] => <PageTournamentStatus tournament />
          | ["round", roundId] =>
            <PageRound tournament roundId={roundId |> int_of_string} />
          | _ => <Pages.NotFound />
          }}
       </Window.Body>}
  </TournamentData>;
};