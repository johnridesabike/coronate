Hi, I'm John, the creator and maintainer of Chessahoochee. So far, this has been a one-person show, but new contributors are always welcome.

## Bug reports, suggestions, and questions:

[Go here to open a new issue](https://github.com/johnridesabike/chessahoochee/issues).

## Other types of feedback

The direction of this project is currently 100% influenced by my own use case. If you would find this project useful but some part of it doesn't play nicely with your needs, let me know! (Via an issue or email.) I would like as many people as possible to benefit from the work that went into this.

My own work environment has some very specific (and ususual) conditions which led to the decisions I've made so far for the project. I'm happy to hear from users who have similar situations.

## Coding:

This project is built with Node.js and React, so familiarity with those will come in handy.

I tend to insert `TODO` comments throughout my code as reminders for low-priority tasks that need to be addressed eventually. For more general (and higher-priority) todos, here's a rough outline of what needs to be done:

### General API

- The matchup algorithm probably needs to be adjusted. It uses the blossom algorithm ([Wikipedia link](https://en.wikipedia.org/wiki/Blossom_algorithm)) to determine matches. I based its priorities on the USCF tiebreak options ([read about them here](http://www.uschess.org/content/view/7752/369/)), but my implementation is probably not 100% perfect. The source code at [/src/pairing-scoring/pairing.js](https://github.com/johnridesabike/chessahoochee/blob/master/src/pairing-scoring/pairing.js) has documentation on how it currently works. Where applicable, I tagged sections of code with USCF section numbers to explain their purpose.
- Improve the durability of data storage to guard against malformed database objects or other errors.

### Housekeeping

- Improve code documentation.

### User interface

- Improve responsiveness across devices.
- Improve accessibility.
- Implement drag-and-drop to supplement buttons.

### Low-priority

- Add round robin pairings.
- Improve rating calculations: add provisional ratings and possibly move to a different engine (e.g. Glicko-2).
- Pairing and scoring: improve potential compatibility with third parties.

### Test coverage

- Jest's coverage report hasn't worked for this project in a while, and I don't know why (it just returns no coverage). Hopefully that can get fixed eventually!
- When players are auto-paired, and there's a bye-queue, the next player on the bye-queue gets paired with the dummy player.
- When players are auto-paired without the bye-queue, the lowest-ranking, lowest-rated player get paired with the dummy player.
- There is only ever one dummy player per round.
- No player plays the dummy player more than once per tournament.
- Removing a round resets all of the matches within the round.

## About the code style

This project uses [Ramda](https://ramdajs.com/) as it's utility library, and a lot of its code is optimized to play nicely with Ramda's flavor of functional programming. I recently started using [tcomb](https://github.com/gcanti/tcomb) to ensure type-safety across the project.

In general, I like to follow the Crockford ([JSLint](https://www.jslint.com)) style guide. Aside from that, my ESlint configuration mirros my preferred style.