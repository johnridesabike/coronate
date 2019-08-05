open Belt;
open Data;

module Selecting = {
  [@react.component]
  let make = (~tourney, ~setTourney) => {
    let (players, allPlayersDispatch) = Db.useAllPlayers();

    let togglePlayer = event => {
      let id = event->ReactEvent.Form.target##value;
      if (event->ReactEvent.Form.target##checked) {
        setTourney(
          Tournament.{
            ...tourney,
            playerIds: tourney.playerIds |> Js.Array.concat([|id|]),
          },
        );
      } else {
        setTourney({
          ...tourney,
          playerIds: tourney.playerIds |> Js.Array.filter(pId => pId !== id),
        });
      };
    };

    <div>
      <div className="toolbar">
        <button
          className="button-micro"
          onClick={_ =>
            setTourney({
              ...tourney,
              playerIds: players |> Map.String.keysToArray,
            })
          }>
          {React.string("Select all")}
        </button>
        <button
          className="button-micro"
          onClick={_ => setTourney({...tourney, playerIds: [||]})}>
          {React.string("Select none")}
        </button>
      </div>
      <table>
        <caption> {React.string("Select players")} </caption>
        <thead>
          <tr>
            <th> {React.string("First name")} </th>
            <th> {React.string("Last name")} </th>
            <th> {React.string("Select")} </th>
          </tr>
        </thead>
        <tbody>
          {players
           |> Map.String.valuesToArray
           |> Js.Array.map(p =>
                <tr key={p.Player.id}>
                  <td> {React.string(p.firstName)} </td>
                  <td> {React.string(p.lastName)} </td>
                  <td>
                    <Utils.VisuallyHidden>
                      <label htmlFor={"select-" ++ p.id}>
                        {["Select", p.firstName, p.lastName]
                         |> String.concat(" ")
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
    |> filter((match: Match.t) =>
         [|match.whiteId, match.blackId|] |> includes(playerId)
       )
    |> reduce(
         (acc, match: Match.t) =>
           acc |> concat([|match.whiteId, match.blackId|]),
         [||],
       )
    |> includes(Data.Player.dummy_id)
  );
};

module PlayerList = {
  [@react.component]
  let make = (~players, ~tourney, ~setTourney, ~byeQueue) => {
    <>
      {players
       |> Map.String.valuesToArray
       |> Js.Array.map(p =>
            <tr
              key={p.Player.id}
              className={Cn.make([Player.Type.toString(p.type_), "player"])}>
              <td> {React.string(p.firstName)} </td>
              <td> {React.string(p.lastName)} </td>
              <td>
                <button
                  className="button-micro"
                  disabled={byeQueue |> Js.Array.includes(p.id)}
                  onClick={_ =>
                    setTourney(
                      Tournament.{
                        ...tourney,
                        byeQueue: byeQueue |> Js.Array.concat([|p.id|]),
                      },
                    )
                  }>
                  {React.string("Bye signup")}
                </button>
              </td>
            </tr>
          )
       |> React.array}
    </>;
  };
};

[@react.component]
let make = (~tournament) => {
  let {
    TournamentData.tourney,
    TournamentData.setTourney,
    TournamentData.activePlayers,
  } = tournament;
  let {Tournament.playerIds, Tournament.roundList, Tournament.byeQueue} = tourney;
  let (isSelecting, setIsSelecting) =
    React.useState(() => playerIds |> Js.Array.length === 0);
  let matches = Rounds.rounds2Matches(~roundList, ());
  <div className="content-area">
    <div className="toolbar">
      <button onClick={_ => setIsSelecting(_ => true)}>
        <Icons.Edit />
        {React.string(" Edit player roster")}
      </button>
    </div>
    <Utils.PanelContainer>
      <Utils.Panel style={ReactDOMRe.Style.make(~flexShrink="0", ())}>
        <table>
          <caption> {React.string("Current roster")} </caption>
          <thead>
            <tr>
              <th colSpan=2> {React.string("Name")} </th>
              <th> {React.string("Options")} </th>
            </tr>
          </thead>
          <tbody className="content">
            <PlayerList
              byeQueue
              setTourney
              tourney
              players=activePlayers
            />
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <h3> {React.string("Bye queue")} </h3>
        {if (Js.Array.length(byeQueue) === 0) {
           <p>
             {React.string("No players have signed up for a bye round.")}
           </p>;
         } else {
           React.null;
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
                  {[
                     activePlayers->Map.String.getExn(pId).firstName,
                     activePlayers->Map.String.getExn(pId).lastName,
                   ]
                   |> String.concat(" ")
                   |> React.string}
                  <button
                    className="button-micro"
                    onClick={_ =>
                      setTourney({
                        ...tourney,
                        byeQueue:
                          byeQueue |> Js.Array.filter(id => pId !== id),
                      })
                    }>
                    {React.string("Remove")}
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
          {React.string("Done")}
        </button>
        <Selecting tourney setTourney />
      </Utils.Dialog>
    </Utils.PanelContainer>
  </div>;
};