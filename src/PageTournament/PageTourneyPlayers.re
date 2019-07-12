open TournamentDataReducers;

module Selecting = {
  [@react.component]
  let make = (~tourney: Data.Tournament.t, ~tourneyDispatch) => {
    let (players, allPlayersDispatch) = Hooks.Db.useAllPlayers();

    let togglePlayer = event => {
      let id = event->ReactEvent.Form.target##value;
      if (event->ReactEvent.Form.target##checked) {
        tourneyDispatch(
          SetTourneyPlayers(tourney.playerIds |> Js.Array.concat([|id|])),
        );
      } else {
        tourneyDispatch(
          SetTourneyPlayers(
            tourney.playerIds |> Js.Array.filter(pId => pId !== id),
          ),
        );
      };
    };

    <div>
      <div className="toolbar">
        <button
          className="button-micro"
          onClick={_ =>
            tourneyDispatch(
              SetTourneyPlayers(players |> Belt.Map.String.keysToArray),
            )
          }>
          {"Select all" |> React.string}
        </button>
        <button
          className="button-micro"
          onClick={_ => tourneyDispatch(SetTourneyPlayers([||]))}>
          {"Select none" |> React.string}
        </button>
      </div>
      <table>
        <caption> {"Select players" |> React.string} </caption>
        <thead>
          <tr>
            <th> {"First name" |> React.string} </th>
            <th> {"Last name" |> React.string} </th>
            <th> {"Select" |> React.string} </th>
          </tr>
        </thead>
        <tbody>
          {players
           |> Belt.Map.String.valuesToArray
           |> Js.Array.map((p: Data.Player.t) =>
                <tr key={p.id}>
                  <td> {p.firstName |> React.string} </td>
                  <td> {p.lastName |> React.string} </td>
                  <td>
                    <Utils.VisuallyHidden>
                      <label htmlFor={"select-" ++ p.id}>
                        {[|"Select", p.firstName, p.lastName|]
                         |> Js.Array.joinWith(" ")
                         |> React.string}
                      </label>
                    </Utils.VisuallyHidden>
                    <input
                      checked={tourney.playerIds |> Js.Array.includes(p.id)}
                      type_="checkbox"
                      value={p.id}
                      id={"select-" ++ p.id}
                      onChange=togglePlayer
                    />
                  </td>
                </tr>
              )
           |> React.array}
        </tbody>
      </table>
      <PagePlayers.NewPlayerForm dispatch=allPlayersDispatch />
    </div>;
  };
};

let hasHadBye = (matchList, playerId) => {
  Js.Array.(
    matchList
    |> filter((match: Data.Match.t) =>
         [|match.whiteId, match.blackId|] |> includes(playerId)
       )
    |> reduce(
         (acc, match: Data.Match.t) =>
           acc |> concat([|match.whiteId, match.blackId|]),
         [||],
       )
    |> includes(Data.dummy_id)
  );
};

module PlayerList = {
  [@react.component]
  let make = (~players, ~tourneyDispatch, ~byeQueue) => {
    <>
      {players
       |> Belt.Map.String.valuesToArray
       |> Js.Array.map((p: Data.Player.t) =>
            <tr key={p.id} className={Cn.make([p.type_, "player"])}>
              <td> {p.firstName |> React.string} </td>
              <td> {p.lastName |> React.string} </td>
              <td>
                <button
                  className="button-micro"
                  disabled={byeQueue |> Js.Array.includes(p.id)}
                  onClick={_ =>
                    tourneyDispatch(
                      SetByeQueue(byeQueue |> Js.Array.concat([|p.id|])),
                    )
                  }>
                  {"Bye signup" |> React.string}
                </button>
              </td>
            </tr>
          )
       |> React.array}
    </>;
  };
};

[@react.component]
let make = (~tournament: TournamentData.t) => {
  let tourney = tournament.tourney;
  let tourneyDispatch = tournament.tourneyDispatch;
  let activePlayers = tournament.activePlayers;
  let playerIds = tourney.playerIds;
  let roundList = tourney.roundList;
  let byeQueue = tourney.byeQueue;
  let (isSelecting, setIsSelecting) =
    React.useState(() => playerIds |> Js.Array.length === 0);
  let matches = Data.rounds2Matches(~roundList, ());
  <div className="content-area">
    <div className="toolbar">
      <button onClick={_ => setIsSelecting(_ => true)}>
        <Icons.edit />
        {" Edit player roster" |> React.string}
      </button>
    </div>
    <Utils.PanelContainer>
      <Utils.Panel style={ReactDOMRe.Style.make(~flexShrink="0", ())}>
        <table>
          <caption> {"Current roster" |> React.string} </caption>
          <thead>
            <tr>
              <th colSpan=2> {"Name" |> React.string} </th>
              <th> {"Options" |> React.string} </th>
            </tr>
          </thead>
          <tbody className="content">
            <PlayerList byeQueue tourneyDispatch players=activePlayers />
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <h3> {"Bye queue" |> React.string} </h3>
        {switch (byeQueue |> Js.Array.length) {
         | 0 =>
           <p>
             {"No players have signed up for a bye round." |> React.string}
           </p>
         | _ => React.null
         }}
        <ol>
          {byeQueue
           |> Js.Array.map(pId =>
                <li
                  key=pId
                  className={Cn.make([
                    "buttons-on-hover",
                    "disabled"->Cn.ifTrue(hasHadBye(matches, pId)),
                  ])}>
                  {Belt.Map.String.(
                     activePlayers->getExn(pId).firstName
                     ++ " "
                     ++ activePlayers->getExn(pId).lastName
                     ++ " "
                   )
                   |> React.string}
                  <button
                    className="button-micro"
                    onClick={_ =>
                      tourneyDispatch(
                        SetByeQueue(
                          byeQueue |> Js.Array.filter(id => pId !== id),
                        ),
                      )
                    }>
                    {"Remove" |> React.string}
                  </button>
                </li>
              )
           |> React.array}
        </ol>
      </Utils.Panel>
      <Utils.Dialog
        isOpen=isSelecting onDismiss={() => setIsSelecting(_ => false)}>
        <button
          className="button-micro button-primary"
          onClick={_ => setIsSelecting(_ => false)}>
          {"Done" |> React.string}
        </button>
        <Selecting tourney tourneyDispatch />
      </Utils.Dialog>
    </Utils.PanelContainer>
  </div>;
};