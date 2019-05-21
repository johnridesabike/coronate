Hi, I'm John, the creator and maintainer of Chessahoochee. So far, this has been a one-person show, but I'm always happy to welcome new contributors. This project is still in early development stages, so there's a lot of work left to do before it's ready for general public usage. If you have an idea, suggestion, question, or bug report, [just open a new issue](https://github.com/johnridesabike/chessahoochee/issues).

This project is built using Node.js and React, so familiarity with those will come in handy. Here are my general to-dos for the different components:

## General API

- The matchup algorithm probably needs to be adjusted. It uses the blossom algorithm ([Wikipedia link](https://en.wikipedia.org/wiki/Blossom_algorithm)) to determine matches. I based its priorities on the USCF tiebreak options ([read about them here](http://www.uschess.org/content/view/7752/369/)), but my implementation is probably not 100% perfect. The source code at [/src/pairing-scoring/pairing.js](https://github.com/johnridesabike/chessahoochee/blob/master/src/pairing-scoring/pairing.js) has documentation on how it currently works. Where applicable, I tagged sections of code with USCF section numbers to explain their purpose.
- Improve data storage to use something like PouchDB.
- Improve the way bye points are scored and stored. Currently, if you wanted your bye points to be worth ½ a point but you had the option set to 1 instead, there's no easy way to correct previous bye matches.

## Housekeeping

- Write up-to-date tests.
- Write documentation.

## React

- This was my first React project. I already rewrote it once to correct my bad practices, but it still needs a lot of work. Any advice or help on improving the JSX code or the state management is appreciated!

## User interface

- Improve the "tournament status" and "score detail" tabs.
- Improve accessibility.
- Improve how ranks and ties are displayed.
- Improve the player editor screen.
- Implement drag-and-drop to supplement buttons.

## Low-priority

- Add round robin pairings.
- Improve rating calculations: add provisional ratings and possibly move to a different engine (e.g. Glicko-2).
- Pairing and scoring: improve potential compatibility with third parties.

## Test coverage to-dos

- When players are auto-paired, and there's a bye-queue, the next player on the bye-queue gets paired with the dummy player.
- When players are auto-paired without the bye-queue, the lowest-ranking, lowest-rated player get paired with the dummy player.
- There is only ever one dummy player per round.
- No player plays the dummy player more than once per tournament.
- Removing a round resets all of the matches within the round.

## Code quality

When feasible, I like to follow the Crockford ([JSLint](https://www.jslint.com)) style guide, even though it is often inadequate for frameworks like React. I use [Ramda](https://ramdajs.com/) to manage state changes. I recently started using [tcomb](https://github.com/gcanti/tcomb) to ensure type-safety across the project.

These are general guidelines and personal preferences, and not always followed (or necessary to follow). The ESLint configuration mostly mirrors my preferred style.
