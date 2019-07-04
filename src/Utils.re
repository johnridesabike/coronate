[@bs.module "ramda"] external ascend: ('b => 'a, 'b, 'b) => int = "ascend";
[@bs.module "ramda"] external descend: ('b => 'a, 'b, 'b) => int = "descend";
// Use `Belt.SortArray` instead pls.
// [@bs.module "ramda"]
// external sort: (('a, 'a) => int, array('a)) => array('a) = "sort";
[@bs.module "ramda"]
external sortWith: (array(('a, 'a) => int), array('a)) => array('a) =
  "sortWith";
[@bs.module "ramda"]
external sortWithF: (array(('a, 'a) => float), array('a)) => array('a) =
  "sortWith";
[@bs.module "ramda"]
external splitAt: (int, array('a)) => (array('a), array('a)) = "splitAt";

let add = (a, b) => a + b;
let arraySum = arr => Js.Array.reduce(add, 0, arr);
let addFloat = (a, b) => a +. b;
let arraySumFloat = arr => Js.Array.reduce(addFloat, 0.0, arr);
let last = arr => arr[Js.Array.length(arr) - 1];
let splitInHalf = arr => arr |> splitAt(Js.Array.length(arr) / 2);

[@bs.module] [@react.component]
external visuallyHidden: (~children: React.element) => React.element =
  "@reach/visually-hidden";