/**
 * These define the array indices used in `Match` objects.
 * @example: `[WhitePlayer, BlackPlayer1]`, `[WhiteScore, BlackScore]`
 */
const WHITE = 0;
const BLACK = 1;
/**
 * Used in by matches to indicate a dummy player. Used with the
 * `getPlayerMaybe()` method to return a dummy player profile.
 * Conforms to the NanoID regex.
 */
const DUMMY_ID = "________DUMMY________";

export {BLACK, DUMMY_ID, WHITE};
