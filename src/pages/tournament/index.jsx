import Crosstable from "./crosstable";
import PlayerSelect from "./player-select";
import PropTypes from "prop-types";
import React from "react";
import Round from "./round";
import Scores from "./scores";
import Tournament from "./tournament";
import TournamentList from "./tournament-list";

const TournamentIndex = ({children}) => (
    <div className="passthrough">
        {children}
    </div>
);
TournamentIndex.propTypes = {
    children: PropTypes.node
};

export default TournamentIndex;
export {Crosstable, PlayerSelect, Round, Scores, Tournament, TournamentList};
