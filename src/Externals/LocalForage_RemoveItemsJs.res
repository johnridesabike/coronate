type t = LocalForageJs.t
@module external localForage: t = "localforage"
@module("localforage-removeitems")
external extendPrototype: t => unit = "extendPrototype"
let load = () => extendPrototype(localForage)
@bs.send
external fromArray: (t, array<string>) => Js.Promise.t<unit> = "removeItems"
