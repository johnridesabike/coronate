import Icons from "./icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";
import React from "react";

function Sidebar() {
    return (
        <nav className="has-sidebar__sidebar">
            <ul>
                <li>
                    <Link to="/tourneys">
                        <Icons.Award />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Tournaments
                        </span>
                    </Link>
                </li>
                <li>
                    <Link  to="/players">
                        <Icons.Users />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Players
                        </span>
                    </Link>
                </li>
                <li>
                    <Link to="/options">
                        <Icons.Settings />
                        <span className="sidebar__hide-on-close">
                            &nbsp;Options
                        </span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default function HasSidebar({children}) {
    return (
        <div className="has-sidebar">
            <Sidebar />
            <div className="has-sidebar__content">
                {children}
            </div>
        </div>
    );
}
HasSidebar.propTypes = {
    children: PropTypes.node.isRequired
};
