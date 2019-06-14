import PropTypes from "prop-types";
import React from "react";
import {TournamentProvider} from "../hooks";

const ByeTourney = ({children}) => (
    <TournamentProvider tourneyId="Bye_Round_Tourney____">
        {children}
    </TournamentProvider>
);
ByeTourney.propTypes = {children: PropTypes.node.isRequired};
export {ByeTourney};
