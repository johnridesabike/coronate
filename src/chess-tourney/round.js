import {DUMMYPLAYER} from "./player";
import createMatch from "./match";
import {playerColorBalance, playerScore} from "./scores";
import {chunk, flatten, last, zip} from "lodash";
import {firstBy} from "thenby";

/**
 * Find a match for a given player.
 * @param {object} player1   The player to be paired
 * @param {array}  pool      The pool of available players
 * @param {array}  blackList A blacklist of players, possibly in the pool,
 * who should not be paired
 * @returns {array} The match object and the paired player. Both will be
 * undefined if no match was made.
 */
function findAMatch(round, matches, player1, pool, blackList = []) {
    /**
     * Try to pair the player as the opposite color as their last round.
     * (USCF § 27A4 and § 27A5)
     */
    var lastColor = round.prevRound.playerColor(player1);
    var hasntPlayed = pool.filter(
        // Filter anyone on the blacklist (e.g. past opponents [USCF § 27A1])
        (p2) => !blackList.includes(p2)
    ).filter( // Don't pair players with themselves
        (p2) => p2 !== player1
    ).filter(// Don't pair anyone who's already been paired
        (p2) => !flatten(matches.map((m) => m.players)).includes(p2)
    );
    /**
     * Prioritize opponents who played that color for *their* last round.
     * (USCF § 27A4 and § 27A5)
     */
    var oppColor = pool.filter(
        (p2) => lastColor !== round.prevRound.playerColor(p2)
    );
    var player2 = hasntPlayed.filter(
        (p2) => oppColor.includes(p2)
    )[0] || hasntPlayed[0];
    var newMatch;
    if (player2) {
        newMatch = createMatch(round, player1, player2);
        var p1Color = playerColorBalance(round.tourney, player1);
        var p2Color = playerColorBalance(round.tourney, player2);
        if (p1Color > p2Color) {
            newMatch.reverse();
        }
    }
    return [newMatch, player2];
}

/**
 * Pair the players in a round.
 * @param {object} The round object.
 * @returns {array} The list of match objects.
 */
