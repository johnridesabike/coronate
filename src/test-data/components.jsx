import PropTypes from "prop-types";
import React from "react";
import TournamentData from "../pages/tournament/tournament-data";
import {Window} from "../components/window";

const ByeTourney = ({children}) => (
    <TournamentData tourneyId="Bye_Round_Tourney____">
        {children}
    </TournamentData>
);
ByeTourney.propTypes = {children: PropTypes.func.isRequired};
export {ByeTourney};

const AllTheProviders = ({children}) => (
    <Window>
        {children}
    </Window>
);
AllTheProviders.propTypes = {children: PropTypes.node.isRequired};
export {AllTheProviders};
