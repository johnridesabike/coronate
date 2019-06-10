// These define the array indices used in `Match` objects.
// @example: `[WhitePlayer, BlackPlayer1]`, `[WhiteScore, BlackScore]`
const WHITE = 0;
const BLACK = 1;
// This is used in by matches to indicate a dummy player. The
// `getPlayerMaybe()` method returns a special dummy player profile when
// fetching this ID.
// This ID conforms to the NanoID regex.
const DUMMY_ID = "________DUMMY________";

export {BLACK, DUMMY_ID, WHITE};
