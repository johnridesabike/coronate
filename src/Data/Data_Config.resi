module ByeValue: {
  type t = Full | Half

  let toFloat: t => float

  let fromFloat: float => t
}

type t = {
  avoidPairs: Data_Id.Pair.Set.t,
  byeValue: ByeValue.t,
  lastBackup: Js.Date.t,
}

let decode: Js.Json.t => t
let encode: t => Js.Json.t

let default: t
