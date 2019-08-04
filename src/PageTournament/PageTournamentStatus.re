open Data;

[@react.component]
let make = (~tournament) => {
  let {TournamentData.tourney, TournamentData.getPlayer} = tournament;
  let {Tournament.roundList} = tourney;
  let lastRoundId = Rounds.getLastKey(tourney.roundList);
  let lastRound = roundList->Rounds.get(lastRoundId);
  <>
    <h2 style={ReactDOMRe.Style.make(~textAlign="center", ())}>
      {React.string("Tournament status")}
    </h2>
    <Utils.PanelContainer
      style={ReactDOMRe.Style.make(~justifyContent="center", ())}>
      <Utils.Panel>
        {switch (lastRound) {
         | None => <p> {React.string("No rounds played yet.")} </p>
         | Some(matches) =>
           if (Js.Array.length(matches) === 0) {
             <p>
               {React.string(
                  "Matched players in the current round will be shown here.",
                )}
             </p>;
           } else {
             <PageRound.RoundTable
               roundId=lastRoundId
               tournament
               isCompact=true
               matches
             />;
           }
         }}
      </Utils.Panel>
      <Utils.Panel>
        <PageTourneyScores.ScoreTable
          getPlayer
          title="Rankings"
          tourney
          isCompact=true
        />
      </Utils.Panel>
    </Utils.PanelContainer>
  </>;
};