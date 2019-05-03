# Test coverage to-dos

Write tests to check for...

- When players are auto-paired, they are paired as expected (this will require some inspection of the pairPlayers() priorities).
- When players are auto-paired, and there's a bye-queue, the next player on the bye-queue gets paired with the dummy player.
- When players are auto-paired without the bye-queue, the lowest-ranking, lowest-rated player get paired with the dummy player.
- There is only ever one dummy player per round.
- No player plays the dummy player more than once per tournament.
- Removing a match resets match-counts and rating changes.
- Removing a round resets all of the matches within the round.
- Each tie-break is calculated correctly.
- A set of tie-break rules will rank players correctly.