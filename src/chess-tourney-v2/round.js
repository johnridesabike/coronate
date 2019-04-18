// @ts-check
// A round is just a list of matches
/**
 * @param {number} playerId
 * @param {object[]} matchList
 */
function playerColor(playerId, matchList) {
    let color = -1;
    const match = matchList.filter((m) => m.roster.includes(playerId))[0];
    if (match) {
        color = match.getPlayerColor(playerId);
    }
    return color;
}
Object.freeze(playerColor);
export {playerColor};