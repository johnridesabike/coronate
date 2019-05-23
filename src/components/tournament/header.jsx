import Icons from "../icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import React from "react";
import {useTournament} from "../../hooks";

export default function Header(props) {
    const {tourney} = useTournament();
    return (
        <div className={props.className}>
            <nav>
                <Link to="/">
                    <Icons.ChevronLeft/> Back
                </Link>
            </nav>
            <h2>{tourney.name}</h2>
        </div>
    );
}
Header.propTypes = {
    className: PropTypes.string
};
