open Belt;
open Router;
open Data.Tournament;

/* These can't be definined inline or the comparisons don't work. */
let dateSort = Hooks.GetDate(x => x.date);
let nameSort = Hooks.GetString(x => x.name);

[@react.component]
let make = (~windowDispatch) => {
  let Db.{items: tourneys, dispatch, _} = Db.useAllTournaments();
  let (sorted, sortDispatch) =
    Hooks.useSortedTable(
      ~table=Map.valuesToArray(tourneys),
      ~column=dateSort,
      ~isDescending=true,
    );
  let (newTourneyName, setNewTourneyName) = React.useState(() => "");
  let (isDialogOpen, setIsDialogOpen) = React.useState(() => false);
  React.useEffect1(
    () => {
      windowDispatch(Window.SetTitle("Tournament list"));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    [|windowDispatch|],
  );
  React.useEffect2(
    () => {
      sortDispatch(Hooks.SetTable(Map.valuesToArray(tourneys)));
      None;
    },
    (tourneys, sortDispatch),
  );

  let updateNewName = event => {
    setNewTourneyName(ReactEvent.Form.currentTarget(event)##value);
  };
  let makeTournament = event => {
    ReactEvent.Form.preventDefault(event);
    let id = Data.Id.random();
    dispatch(
      Db.Set(
        id,
        {
          byeQueue: [||],
          date: Js.Date.make(),
          id,
          name: newTourneyName,
          playerIds: [],
          roundList: Data.Rounds.empty,
          tieBreaks:
            Scoring.TieBreak.(
              [|Median, Solkoff, Cumulative, CumulativeOfOpposition|]
            ),
        },
      ),
    );
    setNewTourneyName(_ => "");
    setIsDialogOpen(_ => false);
  };
  let deleteTournament = (id, name) => {
    let message = {j|Are you sure you want to delete “$name”?|j};
    if (Webapi.(Dom.Window.confirm(message, Dom.window))) {
      dispatch(Db.Del(id));
    };
  };
  <Window.Body>
    <div className="content-area">
      <div className="toolbar toolbar__left">
        <button onClick={_ => setIsDialogOpen(_ => true)}>
          <Icons.Plus />
          {React.string(" Add tournament")}
        </button>
      </div>
      {Map.isEmpty(tourneys)
         ? <p> {React.string("No tournaments are added yet.")} </p>
         : <table>
             <caption> {React.string("Tournament list")} </caption>
             <thead>
               <tr>
                 <th>
                   <Hooks.SortButton
                     data=sorted dispatch=sortDispatch sortColumn=nameSort>
                     {React.string("Name")}
                   </Hooks.SortButton>
                 </th>
                 <th>
                   <Hooks.SortButton
                     data=sorted dispatch=sortDispatch sortColumn=dateSort>
                     {React.string("Date")}
                   </Hooks.SortButton>
                 </th>
                 <th>
                   <Externals.VisuallyHidden>
                     {React.string("Controls")}
                   </Externals.VisuallyHidden>
                 </th>
               </tr>
             </thead>
             <tbody className="content">
               {Array.map(sorted.Hooks.table, t =>
                  <tr
                    key={t.id->Data.Id.toString} className="buttons-on-hover">
                    <td>
                      <HashLink to_={Tournament(t.id, Tourney.Players)}>
                        {React.string(t.name)}
                      </HashLink>
                    </td>
                    <td> <Utils.DateFormat date={t.date} /> </td>
                    <td>
                      <button
                        ariaLabel={"Delete " ++ t.name}
                        className="danger button-ghost"
                        title={"Delete " ++ t.name}
                        onClick={_ => deleteTournament(t.id, t.name)}>
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                )
                ->React.array}
             </tbody>
           </table>}
      <Externals.Dialog
        isOpen=isDialogOpen
        onDismiss={() => setIsDialogOpen(_ => false)}
        ariaLabel="Create new tournament">
        <button
          className="button-micro" onClick={_ => setIsDialogOpen(_ => false)}>
          {React.string("Close")}
        </button>
        <form onSubmit=makeTournament>
          <fieldset>
            <legend> {React.string("Make a new tournament")} </legend>
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
            {React.string(" ")}
            <input className="button-primary" type_="submit" value="Create" />
          </fieldset>
        </form>
      </Externals.Dialog>
    </div>
  </Window.Body>;
};
