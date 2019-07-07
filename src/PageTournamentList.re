let s = React.string;

[@react.component]
let make = () => {
  let (tourneys, dispatch) = Hooks.Db.useAllTournaments();
  let (sorted, sortDispatch) =
    Hooks.useSortedTable(
      ~table=tourneys->Belt.Map.String.valuesToArray,
      ~key=Hooks.KeyDate(Data.Tournament.dateGet),
      ~isDescending=true,
    );
  let (newTourneyName, setNewTourneyName) = React.useState(() => "");
  let (isDialogOpen, setIsDialogOpen) = React.useState(() => false);
  let (_, windowDispatch) = Window.WindowContext.useWindowContext();
  React.useEffect1(
    () => {
      windowDispatch(Window.SetTitle("Tournament list"));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    [|windowDispatch|],
  );
  React.useEffect2(
    () => {
      sortDispatch(Hooks.SetTable(tourneys->Belt.Map.String.valuesToArray));
      None;
    },
    (tourneys, sortDispatch),
  );

  let updateNewName = _ => 0;
  let makeTournament = _ => 0;
  let deleteTournament = _ => 0;
  <Window.WindowBody>
    <div className="content-area">
      <div className="toolbar toolbar__left">
        <button onClick={_ => setIsDialogOpen(_ => true)}>
          <Icons.plus />
          {s(" Add tournament")}
        </button>
      </div>
      {tourneys->Belt.Map.String.isEmpty
         ? <p> {s("No tournaments are added yet.")} </p>
         : <table>
             <caption> {s("Tournament list")} </caption>
             <thead>
               <tr>
                 <th> {s("Name")} </th>
                 <th> {s("Date")} </th>
                 <th>
                   <Utils.ExternalComponents.VisuallyHidden>
                     {s("Controls")}
                   </Utils.ExternalComponents.VisuallyHidden>
                 </th>
               </tr>
             </thead>
           </table>}
    </div>
  </Window.WindowBody>;
};
