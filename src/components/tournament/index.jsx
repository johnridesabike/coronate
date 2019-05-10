import React from "react";
import Tournament from "./tournament";
import TournamentList from "./list";

/**
 * @param {Object} props
 */
const TournamentIndex = (props) => (
    <div>
        {props.children}
    </div>
);

export default TournamentIndex;
export {Tournament, TournamentList};
