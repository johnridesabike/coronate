I tend to insert `TODO` comments throughout my code as reminders for low-priority tasks that need to be addressed eventually. For more general (and higher-priority) todos, here's a rough outline of what needs to be done:

### General API

The matchup algorithm probably needs to be adjusted. It uses the blossom algorithm ([Wikipedia link](https://en.wikipedia.org/wiki/Blossom_algorithm)) to determine matches. I based its priorities on the USCF tiebreak options ([read about them here](http://www.uschess.org/content/view/7752/369/)), but my implementation is far from perfect. The source code at [`/src/pairing-scoring/pairing.js`](https://github.com/johnridesabike/chessahoochee/blob/master/src/pairing-scoring/pairing.js) has documentation on how it currently works. Where applicable, I tagged sections of code with USCF section numbers to explain their purpose.

### User interface to-dos

- [ ] Improve responsiveness across devices.
- [ ] Improve accessibility.
- [ ] Implement drag-and-drop to supplement buttons.

### Low-priority stuff

- [ ] Add round robin pairings.
- [ ] Improve rating calculations: add provisional ratings and possibly move to a different engine (e.g. Glicko-2).
- [ ] Pairing and scoring: improve potential compatibility with third parties.

### Test coverage

Jest's coverage report hasn't worked for this project in a while, and I don't know why. (It just returns no coverage, or occasionally just one random file.) Hopefully that can get fixed eventually!

- [ ] Create meaningful test data. The data it's using right now was made arbitrarily and doesn't cover all test cases.
- [ ] When players are auto-paired, and there's a bye-queue, the next player on the bye-queue gets paired with the dummy player.
- [ ] When players are auto-paired without the bye-queue, the lowest-ranking, lowest-rated player get paired with the dummy player.
- [ ] There is only ever one dummy player per round.
- [ ] No player plays the dummy player more than once per tournament.
- [ ] Removing a round resets all of the matches within the round.