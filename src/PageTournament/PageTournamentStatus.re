open Data;

[@react.component]
let make = (~tournament) => {
  let LoadTournament.{tourney, getPlayer, _} = tournament;
  let Tournament.{roundList, _} = tourney;
  let lastRoundId = Rounds.getLastKey(tourney.Tournament.roundList);
  let lastRound = Rounds.get(roundList, lastRoundId);
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
           if (Rounds.Round.size(matches) == 0) {
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
               matches={Rounds.Round.toArray(matches)}
             />;
           }
         }}
      </Utils.Panel>
      <Utils.Panel>
        <PageTourneyScores.ScoreTable
          getPlayer
          title="Rankings"
          tourney
          size=Compact
        />
      </Utils.Panel>
    </Utils.PanelContainer>
  </>;
};
