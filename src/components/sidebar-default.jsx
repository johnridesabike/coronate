import Icons from "./icons";
import {Link} from "@reach/router";
// import PropTypes from "prop-types";
import React from "react";

const noDraggy = {onDragStart: (e) => e.preventDefault()};

export default function Sidebar() {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/tourneys" {...noDraggy}>
                        <Icons.Award />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Tournaments
                        </span>
                    </Link>
                </li>
                <li>
                    <Link to="/players" {...noDraggy}>
                        <Icons.Users />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Players
                        </span>
                    </Link>
                </li>
                <li>
                    <Link to="/options" {...noDraggy}>
                        <Icons.Settings />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Options
                        </span>
                    </Link>
                </li>
                <li>
                    <Link to="/" {...noDraggy}>
                        <Icons.Help />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Info
                        </span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
