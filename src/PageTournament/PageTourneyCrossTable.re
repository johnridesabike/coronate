[@react.component]
let make = (~tournament: TournamentData.t) => {
  let tourney = tournament.tourney;
  let getPlayer = tournament.getPlayer;
  let tieBreaks = tourney.tieBreaks;
  let roundList = tourney.roundList;
  let scoreData =
    Data.rounds2Matches(~roundList, ()) |> Converters.matches2ScoreData;
  let standings = Scoring.createStandingList(tieBreaks, scoreData);

  let getXScore = (player1Id, player2Id) =>
    if (player1Id === player2Id) {
      <Icons.x className="disabled" />;
    } else {
      switch (scoreData->Js.Dict.get(player1Id)) {
      | None => React.null
      | Some(scoreData) =>
        switch (scoreData.opponentResults->Js.Dict.get(player2Id)) {
        | None => React.null
        | Some(result) =>
          Utils.numeral(result)##format("1/2") |> React.string
        }
      };
    };

  let getRatingChangeTds = playerId => {
    let firstRating =
      scoreData->Js.Dict.unsafeGet(playerId).ratings[0] |> float_of_int;
    let lastRating =
      Utils.last(scoreData->Js.Dict.unsafeGet(playerId).ratings)
      |> float_of_int;
    let change = Utils.numeral(lastRating -. firstRating)##format("+0");
    <>
      <td className="table__number">
        {lastRating |> Js.Float.toString |> React.string}
      </td>
      <td className="table__number body-10"> {change |> React.string} </td>
    </>;
  };

  <table className="scores__table">
      <caption> {"Crosstable" |> React.string} </caption>
      <thead>
        <tr>
          <th> {"#" |> React.string} </th>
          <th> {"Name" |> React.string} </th>
          /* Display a rank as a shorthand for each player. */
          {standings
           |> Js.Array.mapi((_, rank) =>
                <th key={rank |> string_of_int}>
                  {rank + 1 |> string_of_int |> React.string}
                </th>
              )
           |> React.array}
          <th> {"Score" |> React.string} </th>
          <th colSpan=2> {"Rating" |> React.string} </th>
        </tr>
      </thead>
      <tbody>
        /* Output a row for each player */
        {standings
         |> Js.Array.mapi((standing: Scoring.standing, index) =>
              <tr key={index |> string_of_int} className="scores__row">
                <th className="scores__rank" scope="col">
                  {index + 1 |> string_of_int |> React.string}
                </th>
                <th className="scores__playerName" scope="row">
                  {getPlayer(standing.id).firstName |> React.string}
                  {Utils.Entities.nbsp |> React.string}
                  {getPlayer(standing.id).lastName |> React.string}
                </th>
                /* Output a cell for each other player */
                {standings
                 |> Js.Array.mapi((opponent: Scoring.standing, index2) =>
                      <td
                        key={index2 |> string_of_int}
                        className="table__number">
                        {getXScore(standing.id, opponent.id)}
                      </td>
                    )
                 |> React.array}
                /* Output their score and rating change */
                <td className="table__number">
                  {Utils.numeral(standing.score)##format("1/2")
                   |> React.string}
                </td>
                {getRatingChangeTds(standing.id)}
              </tr>
            )
         |> React.array}
      </tbody>
    </table>;
};