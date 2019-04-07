import {firstBy} from "thenby";
import {chunk, last} from "lodash";
import blossom from "edmonds-blossom";
import createMatch from "./match";
import {playerColorBalance, playerScore} from "./scores";
import {DUMMYPLAYER} from "./player";

/**
 * To-do: tweak these
 */
/**
 * @constant avoidMeetingTwicePriority The weight given to avoid players
 * meeting twice. This is the highest priority. (USCF § 27A1)
 */
const avoidMeetingTwicePriority = 10;
/**
 * @constant diffScoresPriority The weight given to match players with a
 * different score. As a negative value, it prioritizes players with closer
 * scores. This gets multiplied against the players' score difference.
 * (USCF § 27A2)
 */
const diffScoresPriority = -2;
/**
 * @constant differentHalfPriority The weight given to match players in opposite
 * halves. (USCF § 27A3)
 */
const differentHalfPriority = 2;
/**
 * @constant differentDueColorPriority The weight given to match players with
 * opposite due colors. (USCF § 27A4 and § 27A5)
 */
const differentDueColorPriority = 1;

/**
 * Creates pairings according to the rules specified in USCF § 27, § 28,
 * and § 29. This is a work in progress and does not account for all of the
 * rules yet.
 * @param {object} round The round object.
 * @returns {array} The list of matches.
 */
