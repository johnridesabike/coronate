This project is built using Node.js and React, so familiarity with those will come in handy. If you're interested in helping, here's my general roadmap for the different components:

## API

The API (basically everything in [/src/chess-tourney/](/src/chess-tourney/)) is still very unstable, so I'm not actively seeking help for that until I flesh out how the final product will be organized. However, one area where I am seeking feedback is the pairing algorithm, specifically how it weights matchups. If you see any problems with its priorities, please open an issue!

Other API to-dos:

- Add I/O for saving and loading data across sessions.
- Improve rating calculations: provisional ratings and possibly moving to a different engine (e.g. Glicko-2).
- Add bye signups.
- Add player match restrictions (don't pair family members, etc.).

## Front-end

The user-facing interface currently leaves a lot to be desired, but I'm actively making significant changes to it. If you notice any problems with it, you can probably assume I'll fix them soon. I still appreciate feedback though 😁

To-dos:

- Improve how ranks and ties are displayed.
- Add a way to remove rounds.
- Add a way to manually match/unmatch players.
- Add pages for managing  global roster outside of individual tournaments.
- Add pages for editing a player and displaying their stats.

## Housekeeping

General to-dos to keep the project's quality high.

- Clean up code.
- Improve test coverage.
- Write documentation.

## Beyond the horizon

These will get done eventually, but is very low priority now.

- Build an awesome front-end UI.
- Package into a standalone Electron app.
- Improve pairing logic.
- Add user options for tie-break methods.
- Add round robin pairings.
- Export API into standalone node module.


The code is designed to follow procedures described in the [USCF chess rulebook](http://www.uschess.org/content/view/7752/369/), which makes building it a unique challenge compared to a generic Swiss pairing system. Where applicable, code comments should cite relevant rulebook section numbers.

If you have any questions or suggestions, just [open a new issue](https://github.com/johnridesabike/chessahoochee/issues) or submit a pull request.