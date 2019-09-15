open Belt;
open Utils.Router;
open Data.Tournament;
/* These can't be definined inline or the comparisons don't work. */
let dateSort = Hooks.GetDate(x => x.date);
let nameSort = Hooks.GetString(x => x.name);

[@react.component]
let make = () => {
  let (tourneys, dispatch, _) = Db.useAllTournaments();
  let (sorted, sortDispatch) =
    Hooks.useSortedTable(
      ~table=Map.String.valuesToArray(tourneys),
      ~column=dateSort,
      ~isDescending=true,
    );
  let (newTourneyName, setNewTourneyName) = React.useState(() => "");
  let (isDialogOpen, setIsDialogOpen) = React.useState(() => false);
  let (_, windowDispatch) = Window.useWindowContext();
  React.useEffect1(
    () => {
      windowDispatch(Window.SetTitle("Tournament list"));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    [|windowDispatch|],
  );
  React.useEffect2(
    () => {
      sortDispatch(Hooks.SetTable(Map.String.valuesToArray(tourneys)));
      None;
    },
    (tourneys, sortDispatch),
  );

  let updateNewName = event => {
    setNewTourneyName(ReactEvent.Form.currentTarget(event)##value);
  };
  let makeTournament = event => {
    ReactEvent.Form.preventDefault(event);
    let id = Utils.nanoid();
    dispatch(
      Db.Set(
        id,
        {
          byeQueue: [||],
          date: Js.Date.make(),
          id,
          name: newTourneyName,
          playerIds: [],
          roundList: [||],
          tieBreaks: [|
            Scoring.Median,
            Solkoff,
            Cumulative,
            CumulativeOfOpposition,
          |],
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
      {Map.String.isEmpty(tourneys)
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
                   <Utils.VisuallyHidden>
                     {React.string("Controls")}
                   </Utils.VisuallyHidden>
                 </th>
               </tr>
             </thead>
             <tbody className="content">
               {sorted.table
                |> Js.Array.map(t =>
                     <tr key={t.id} className="buttons-on-hover">
                       <td>
                         <HashLink to_={"/tourneys/" ++ t.id}>
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
                |> ReasonReact.array}
             </tbody>
           </table>}
      <Utils.Dialog
        isOpen=isDialogOpen onDismiss={() => setIsDialogOpen(_ => false)}>
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
      </Utils.Dialog>
    </div>
  </Window.Body>;
};