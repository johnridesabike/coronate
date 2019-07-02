[@bs.module "ramda"] external ascend: ('b => 'a, 'b, 'b) => int = "ascend";
[@bs.module "ramda"] external descend: ('b => 'a, 'b, 'b) => int = "descend";
[@bs.module "ramda"]
external sort: (('a, 'a) => int, Js.Array.t('a)) => Js.Array.t('a) = "sort";
[@bs.module "ramda"]
external sortWith:
  (array(('a, 'a) => int), Js.Array.t('a)) => Js.Array.t('a) =
  "sortWith";
[@bs.module "ramda"]
external sortWithF:
  (array(('a, 'a) => float), Js.Array.t('a)) => Js.Array.t('a) =
  "sortWith";
[@bs.module "ramda"]
external splitAt: (int, array('a)) => (array('a), array('a)) = "splitAt";

let add = (a, b) => a + b;
let arraySum = arr => Js.Array.reduce(add, 0, arr);
let addFloat = (a, b) => a +. b;
let arraySumFloat = arr => Js.Array.reduce(addFloat, 0.0, arr);
let last = arr => arr[Js.Array.length(arr) - 1];
let splitInHalf = arr => arr |> splitAt(Js.Array.length(arr) / 2) /* }*/;

// let sortWith=(fns, list) => {
//   list |> Js.Array.sortInPlaceWith((a, b) =>{
//     let result = ref(0);
//     let i = ref(0);
//     while ((result^ == 0) && (i^ < (fns |> Js.Array.length))) {
//       result := fns[i^](a, b);
//       i := i^ + 1;
//     }
//     result^;
//   });
//   list;