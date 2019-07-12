# Pairing & Scoring to-dos

Use this to keep track of which USCF guidelines have been implemented and which ones haven't. It's likely that not all of them will be added, at least not soon. (This is especially true for nested variations.)

[Relevant chapters of the USCF rulebook are downloadable in PDF form from their website here](http://www.uschess.org/content/view/7752/369/).

## Tie-breaking

### Swiss

- [ ] § 34E1. Modified Median.
- [x] § 34E2. Solkoff.
- [x] § 34E3. Cumulative.
- [x] § 34E4. Median system (not modified).
- [ ] § 34E5. Result between tied players.
- [x] § 34E6. Most blacks.
- [ ] § 34E7. Kashdan.
- [ ] § 34E8. Sonneborn-Berger.
- [x] § 34E9. Cumulative scores of opposition.
- [ ] § 34E10. Opposition’s performance.
- [ ] § 34E11. Average rating of opposition.
- [ ] § 34E12. Speed play-off game(s).
- [ ] § 34E13. Coin flip.

### Round Robin

- [ ] § 34F. Round robin tiebreaks. (*Will consider after Swiss tie-break methods are implemented.*)

## Pairing

This module uses the [blossom algorithm](https://en.wikipedia.org/wiki/Blossom_algorithm) to manage pairing. This works by taking a list of every possible matchup, assigning each a value, and letting the algorithm determine which combination of pairings produces the highest overall value.

Implementing a particular pairing procedure requires a function to: A) aquire data to inform the value (example: add a player's past match results to get their score), B) compare the data between two players (example: check if their scores are equal) and C) assign a numerical value based on the result. With scores it's simple, but some procedures are more complicated.

### Swiss basics

- [x] § 27A1. Avoid players meeting twice (highest priority).
- [x] § 27A2. Equal scores.
- [x] § 27A3. Upper half vs. lower half.
- [x] § 27A4. Equalizing colors.
- [ ] § 27A5. Alternating colors.

### Procedures

- [ ] § 28J. The first round.
    - Flip coin to decide who plays white: higher or lower rated player.
    - Sort players into upper and lower halves, based on rating, and pairing the order of the players together.
- [ ] § 28Q. Pairing unfinished games.
- [ ] § 28R. Accelerated pairings in the first two rounds.

### Subsequent Rounds

- [x] § 29A. Score groups and rank.
- [x] § 29C1. Upper half vs. lower half.
- [x] § 29D. The odd player. (*Not technically implemented, but the blossom algorithm should handle this automatically.*)
- [ ] § 29E3. Due Colors in succeeding rounds.
- [ ] § 29E4. Equalization, alternation, and priority of color. (*Partially implemented.*)
- [ ] § Variation 29E4a. Priority based on plus, even, and minus score groups.
    - [ ] § Variation 29E4b. Alternating priority.
    - [ ] § Variation 29E4c. Priority based on lot.
    - [ ] § Variation 29E4d. Priority based on rank.
- [ ] § - 29E5. Colors vs. ratings.
    - [ ] 29E5a. The 80-point rule.
    - [ ] 29E5b. The 200-point rule.
    - ...
- [ ] § 29E6. Color adjustment technique.
    - ...

## Other rulebooks

Non-USCF rules are not currently being considered, simply because I don't use them. If you *do* use a different rulebook, or wish to use one, then see this next pagraph 👇

## Contributing

If you would like to Coronate for a tournament but you require a feature that is not on this list, [please open an issue here](https://github.com/johnridesabike/coronate/issues). [Pull requests are also welcome.](https://github.com/johnridesabike/coronate/pulls)

Source-code files should have comments with relevant section numbers next to functions that implement one of these rules.