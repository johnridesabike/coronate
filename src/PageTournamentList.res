/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
open Belt
open Router
open Data.Tournament

/* These can't be definined inline or the comparisons don't work. */
let dateSort = Hooks.GetDate((. x) => x.date)
let nameSort = Hooks.GetString((. x) => x.name)

@react.component
let make = (~windowDispatch=_ => ()) => {
  let {items: tourneys, dispatch, _} = Db.useAllTournaments()
  let (sorted, sortDispatch) = Hooks.useSortedTable(
    ~table=Map.valuesToArray(tourneys),
    ~column=dateSort,
    ~isDescending=true,
  )
  let (newTourneyName, setNewTourneyName) = React.useState(() => "")
  let dialog = Hooks.useBool(false)
  React.useEffect1(() => {
    windowDispatch(Window.SetTitle("Tournament list"))
    Some(() => windowDispatch(Window.SetTitle("")))
  }, [windowDispatch])
  React.useEffect2(() => {
    sortDispatch(Hooks.SetTable(Map.valuesToArray(tourneys)))
    None
  }, (tourneys, sortDispatch))

  let updateNewName = event => setNewTourneyName(ReactEvent.Form.currentTarget(event)["value"])
  let makeTournament = event => {
    ReactEvent.Form.preventDefault(event)
    let id = Data.Id.random()
    dispatch(Set(id, Data.Tournament.make(~id, ~name=newTourneyName)))
    setNewTourneyName(_ => "")
    dialog.setFalse()
  }
  let deleteTournament = (id, name) => {
    let message = j`Are you sure you want to delete “$name”?`
    if Webapi.Dom.Window.confirm(message, Webapi.Dom.window) {
      dispatch(Del(id))
    }
  }
  <Window.Body windowDispatch>
    <div className="content-area">
      <div className="toolbar toolbar__left">
        <button onClick={_ => dialog.setTrue()}>
          <Icons.Plus /> {React.string(" Add tournament")}
        </button>
      </div>
      {Map.isEmpty(tourneys)
        ? <p> {React.string("No tournaments are added yet.")} </p>
        : <table>
            <caption> {React.string("Tournament list")} </caption>
            <thead>
              <tr>
                <th>
                  <Hooks.SortButton data=sorted dispatch=sortDispatch sortColumn=nameSort>
                    {React.string("Name")}
                  </Hooks.SortButton>
                </th>
                <th>
                  <Hooks.SortButton data=sorted dispatch=sortDispatch sortColumn=dateSort>
                    {React.string("Date")}
                  </Hooks.SortButton>
                </th>
                <th>
                  <Externals.VisuallyHidden> {React.string("Controls")} </Externals.VisuallyHidden>
                </th>
              </tr>
            </thead>
            <tbody className="content">
              {Array.map(sorted.Hooks.table, ({id, date, name, _}) =>
                <tr key={id->Data.Id.toString}>
                  <td>
                    <Link to_=Tournament(id, TourneyPage.Players)> {React.string(name)} </Link>
                  </td>
                  <td> <Utils.DateFormat date /> </td>
                  <td>
                    <button
                      ariaLabel=j`Delete “$name”`
                      className="danger button-ghost"
                      title={"Delete " ++ name}
                      onClick={_ => deleteTournament(id, name)}>
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              )->React.array}
            </tbody>
          </table>}
      <Externals.Dialog
        isOpen=dialog.state
        onDismiss=dialog.setFalse
        ariaLabel="Create new tournament"
        className="">
        <button className="button-micro" onClick={_ => dialog.setFalse()}>
          {React.string("Close")}
        </button>
        <form onSubmit=makeTournament>
          <fieldset>
            <legend> {React.string("Make a new tournament")} </legend>
            <p>
              <label htmlFor="tourney-name"> {React.string("Name:")} </label>
              <input
                id="tourney-name"
                name="tourney-name"
                placeholder="tournament name"
                required=true
                type_="text"
                value=newTourneyName
                onChange=updateNewName
              />
            </p>
            <p> <input className="button-primary" type_="submit" value="Create" /> </p>
          </fieldset>
        </form>
      </Externals.Dialog>
    </div>
  </Window.Body>
}
