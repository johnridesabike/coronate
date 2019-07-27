open Belt;
[@react.component]
let make = (~tournament) => {
  let {TournamentData.tourney, TournamentData.getPlayer} = tournament;
  let lastRound =
    if (tourney.roundList |> Js.Array.length === 0) {
      <p> {React.string("No rounds played yet.")} </p>;
    } else {
      let lastRoundId = (tourney.roundList |> Js.Array.length) - 1;
      if (tourney.roundList->Array.getExn(lastRoundId)->Js.Array.length === 0) {
        <p>
          {React.string(
             "Matched players in the current round will be shown here.",
           )}
        </p>;
      } else {
        <PageRound.RoundTable roundId=lastRoundId tournament isCompact=true />;
      };
    };
  <>
    <h2 style={ReactDOMRe.Style.make(~textAlign="center", ())}>
      {React.string("Tournament status")}
    </h2>
    <Utils.PanelContainer
      style={ReactDOMRe.Style.make(~justifyContent="center", ())}>
      <Utils.Panel> lastRound </Utils.Panel>
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