type encode<'a, 'id> = (. 'a) => Js.Json.t
type decode<'a, 'id> = (. Js.Json.t) => 'a

external encode: (encode<'a, 'id>, . 'a) => Js.Json.t = "%identity"
external decode: (decode<'a, 'id>, . Js.Json.t) => 'a = "%identity"

module type Encodable = {
  type t
  type identity
  let encode: encode<t, identity>
  let decode: decode<t, identity>
}

type encodable<'value, 'identity> = module(Encodable with
  type t = 'value
  and type identity = 'identity
)

module MakeEncodable = (
  M: {
    type t
    let encode: t => Js.Json.t
    let decode: Js.Json.t => t
  },
) => {
  type t = M.t
  type identity
  let encode = {
    let encode = M.encode
    (. x) => encode(x)
  }
  let decode = {
    let decode = M.decode
    (. x) => decode(x)
  }
}
