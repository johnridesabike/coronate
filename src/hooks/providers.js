import {createContext, createElement, useContext} from "react";

const TournamentContext = createContext(null);

export function useTournament() {
    const state = useContext(TournamentContext);
    return state;
}

export function TournamentProvider(props) {
    return (
        createElement(
            TournamentContext.Provider,
            {value: props.value},
            props.children
        )
    );
}
