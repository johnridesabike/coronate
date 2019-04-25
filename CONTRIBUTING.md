Hi, I'm John, the creator and maintainer of Chessahoochee. So far, this has been a one-person show, but I'm always happy to welcome new contributors. This project is still in early development stages, so there's a lot of work left to do before it's ready for general public usage. If you have an idea, suggestion, question, or bug report, [just open a new issue](https://github.com/johnridesabike/chessahoochee/issues).

This project is built using Node.js and React, so familiarity with those will come in handy. Here are my general to-dos for the different components:

## General API

- The matchup algorithm probably needs to be adjusted. It uses the blossom algorithm ([Wikipedia link](https://en.wikipedia.org/wiki/Blossom_algorithm)) to determine matches. I based its priorities on the USCF tiebreak options ([read about them here](http://www.uschess.org/content/view/7752/369/)), but my implementation is probably not 100% perfect. The source code at [/src/chess-tourney/pairing.js](https://github.com/johnridesabike/chessahoochee/blob/master/src/chess-tourney/pairing.js) has documentation explaining (hopefully clearly) how it currently works. Where applicable, I tagged sections of code with USCF section numbers to explain their purpose.
- There's no real I/O to speak of right now. A v1.0 release will need a way to save, load, and back-up data.
- Type-check coverage needs improvement.

## Housekeeping

- Write up-to-date tests. See [src/\_\_tests\_\_](https://github.com/johnridesabike/chessahoochee/blob/master/src/__tests__) for the current test status.
- Write documentation.
- Finalize specification for data storage (see existing JSON files in `src/state/` for examples of what they'll look like).

## React

- This was my first React project, and it shows. I already rewrote it once to correct my bad practices, but it still needs a lot of work. Any advice or help on improving the JSX code is appreciated!

## User interface

- Improve accessibility.
- Improve how ranks and ties are displayed.
- Improve the player editor screen.
- Implement drag-and-drop.
- MAJORLY clean up the UI.
- Possibly implement a premade UI module (Material, Ant, Momentum, etc.)

## Low-priority

- Package into an offline Electron app.
- Add round robin pairings.
- Improve rating calculations: add provisional ratings and possibly move to a different engine (e.g. Glicko-2).