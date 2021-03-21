open Data
open Belt
module Id = Data.Id

module Selecting = {
  @react.component
  let make = (~tourney: Tournament.t, ~setTourney, ~players, ~playersDispatch) => {
    let {playerIds, _} = tourney
    let togglePlayer = event => {
      let id = ReactEvent.Form.target(event)["value"]
      if ReactEvent.Form.target(event)["checked"] {
        setTourney({...tourney, playerIds: Set.add(playerIds, id)})
      } else {
        setTourney({
          ...tourney,
          playerIds: Set.keep(playerIds, pId => !Id.eq(pId, id)),
        })
      }
    }

    <div>
      <div className="toolbar">
        <button
          className="button-micro"
          onClick={_ =>
            setTourney({
              ...tourney,
              playerIds: players->Map.keysToArray->Set.fromArray(~id=Id.id),
            })}>
          {React.string("Select all")}
        </button>
        <button
          className="button-micro"
          onClick={_ => setTourney({...tourney, playerIds: Set.make(~id=Id.id)})}>
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
          ->Map.valuesToArray
          ->Array.map(({Player.id: id, firstName, lastName, _}) =>
            <tr key={id->Data.Id.toString}>
              <td> {React.string(firstName)} </td>
              <td> {React.string(lastName)} </td>
              <td>
                <Externals.VisuallyHidden>
                  <label htmlFor={"select-" ++ id->Data.Id.toString}>
                    {`Select ${firstName} ${lastName}`->React.string}
                  </label>
                </Externals.VisuallyHidden>
                <input
                  checked={Set.has(playerIds, id)}
                  type_="checkbox"
                  value={id->Data.Id.toString}
                  id={"select-" ++ id->Data.Id.toString}
                  onChange=togglePlayer
                />
              </td>
            </tr>
          )
          ->React.array}
        </tbody>
      </table>
      <PagePlayers.NewPlayerForm
        dispatch=playersDispatch
        addPlayerCallback={id => setTourney({...tourney, playerIds: Set.add(playerIds, id)})}
      />
    </div>
  }
}

let hasHadBye = (matches, playerId) =>
  matches
  ->MutableQueue.toArray
  ->Array.keep((match: Match.t) => Id.eq(match.whiteId, playerId) || Id.eq(match.blackId, playerId))
  ->Array.some(match => Id.isDummy(match.whiteId) || Id.isDummy(match.blackId))

module OptionsForm = {
  let errorNotification = x =>
    switch x {
    | Some(Error(e)) => <Utils.Notification kind=Error> {e->React.string} </Utils.Notification>
    | Some(Ok(_))
    | None => React.null
    }

  module Form = %form(
    type input = {scoreAdjustment: string}
    type output = {scoreAdjustment: float}
    let validators = {
      scoreAdjustment: {
        strategy: OnFirstSuccessOrFirstBlur,
        validate: input =>
          switch Float.fromString(input.scoreAdjustment) {
          | None => Error("Score adjustment must be a number.")
          | Some(x) => Ok(x)
          },
      },
    }
  )

  module More = {
    @react.component
    let make = (
      ~setTourney,
      ~dialog: Hooks.boolState,
      ~tourney: Data.Tournament.t,
      ~p: Data.Player.t,
    ) => {
      let scoreAdjustment =
        Map.get(tourney.scoreAdjustments, p.id)->Option.mapWithDefault("0", Float.toString)
      let form = Form.useForm(~initialInput={scoreAdjustment: scoreAdjustment}, ~onSubmit=(
        output,
        callback,
      ) => {
        switch output {
        | {scoreAdjustment: 0.} =>
          setTourney({
            ...tourney,
            scoreAdjustments: Map.remove(tourney.scoreAdjustments, p.id),
          })
        | {scoreAdjustment} =>
          setTourney({
            ...tourney,
            scoreAdjustments: Map.set(tourney.scoreAdjustments, p.id, scoreAdjustment),
          })
        }
        callback.notifyOnSuccess(None)
        dialog.setFalse()
      })
      <>
        <button className="button-micro button-primary" onClick={_ => dialog.setFalse()}>
          {React.string("close")}
        </button>
        <h2> {`Options for ${p.firstName} ${p.lastName}`->React.string} </h2>
        <form
          onSubmit={event => {
            ReactEvent.Form.preventDefault(event)
            form.submit()
          }}>
          <h3>
            <label className="title-30" htmlFor={Data.Id.toString(p.id) ++ "-scoreAdjustment"}>
              {"Score adjustment"->React.string}
            </label>
          </h3>
          <p className="caption-30" id={Data.Id.toString(p.id) ++ "-scoreAdjustment-description"}>
            {`Score adjustment will be added to this player's actual score.
              It can be negative.`->React.string}
          </p>
          <p>
            <input
              type_="number"
              size=3
              step=0.5
              id={Data.Id.toString(p.id) ++ "-scoreAdjustment"}
              ariaDescribedby={Data.Id.toString(p.id) ++ "-scoreAdjustment-description"}
              value=form.input.scoreAdjustment
              disabled=form.submitting
              onBlur={_ => form.blurScoreAdjustment()}
              onChange={event =>
                form.updateScoreAdjustment(
                  (_input, value) => {scoreAdjustment: value},
                  (event->ReactEvent.Form.target)["value"],
                )}
            />
            {" "->React.string}
            <button
              className="button-micro"
              onClick={event => {
                ReactEvent.Mouse.preventDefault(event)
                form.updateScoreAdjustment((_input, value) => {scoreAdjustment: value}, "0")
              }}>
              {"Reset"->React.string}
            </button>
          </p>
          {errorNotification(form.scoreAdjustmentResult)}
          <p> <input type_="submit" value="Save" disabled={form.submitting || !form.valid()} /> </p>
        </form>
      </>
    }
  }

