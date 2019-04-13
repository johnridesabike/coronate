// @flow
/*::
import type {config, configItem, player} from "./flow-types";
*/

function createDefaultConfig() {
    const defaultConfig/*:config*/ = {
        tieBreak: [
            {
                "name": "Modified median",
                "funcName": "modifiedMedian",
                "active": true
            },
            {
                "name": "Solkoff",
                "funcName": "solkoff",
                "active": true
            },
            {
                "name": "Cumulative score",
                "funcName": "playerScoreCum",
                "active": true
            },
            {
                "name": "Cumulative of opposition",
                "funcName": "playerOppScoreCum",
                "active": true
            },
            {
                "name": "Most black",
                "funcName": "playerColorBalance",
                "active": false
            }
        ]
    };
    return defaultConfig;
}

function JSONretriever(key/*:string*/, value/*:Array<player>*/) {
    if (key.startsWith("ref_")) {
        return undefined;
    } else if (key === "roster") {
        return value.map((p/*:player*/)/*:number*/ => p.id);
    } else {
        return value;
    }
}

export {
    JSONretriever,
    createDefaultConfig
};