function pairPlayers(round) {
    const matches = [];
    const tourney = round.tourney;
    /**
     * Part 1: Split players into separate groups based on their scores
     * (USCF § 27A2)
     * Tree structure:
     * {
     *    score: [list of players],
     *    ...
     * }
     */
    round.roster.forEach(function (player) {
        var score = playerScore(tourney, player, round.id);
        if (round.playerTree[score] === undefined) {
            round.playerTree[score] = [];
        }
        round.playerTree[score].push(player);
    });
    /**
     * Part 2: Split each score group into an upper half and a lower half,
     * based on rating (USCF § 27A3)
     * Tree structure:
     * {
     *    score: [
     *        [upper half list of players],
     *        [lower half list of players]
     *    ],
     *    ...
     * }
     */
    /**
     * Extracts the scores and sorts them from highest to lowest.
     * @param {object} tree
     * @returns {array} The sorted scores.
     */
    function getScores(tree) {
        var scores = Object.keys(tree);
        scores.sort((a, b) => Number(b) - Number(a));
        return scores;
    }
    // reverse it so dummy players etc. get added to lower groups first.
    getScores(round.playerTree).reverse().forEach(function (score, i, list) {
        var players = round.playerTree[score];
        // TODO: Debug this sort order soon...
        players.sort(
            firstBy(
                (p) => playerScore(tourney, p, round.id),
                -1
            ).thenBy(
                (p) => p.rating,
                -1
            )
        );
        /**
         * If there's an odd number of players in this score group...
         */
        if (players.length % 2 !== 0) {
            /**
             * ...and if there's an odd number of players in the total round,
             * then add a dummy player.
             */
            if (round.roster.length % 2 !== 0 && !round.hasDummy()) {
                players.push(DUMMYPLAYER);
            /**
             * ...but if there's an even number of players in the total round,
             * then just move a player to the next score group.
             */
            } else {
                var oddPlayer = players[players.length - 1];
                players.splice(players.length - 1, 1);
                // the group to move the player to
                var newGroup = list[i + 1];
                if (round.playerTree[newGroup] === undefined) {
                    round.playerTree[newGroup] = [];
                }
                round.playerTree[newGroup].push(oddPlayer);
            }
        }
        /**
         * If there are no players in this group (e.g. a lone player got pushed
         * to another group) then delete the key.
         */
        if (players.length === 0) {
            delete round.playerTree[score];
        } else {
            round.playerTree[score] = chunk(players, players.length / 2);
        }
    });
    getScores(round.playerTree).forEach(function (score) {
        // name the upperHalf and lowerHalf to make the code easier to read
        var upperHalf = round.playerTree[score][0];
        var lowerHalf = round.playerTree[score][1];
        /**
         * If there was no previous round, zip the players and call it a day.
         */
        if (round.prevRound === undefined) {
            zip(upperHalf, lowerHalf).forEach(
                (match) => matches.push(createMatch(round, ...match))
            );
        } else {
            /**
             * If there was a previous round, then things get complicated.
             * 1. Record each upper-half player's opponent history
             * 2. Iterate through each upper-half player to find an opponent in
             *    the lower half
             * 3. Attempt to match with a lower-half opponent who isn't in their
             *    history yet AND who is in the history of other upper-half
             *    players. The second part helps eliminate a small percentage of
             *    history overlap. (USCF § 27A1 - highest priority rule)
             * 4. If no opponent was found, try again but don"t consider the
             *    history of other upper-half players.
             * 5. If still no opponent was found, just pick whoever is left in
             *    the lower half, even if they've played each other before.
             * 6. If they have played each other before, attempt to swap
             *    opponents with another upper-half player.
             *
             * This code is certainly not the most reliable or the most
             * efficient. Changes will be needed.
             */
            /**
             * 1.
             * @var {array} upperHalfHistory Each index matches the player's
             * index in `upperHalf`. Each sub-array is a list of their
             * opponents. This is a cache to improve performance and code
             * complexity.
             */
            var upperHalfHistory = upperHalf.map(
                (p) => [
                    ...lowerHalf
                ].concat( // merge the upperHalf and lowerHalf
                    upperHalf
                ).filter( // filter the players who have played this player
                    (p2) => tourney.getPlayersByOpponent(p2).includes(p)
                )
            );
            /**
             * 2.
             */
            upperHalf.forEach(function (player1) {
                var player2;
                var match;
                var history = upperHalfHistory[upperHalf.indexOf(player1)];
                var othersHistory = flatten(
                    upperHalfHistory.slice(upperHalf.indexOf(player1))
                );
                /**
                 * 3.
                 */
                [match, player2] = findAMatch(
                    round,
                    matches,
                    player1,
                    lowerHalf.filter((x) => othersHistory.includes(x)),
                    history
                );
                /**
                 * 4.
                 */
                if (!player2) {
                    [match, player2] = findAMatch(
                        round,
                        matches,
                        player1,
                        lowerHalf,
                        history
                    );
                }
                /**
                 * 5.
                 */
                if (!player2) {
                    [match, player2] = findAMatch(
                        round,
                        matches,
                        player1,
                        lowerHalf,
                        []
                    );
                }
                /**
                 * 6.
                 */
                if (history.includes(player2)) {
                    var foundASwap = false;
                    upperHalf.filter(
                        (p) => p !== player1
                    ).forEach(
                        function (otherPlayer) {
                            if (foundASwap) {
                                return;
                            }
                            var otherMatch = matches.filter(
                                (m) => m.players.includes(otherPlayer)
                            )[0]; // just grab the first one
                            if (otherMatch) {
                                var otherPlayer2 = otherMatch.players.filter(
                                    (p) => p !== otherPlayer
                                )[0]; // just grab the first one.
                                var p1CanSwap = !history.includes(otherPlayer2);
                                var otherCanSwap = !upperHalfHistory[
                                    upperHalf.indexOf(otherPlayer)
                                ].includes(player2);
                                if (p1CanSwap && otherCanSwap) {
                                    match.players = [player1, otherPlayer2];
                                    otherMatch.players = [otherPlayer, player2];
                                    foundASwap = true;
                                }
                            }
                        }
                    );
                }
                /**
                 * check for matching errors.
                 */
                if (tourney.getPlayersByOpponent(player1).includes(player2)) {
                    match.warnings = (
                        player1.firstName + " and " + player2.firstName +
                        " have played previously."
                    );
                }
                matches.push(match);
            });
        }
    });
    return matches;
}

/**
 * Create an object to represent a round in a tournament.
 * @param {object} tourney The tournament containing the round.
 */
function createRound(tourney) {
    const round = {
        id: tourney.roundList.length,
        tourney: tourney,
        roster: tourney.roster.getActive(),
        prevRound: last(tourney.roundList),
        playerTree: {},
        matches: [],
        isComplete() {
            return !round.matches.map((m) => m.isComplete()).includes(false);
        },
        getMatchByPlayer(player) {
            var theMatch = null;
            round.matches.forEach(function (match) {
                if (match.players.includes(player)) {
                    theMatch = match;
                }
            });
            return theMatch;
        },
        playerColor(player) {
            var color = -1;
            const match = round.getMatchByPlayer(player);
            if (match) {
                color = match.players.indexOf(player);
            }
            return color;
        },
        addPlayer(player) {
            round.players.push(player);
            return round;
        },
        hasDummy() {
            return round.roster.includes(DUMMYPLAYER);
        }
    };
    round.matches = pairPlayers(round);
    return round;
}

export default Object.freeze(createRound);