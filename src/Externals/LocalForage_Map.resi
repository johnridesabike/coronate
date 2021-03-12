type t<'value, 'identity>

let make: (
  LocalForage_Config.t,
  LocalForage_Id.encodable<'value, 'identity>,
) => t<'value, 'identity>

let getItem: (t<'value, 'identity>, ~key: string) => Js.Promise.t<option<'value>>

let setItem: (t<'value, 'identity>, ~key: string, ~v: 'value) => Js.Promise.t<unit>

let getKeys: t<'value, 'identity> => Js.Promise.t<array<string>>

let getItems: (t<'value, 'identity>, ~keys: array<string>) => Js.Promise.t<array<(string, 'value)>>

let getAllItems: t<'value, 'identity> => Js.Promise.t<array<(string, 'value)>>

let setItems: (t<'value, 'identity>, ~items: array<(string, 'value)>) => Js.Promise.t<unit>

let removeItems: (t<'value, 'identity>, ~items: array<string>) => Js.Promise.t<unit>

let iterateU: (t<'value, 'identity>, ~f: (. 'value, string, int) => unit) => Js.Promise.t<unit>

let iterate: (t<'value, 'identity>, ~f: ('value, string, int) => unit) => Js.Promise.t<unit>
