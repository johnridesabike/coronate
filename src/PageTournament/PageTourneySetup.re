/* Why are dates so complicated?!?
   Note to future self & other maintainers: getDate() begins at 1, and
   getMonth() begins at 0. An HTML date input requires that the month begins at
   1 and the JS Date() object requires that the month begins at 0. */
open Utils.Router;
open Data;
open Belt;
let makeDateInput = date => {
  open Js.Date;
  let year = date |> getFullYear |> Js.Float.toString;
  let rawMonth = date |> getMonth;
  let rawDate = date |> getDate;
  /* The date input requires a 2-digit month and day.*/
  let month =
    rawMonth < 9.0
      ? "0" ++ Js.Float.toString(rawMonth +. 1.0)
      : Js.Float.toString(rawMonth +. 1.0);

  let day =
    rawDate < 10.0
      ? "0" ++ Js.Float.toString(rawDate) : Js.Float.toString(rawDate);

  [|year, month, day|] |> Js.Array.joinWith("-");
};

type inputs =
  | Name
  | Date
  | NotEditing;

[@react.component]
let make = (~tournament) => {
  let {TournamentData.tourney, setTourney} = tournament;
  let {Tournament.name, date, roundList} = tourney;
  let (editing, setEditing) = React.useState(() => NotEditing);
  let nameInput = React.useRef(Js.Nullable.null);
  let dateInput = React.useRef(Js.Nullable.null);
  let focusRef = myref =>
    Webapi.Dom.(
      myref
      ->React.Ref.current
      ->Js.Nullable.toOption
      ->Option.map(x => x->Element.unsafeAsHtmlElement->HtmlElement.focus)
      ->ignore
    );

  React.useEffect1(
    () => {
      switch (editing) {
      | Name => nameInput->focusRef
      | Date => dateInput->focusRef
      | NotEditing => ()
      };
      None;
    },
    [|editing|],
  );

  let changeToOne = _ => {
    setTourney({
      ...tourney,
      roundList: Match.updateByeScores(~newValue=ByeValue.Full, ~roundList),
    });
    Utils.alert("Bye scores updated to 1.");
  };

  let changeToOneHalf = _ => {
    setTourney({
      ...tourney,
      roundList:
        Match.updateByeScores(~newValue=ByeValue.Half, ~roundList),
    });
    Utils.alert({js|Bye scores updated to ½.|js});
  };

  let updateDate = event => {
    let rawDate = ReactEvent.Form.currentTarget(event)##value;
    let (rawYear, rawMonth, rawDay) =
      switch (rawDate |> Js.String.split("-")) {
      | [|year, month, day|] => (year, month, day)
      | _ => ("2000", "01", "01") /* this was chosen randomly*/
      };
    let year = Js.Float.fromString(rawYear);
    let month = Js.Float.fromString(rawMonth) -. 1.0;
    let date = Js.Float.fromString(rawDay);
    setTourney({
      ...tourney,
      date: Js.Date.makeWithYMD(~year, ~month, ~date, ()),
    });
  };

  <div className="content-area">
    {switch (editing) {
     | Name =>
       <form
         className="display-20"
         style={ReactDOMRe.Style.make(~textAlign="left", ())}
         onSubmit={_ => setEditing(_ => NotEditing)}>
         <input
           className="display-20"
           style={ReactDOMRe.Style.make(~textAlign="left", ())}
           ref={nameInput->ReactDOMRe.Ref.domRef}
           type_="text"
           value=name
           onChange={event =>
             setTourney({
               ...tourney,
               name: event->ReactEvent.Form.currentTarget##value,
             })
           }
         />
         {React.string(" ")}
         <button
           className="button-ghost" onClick={_ => setEditing(_ => NotEditing)}>
           <Icons.Check />
         </button>
       </form>
     | Date
     | NotEditing =>
       <h1 style={ReactDOMRe.Style.make(~textAlign="left", ())}>
         <span className="inputPlaceholder"> {React.string(name)} </span>
         {React.string(" ")}
         <button className="button-ghost" onClick={_ => setEditing(_ => Name)}>
           <Icons.Edit />
           <Utils.VisuallyHidden>
             {React.string("Edit name")}
           </Utils.VisuallyHidden>
         </button>
       </h1>
     }}
    {switch (editing) {
     | Date =>
       <form
         className="caption-30" onSubmit={_ => setEditing(_ => NotEditing)}>
         <input
           className="caption-30"
           type_="date"
           ref={dateInput->ReactDOMRe.Ref.domRef}
           value={makeDateInput(date)}
           onChange=updateDate
         />
         {React.string(" ")}
         <button
           className="button-ghost" onClick={_ => setEditing(_ => NotEditing)}>
           <Icons.Check />
         </button>
       </form>
     | Name
     | NotEditing =>
       <p className="caption-30">
         <Utils.DateFormat date />
         {React.string(" ")}
         <button className="button-ghost" onClick={_ => setEditing(_ => Date)}>
           <Icons.Edit />
           <Utils.VisuallyHidden>
             {React.string("Edit date")}
           </Utils.VisuallyHidden>
         </button>
       </p>
     }}
    <h2> {React.string("Change bye scores")} </h2>
    <button ariaDescribedby="score-desc" onClick=changeToOne>
      {React.string("Change byes to 1")}
    </button>
    {React.string(" ")}
    <button ariaDescribedby="score-desc" onClick=changeToOneHalf>
      {React.string({js|Change byes to ½|js})}
    </button>
    <p className="caption-30" id="score-desc">
      {React.string(
         "This will update all bye matches which have been previously
          scored in this tournament. To change the default bye value in
          future matches, go to the ",
       )}
      <HashLink to_="/options"> {React.string("app options")} </HashLink>
      {React.string(".")}
    </p>
  </div>;
};