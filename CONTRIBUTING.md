# Contributing

Thank you for your interest in Coronate. This is a personal project run by
myself (John), but I am happy to accept feedback or changes. Keep in mind that I
cannot guarantee that I will have the time or capability to address everything.
The direction of this project is currently driven by my own use case.

## Bug reports, suggestions, and questions:

The easiest way to contribute is to open an issue.
[You can open an issue on GitHub here](https://github.com/johnridesabike/coronate/issues).

You can also [email me here](mailto:jbpjackson+coronate@icloud.com).

## Area for improvement: Pairing and scoring

I based the pairing and scoring off of USCF guidelines.
[Relevant chapters of the USCF rulebook are downloadable in PDF form from their website here](http://www.uschess.org/content/view/7752/369/).

### Tie-breaking rules

These are the tie-break rules currently implemented:

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
- [ ] § 34F. Round robin tiebreaks.

### Pairing

Coronate uses the [blossom algorithm] to manage pairing. It works by taking a
list of every possible matchup, assigning each a value, and letting the
algorithm determine which combination of pairings produces the highest overall
value.

[blossom algorithm]: https://en.wikipedia.org/wiki/Blossom_algorithm

These are the implemented rules it uses to prioritize pairings, in order of
weight:

- [x] § 27A1. Avoid players meeting twice (highest priority).
- [x] § 27A2. Equal scores.
- [x] § 27A3. Upper half vs. lower half.
- [x] § 27A4. Equalizing colors.
- [ ] § 27A5. Alternating colors.
- [x] § 29A. Score groups and rank.
- [x] § 29C1. Upper half vs. lower half.
- [x] § 29D. The odd player. (Not technically implemented, but the blossom
      algorithm should handle this automatically.)
- [ ] § 29E3. Due Colors in succeeding rounds.
- [ ] § 29E4. Equalization, alternation, and priority of color. (Partially
      implemented.)
- [ ] § Variation 29E4a. Priority based on plus, even, and minus score groups.
  - [ ] § Variation 29E4b. Alternating priority.
  - [ ] § Variation 29E4c. Priority based on lot.
  - [ ] § Variation 29E4d. Priority based on rank.
- [ ] § 29E5. Colors vs. ratings.
  - [ ] 29E5a. The 80-point rule.
  - [ ] 29E5b. The 200-point rule.
- [ ] § 29E6. Color adjustment technique.

### Other rulebooks

I don't use non-USCF rules. If you _do_ use a different rulebook, or wish to
use one, then feel free to let me know.

## Other areas for improvement

These are ideas I've considered but I haven't had the time or energy to
implement.

### General

- [ ] Saving and loading user data is fragile and subject to memory leaks. The
      current implementation is quick-and-dirty and "works" fine, but needs to
      be more robust.
- [ ] The code probably doesn't scale well with large amounts of data.

### User interface

- [ ] Improve the pair-picker view. It should show more information about
      potential pairings and have a preview & confirmation for the
      auto-pairings.
- [ ] Improve responsiveness across devices.

### Test coverage

Tests currently only cover a few of the most fragile functions.

### Low-priority stuff

- [ ] Add round robin pairings.
- [ ] Improve rating calculations.
