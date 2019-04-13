// @flow
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
export type tournament = {
    id: number,
    name: string,
    roundList: Array<round>,
    byeValue: number,
    byeQueue: Array<player>,
    players: playerManager,
    tieBreak: configList,
    getPlayersByOpponent: function,
    getMatchesByPlayer?: function,
    canRemoveRound: function,
    getMatchesByPlayer: function,
    isNewRoundReady: function
};

export type defaultTourney = {
    id: number,
    name: string,
    roundList: Array<round>,
    byeValue: number,
    byeQueue: Array<player>,
    players: playerManager,
    tieBreak: configList,
};

export type player = {
    id: number,
    firstName: string,
    lastName: string,
    rating: number,
    dummy: boolean,
    matchCount: number,
    isReference: boolean,
    getEloRank: function,
    hasHadBye: function
};

export type defPlayer = {
    id: number,
    firstName: string,
    lastName: string,
    rating: number,
    dummy: boolean,
    matchCount: number,
};

export type playerManager = {
    roster: Array<player>,
    lastId: number,
    ref_tourney: tournament,
    inactive: Array<player>,
    getPlayerById: function,
    canRemovePlayer: function,
    removePlayer: function,
    importPlayerById: function,
    removePlayerById: function,
    addPlayer: function,
    getActive: function
};

export type round = {
    id: number,
    roster: Array<player>,
    ref_prevRound: round,
    matches: Array<match>,
    ref_tourney: tournament,
    playerColor: function,
    isComplete: function
};

export type match = {
    id: number,
    ref_round: round,
    ref_tourney: tournament,
    warnings: string,
    roster: Array<player>,
    result: Array<number>,
    origRating: Array<number>,
    newRating: Array<number>,
    ideal: number
};
export type defaultMatch = {
    id?: number,
    ref_round: round,
    ref_tourney?: tournament,
    warnings?: string,
    roster: Array<player>,
    result?: Array<number>,
    origRating?: Array<number>,
    newRating?: Array<number>,
    ideal?: number
};

export type config = {
    tieBreak: configList
};

export type configList = Array<configItem>;

export type configItem = {
    name: string,
    funcName: string,
    active: boolean
};