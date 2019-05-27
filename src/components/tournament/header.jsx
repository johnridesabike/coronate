import PropTypes from "prop-types";
import React from "react";
import {useTournament} from "../../hooks";

export default function Header(props) {
    const {tourney} = useTournament();
    return (
        <div className={props.className}>
            <h1>{tourney.name}</h1>
        </div>
    );
}
Header.propTypes = {
    className: PropTypes.string
};