function pairPlayers(round) {
    var byeMatch;
    var byePlayerData;
    // var player1;
    var potentialMatches;
    var matches;
    const tourney = round.tourney;
    const dueColor = function (player) {
        if (round.prevRound === undefined) {
            return null;
        }
        var color = 0;
        var prevColor = round.prevRound.playerColor(player);
        if (prevColor === 0) {
            color = 1;
        }
        return color;
    };
    var playerData = round.roster.map(function (player, id) {
        return {
            player: player,
            id: id,
            score: playerScore(tourney, player, round.id),
            dueColor: dueColor(player),
            colorBalance: playerColorBalance(tourney, player),
            opponentHistory: tourney.getPlayersByOpponent(player),
            upperHalf: false
        };
    });
    const scoreList = new Set(playerData.map((p) => p.score));
    // const poolFilters = {
    //     noMatchSelf: (p2) => p2.player !== player1.player,
    //     noMatchedThisRound: (p2) => !p2.matched,
    //     neverMatched: (p2) => !player1.opponentHistory.includes(p2.player),
    //     equalScore: (p2) => p2.score === player1.score,
    //     diffDueColor: function (p2) {
    //         return p2.dueColor === null || p2.dueColor !== player1.dueColor;
    //     },
    //     diffHalf: (p2) => p2.upperHalf !== player1.upperHalf
    // };
    /**
     * We want to pair the highest-scoring and highest-rated players first.
     * This automatically ensures that players who can't be paired in their own
     * score group will be paired in the next group lower instead (USCF § 29C1).
     */
    playerData.sort(
        firstBy((p) => p.score, -1).thenBy((p) => p.player.rating, -1)
    );
    /**
     * If there's an odd number of players, assign a bye to the lowest-rated
     * player in the lowest score group. (USCF § 29L2.)
     */
    if (playerData.length % 2 !== 0) {
        byePlayerData = last(
            playerData.filter(
                (p) => !p.player.hasHadBye(tourney)
            )
        );
        if (!byePlayerData) {
            byePlayerData = last(playerData);
        }
        byeMatch = createMatch(round, byePlayerData.player, DUMMYPLAYER);
        playerData = playerData.filter((p) => p !== byePlayerData);
    }
    /**
     * Determine which players are in the upper and lower halves of their score
     * groups.
     */
    scoreList.forEach(function (score) {
        var playersWithScore = playerData.filter((pd) => pd.score === score);
        playersWithScore.sort((pd) => pd.player.rating).reverse();
        if (playersWithScore.length > 1) {
            // The first chunk is the upper half
            chunk(
                playersWithScore,
                playersWithScore.length / 2
            )[0].forEach(function (playerDatum) {
                playerDatum.upperHalf = true;
            });
        }
    });
    /**
     * Iterate through each player to find a match. We'll use a cascading set
     * of filters to determine ideal matches.
     */
    // playerData.forEach(function (player) {
    //     if (!player.matched) {
    //         var player2;
    //         var match;
    //         var pool;
    //         player1 = player;
    //         /**
    //          * No matter what, you can't match a player with themselves
    //          * and you can't match a player twice per round.
    //          */
    //         var basePool = playerData.filter(
    //             poolFilters.noMatchSelf
    //         ).filter(
    //             poolFilters.noMatchedThisRound
    //         );
    //         /**
    //          * § 27A1. Avoid players meeting twice (highest priority)
    //          * § 27A2. Equal scores
    //          * § 27A3. Upper half vs. lower half
    //          * § 27A4. Eqalizing colors [TODO: needs more work, see below.]
    //          * § 27A5. Alternating colors
    //          */
    //         pool = basePool.filter(
    //             poolFilters.neverMatched
    //         ).filter(
    //             poolFilters.equalScore
    //         ).filter(
    //             poolFilters.diffHalf
    //         ).filter(
    //             poolFilters.diffDueColor
    //         );
    //         if (pool.length === 0) {
    //             /**
    //              * § 27A1. Avoid players meeting twice (highest priority)
    //              * § 27A2. Equal scores
    //              * § 27A3. Upper half vs. lower half
    //              */
    //             pool = basePool.filter(
    //                 poolFilters.neverMatched
    //             ).filter(
    //                 poolFilters.equalScore
    //             ).filter(
    //                 poolFilters.diffHalf
    //             );
    //         }
    //         if (pool.length === 0) {
    //             /**
    //              * § 27A1. Avoid players meeting twice (highest priority)
    //              * § 27A2. Equal scores
    //              * § 27A5. Alternating colors
    //              */
    //             pool = basePool.filter(
    //                 poolFilters.neverMatched
    //             ).filter(
    //                 poolFilters.equalScore
    //             ).filter(
    //                 poolFilters.diffDueColor
    //             );
    //         }
    //         if (pool.length === 0) {
    //             /**
    //              * § 27A1. Avoid players meeting twice (highest priority)
    //              * § 27A2. Equal scores
    //              */
    //             pool = basePool.filter(
    //                 poolFilters.neverMatched
    //             ).filter(
    //                 poolFilters.equalScore
    //             );
    //         }
    //         if (pool.length === 0) {
    //             /**
    //              * § 27A1. Avoid players meeting twice (highest priority)
    //              * § 27A5. Alternating colors
    //              */
    //             pool = basePool.filter(
    //                 poolFilters.neverMatched
    //             ).filter(
    //                 poolFilters.diffDueColor
    //             );
    //         }
    //         if (pool.length === 0) {
    //             /**
    //              * § 27A1. Avoid players meeting twice (highest priority)
    //              */
    //             pool = basePool.filter(
    //                 poolFilters.neverMatched
    //             );
    //         }
    //         /**
    //          * We couldn't find a match, so just take whoever's left.
    //          */
    //         if (pool.length === 0) {
    //             pool = basePool;
    //         }
    //         player2 = pool[0];
    //         match = createMatch(round, player1.player, player2.player);
    //         player1.matched = true;
    //         player2.matched = true;
    //         /**
    //          * A quick-and-easy way to keep colors mostly equal.
    //          * TODO: Make this smarter.
    //          */
    //         if (player1.colorBalance > player2.colorBalance) {
    //             match.reverse();
    //         }
    //         /**
    //          * When the match isn't ideal, include a warning.
    //          */
    //         if (player1.opponentHistory.includes(player2.player)) {
    //             match.warnings += (
    //                 " " + player1.player.firstName
    //                 + " and " + player2.player.firstName
    //                 + " have played previously."
    //             );
    //         }
    //         [player1, player2].forEach(function (player) {
    //             if (Math.abs(player.colorBalance) > 2) {
    //                 match.warnings += (
    //                     " " + player.player.firstName
    //                     + "'s color balance is off"
    //                 );
    //             }
    //         });
    //         matches.push(match);
    //     }
    // });
    potentialMatches = playerData.reduce(function (matches, player1) {
        var opponents = playerData.filter((p) => p !== player1);
        opponents.forEach(function (player2) {
            var match = [player1.id, player2.id, 0];
            var priority = 0;
            var scoreDiff;
            if (!player1.opponentHistory.includes(player2.player)) {
                priority += avoidMeetingTwicePriority;
            }
            scoreDiff = Math.abs(player1.score - player2.score);
            priority += scoreDiff * diffScoresPriority;
            if (player1.upperHalf !== player2.upperHalf) {
                priority += differentHalfPriority;
            }
            if (player1.dueColor === null) {
                priority += differentDueColorPriority;
            }
            if (player1.dueColor !== player2.dueColor) {
                priority += differentDueColorPriority;
            }
            match[2] = Math.ceil(priority);
            matches.push(match);
        });
        return matches;
    }, []);

    var results = blossom(potentialMatches);
    var reducedResults = results.reduce(
        function (matches, p1Id, p2Id) {
            if (p1Id !== -1) {
                var p1 = playerData.filter((p) => p.id === p1Id)[0];
                var p2 = playerData.filter((p) => p.id === p2Id)[0];
                var matched = matches.map((pair) => pair[0]);
                if (!matched.includes(p1) && !matched.includes(p2)) {
                    matches.push([p1, p2]);
                }
            }
            return matches;
        },
        []
    );
    matches = reducedResults.map(
        function (pair) {
            const player1 = pair[0];
            const player2 = pair[1];
            const match = createMatch(round, player1.player, player2.player);
            /**
             * A quick-and-easy way to keep colors mostly equal.
             * TODO: Make this smarter.
             */
            if (player1.colorBalance > player2.colorBalance) {
                match.reverse();
            }
            /**
             * When the match isn't ideal, include a warning.
             */
            if (player1.opponentHistory.includes(player2.player)) {
                match.warnings += (
                    " " + player1.player.firstName
                    + " and " + player2.player.firstName
                    + " have played previously."
                );
            }
            [player1, player2].forEach(function (player) {
                if (Math.abs(player.colorBalance) > 2) {
                    match.warnings += (
                        " " + player.player.firstName
                        + "'s color balance is off"
                    );
                }
            });
            return match;
        }
    );
    /**
     * The bye match always gets added last so as not to affect the numbering.
     */
    if (byeMatch) {
        matches.push(byeMatch);
    }
    return matches;
}

export default Object.freeze(pairPlayers);