  @react.component
  let make = (~setTourney, ~tourney: Tournament.t, ~byeQueue, ~p: Player.t) => {
    let dialog = Hooks.useBool(false)
    <>
      <button
        className="button-micro"
        disabled={Js.Array2.includes(byeQueue, p.id)}
        onClick={_ =>
          setTourney({
            ...tourney,
            byeQueue: Array.concat(byeQueue, [p.id]),
          })}>
        {"Bye signup"->React.string}
      </button>
      {" "->React.string}
      <button className="button-micro" onClick={_ => dialog.setTrue()}>
        <span ariaHidden=true> <Icons.More /> </span>
        <Externals.VisuallyHidden>
          {`More options for ${p.firstName} ${p.lastName}`->React.string}
        </Externals.VisuallyHidden>
      </button>
      <Externals.Dialog
        isOpen=dialog.state
        onDismiss=dialog.setFalse
        ariaLabel={`Options for ${p.firstName} ${p.lastName}`}>
        <More setTourney dialog tourney p />
      </Externals.Dialog>
    </>
  }
}

module PlayerList = {
  @react.component
  let make = (~players: Id.Map.t<Player.t>, ~tourney, ~setTourney, ~byeQueue) => <>
    {players
    ->Map.valuesToArray
    ->Array.map(p =>
      <tr
        key={p.id->Data.Id.toString} className={Cn.append(Player.Type.toString(p.type_), "player")}>
        <td> {React.string(p.firstName)} </td>
        <td> {React.string(p.lastName)} </td>
        <td> <OptionsForm setTourney tourney byeQueue p /> </td>
      </tr>
    )
    ->React.array}
  </>
}

@react.component
let make = (~tournament: LoadTournament.t) => {
  let {tourney, setTourney, players, activePlayers, playersDispatch, getPlayer, _} = tournament
  let {playerIds, roundList, byeQueue, _} = tourney
  let (isSelecting, setIsSelecting) = React.useState(() => Set.isEmpty(playerIds))
  let matches = Rounds.rounds2Matches(roundList)
  <div className="content-area">
    <div className="toolbar">
      <button onClick={_ => setIsSelecting(_ => true)}>
        <Icons.Edit /> {React.string(" Edit player roster")}
      </button>
    </div>
    <Utils.PanelContainer>
      <Utils.Panel style={ReactDOMRe.Style.make(~flexShrink="0", ())}>
        <table>
          <caption> {React.string("Current roster")} </caption>
          <thead>
            <tr>
              <th colSpan=2> {React.string("Name")} </th> <th> {React.string("Options")} </th>
            </tr>
          </thead>
          <tbody className="content">
            <PlayerList byeQueue setTourney tourney players=activePlayers />
          </tbody>
        </table>
      </Utils.Panel>
      <Utils.Panel>
        <h3> {React.string("Bye queue")} </h3>
        {if Js.Array.length(byeQueue) == 0 {
          <p> {React.string("No players have signed up for a bye round.")} </p>
        } else {
          React.null
        }}
        <ol>
          {Array.map(byeQueue, pId =>
            <li
              key={pId->Data.Id.toString}
              className={Cn.append("buttons-on-hover", "disabled"->Cn.on(hasHadBye(matches, pId)))}>
              {React.string(getPlayer(pId).firstName ++ " " ++ getPlayer(pId).firstName)}
              {React.string(" ")}
              <button
                className="button-micro"
                onClick={_ =>
                  setTourney({
                    ...tourney,
                    byeQueue: Js.Array2.filter(byeQueue, id => !Id.eq(pId, id)),
                  })}>
                {React.string("Remove")}
              </button>
            </li>
          )->React.array}
        </ol>
      </Utils.Panel>
      <Externals.Dialog
        isOpen=isSelecting onDismiss={() => setIsSelecting(_ => false)} ariaLabel="Select players">
        <button className="button-micro button-primary" onClick={_ => setIsSelecting(_ => false)}>
          {React.string("Done")}
        </button>
        <Selecting tourney setTourney players playersDispatch />
      </Externals.Dialog>
    </Utils.PanelContainer>
  </div>
}
