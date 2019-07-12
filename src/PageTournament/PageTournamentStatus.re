[@react.component]
let make = (~tournament: TournamentData.t) => {
  let tourney = tournament.tourney;
  let getPlayer = tournament.getPlayer;
  let lastRound =
    if (tourney.roundList |> Js.Array.length === 0) {
      <p> {"No rounds played yet." |> React.string} </p>;
    } else {
      let lastRoundId = (tourney.roundList |> Js.Array.length) - 1;
      if (tourney.roundList->Belt.Array.getUnsafe(lastRoundId)
          |> Js.Array.length === 0) {
        <p>
          {"Matched players in the current round will be shown here."
           |> React.string}
        </p>;
      } else {
        <PageRound.RoundTable roundId=lastRoundId tournament isCompact=true />;
      };
    };
  <>
    <h2 style={ReactDOMRe.Style.make(~textAlign="center", ())}>
      {"Tournament status" |> React.string}
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