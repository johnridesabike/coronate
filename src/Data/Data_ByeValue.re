type t =
  | Full
  | Half;
let toFloat = data =>
  switch (data) {
  | Full => 1.0
  | Half => 0.5
  };
let fromFloat = json =>
  switch (json) {
  | 1.0 => Full
  | 0.5 => Half
  | _ => Full
  };
let encode = data => data |> toFloat |> Json.Encode.float;
let decode = json => json |> Json.Decode.float |> fromFloat;