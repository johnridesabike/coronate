/* Why are dates so complicated?!?
   Note to future self & other maintainers: getDate() begins at 1, and
   getMonth() begins at 0. An HTML date input requires that the month begins at
   1 and the JS Date() object requires that the month begins at 0. */
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

open TournamentDataReducers;

type inputs =
  | Name
  | Date
  | NotEditing;

[@react.component]
let make = (~tournament: TournamentData.t) => {
  let tourney = tournament.tourney;
  let tourneyDispatch = tournament.tourneyDispatch;
  let (editing, setEditing) = React.useState(() => NotEditing);
  let nameInput = React.useRef(Js.Nullable.null);
  let dateInput = React.useRef(Js.Nullable.null);
  let focusRef = myref =>
    Webapi.Dom.(
      myref
      ->React.Ref.current
      ->Js.Nullable.toOption
      ->Belt.Option.map(x => x->Element.unsafeAsHtmlElement->HtmlElement.focus)
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
    tourneyDispatch(UpdateByeScores(1.0));
    Utils.alert("Bye scores updated to 1.");
  };

  let changeToOneHalf = _ => {
    tourneyDispatch(UpdateByeScores(0.5));
    Utils.alert({js|Bye scores updated to ½.|js});
  };

  let updateDate = event => {
    let (rawYear, rawMonth, rawDay) =
      switch (
        ReactEvent.Form.currentTarget(event)##value |> Js.String.split("-")
      ) {
      | [|year, month, day|] => (year, month, day)
      | _ => ("2000", "01", "01") /* this was chosen randomly*/
      };
    let year = Js.Float.fromString(rawYear);
    let month = Js.Float.fromString(rawMonth) -. 1.0;
    let date = Js.Float.fromString(rawDay);
    tourneyDispatch(SetDate(Js.Date.makeWithYMD(~year, ~month, ~date, ())));
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
           value={tourney.name}
           onChange={event =>
             tourneyDispatch(
               SetName(event->ReactEvent.Form.currentTarget##value),
             )
           }
         />
         {" " |> React.string}
         <button
           className="button-ghost" onClick={_ => setEditing(_ => NotEditing)}>
           <Icons.check />
         </button>
       </form>
     | _ =>
       <h1 style={ReactDOMRe.Style.make(~textAlign="left", ())}>
         <span className="inputPlaceholder">
           {tourney.name |> React.string}
         </span>
         {" " |> React.string}
         <button className="button-ghost" onClick={_ => setEditing(_ => Name)}>
           <Icons.edit />
           <Utils.VisuallyHidden>
             {"Edit name" |> React.string}
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
           value={makeDateInput(tourney.date)}
           onChange=updateDate
         />
         {" " |> React.string}
         <button
           className="button-ghost" onClick={_ => setEditing(_ => NotEditing)}>
           <Icons.check />
         </button>
       </form>
     | _ =>
       <p className="caption-30">
         <Utils.DateFormat date={tourney.date} />
         {" " |> React.string}
         <button className="button-ghost" onClick={_ => setEditing(_ => Date)}>
           <Icons.edit />
           <Utils.VisuallyHidden>
             {"Edit date" |> React.string}
           </Utils.VisuallyHidden>
         </button>
       </p>
     }}
    <h2> {"Change bye scores" |> React.string} </h2>
    <button ariaDescribedby="score-desc" onClick=changeToOne>
      {"Change byes to 1" |> React.string}
    </button>
    {" " |> React.string}
    <button ariaDescribedby="score-desc" onClick=changeToOneHalf>
      {{js|Change byes to ½|js} |> React.string}
    </button>
    <p className="caption-30" id="score-desc">
      {"This will update all bye matches which have been previously
                scored in this tournament. To change the default bye value in
                future matches, go to the "
       |> React.string}
      <a href="#/options"> {"app options" |> React.string} </a>
      {"." |> React.string}
    </p>
  </div>;
};