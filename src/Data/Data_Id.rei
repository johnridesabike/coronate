type t;

let toString: t => string;

let fromString: string => t;

/**
 * This is used in by matches to indicate a dummy player. The `getPlayerMaybe`
 * function returns a special dummy player profile when fetching this ID.
 */
let dummy: t;

/**
 * This is useful for passing to `keep` functions.
 */
let isDummy: t => bool;

let random: unit => t;

let encode: t => Js.Json.t;

let decode: Js.Json.t => t;

let compare: (t, t) => int;

module Map: {
  type key = t;
  type identity;

  type t('v) = Belt.Map.t(key, 'v, identity);

  let make: unit => t('v);

  let fromStringArray: array((string, 'v)) => t('v);

  let toStringArray: t('v) => array((string, 'v));
};
