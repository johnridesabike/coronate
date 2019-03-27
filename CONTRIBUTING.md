At the moment, this project is so small and unstable that I'm not actively seeking contributions. This will hopefully change soon, once the vision for the end product becomes clearer.

If you're interested, here's my general to-do list:

## API
- Better bye handling: signups, black/white balance, tie-break logic, etc.
- Improve adding or removing players after a tournament has begun.
- Add I/O for saving and loading data across sessions.

## Housekeeping
- Clean up code.
- Improve test coverage.
- Write documentation.

## Front-end
- Build a functional front-end UI.

## Beyond the horizon
- Build an awesome front-end UI.
- Package into a standalone Electron app.
- Publish a web demo.
- Improve pairing logic.
- Improve K-factor & account for individual players' provisional ratings.
- Switch to Glicko-2 or some other rating system?
- Add options for other tie-break methods.
- Add round robin pairings.
- Export API into standalone node module.

The code is designed to follow procedures described in the [USCF chess rulebook](http://www.uschess.org/content/view/7752/369/), which makes building it a unique challenge compared to a generic Swiss pairing system. Where applicable, code comments should cite relevant rulebook section numbers.

If you have any questions, just open a new issue.