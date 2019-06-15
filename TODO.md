I tend to insert `TODO` comments throughout my code as reminders for low-priority tasks that need to be addressed eventually. For more general (and higher-priority) todos, here's a rough outline of what needs to be done:

### General API

[See the pairing & scoring TODO document.](https://github.com/johnridesabike/chessahoochee/tree/master/src/pairing-scoring/TODO.md)

### User interface to-dos

- [ ] Overhaul the pair-picker view. It should show more information about potential pairings and have a preview & confirmation for the auto-pairings.
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