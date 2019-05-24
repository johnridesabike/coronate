import PropTypes from "prop-types";
import React from "react";
import styles from "./utility.module.css";
// import {usePlayers} from "../state";

export const Button = ({children, action}) => (
    <button onClick={action}>
        {children}
    </button>
);
Button.propTypes = {
    action: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};

export const BackButton = ({action}) => (
    <Button action={action}>&lt; Back</Button>
);
BackButton.propTypes = {
    action: PropTypes.func.isRequired
};

export const OpenButton = ({action}) => (
    <Button action={action}>Open &gt;</Button>
);
OpenButton.propTypes = {
    action: PropTypes.func.isRequired
};

export function Panel({children, style}) {
    return (
        <div className={styles.panel} style={{...style}}>
            {children}
        </div>
    );
}
Panel.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object
};

export function PanelContainer(props) {
    return (
        <div {...props} className={styles.panels}>
            {props.children}
            {/* {React.Children.map(props.children, (child) => child)} */}
        </div>
    );
}
PanelContainer.propTypes = {
    children: PropTypes.node.isRequired
};

// export function PlayerLink({id, firstName, lastName}) {
//     const {getPlayer} = usePlayers();
//     const player = getPlayer(id);
//     const name = (function () {
//         if (firstName && lastName) {
//             return player.firstName + " " + player.lastName;
//         } else if (firstName && !lastName) {
//             return player.firstName;
//         } else if (!firstName && lastName) {
//             return player.lastName;
//         } else {
//             return null;
//         }
//     }());
//     if (id === DUMMY_ID) { // there's no bye player profile
//         return name;
//     }
//     if (!name) {
//         return null;
//     }
//     return (
//         <Link to={"/players/" + id}>
//             {firstName && getPlayer(id).firstName}{" "}
//             {lastName && getPlayer(id).lastName}
//         </Link>
//     );
// }
// PlayerLink.propTypes = {
//     firstName: PropTypes.bool,
//     id: PropTypes.number.isRequired,
//     lastName: PropTypes.bool
// };

/*******************************************************************************
 * Non-JSX functions
 ******************************************************************************/
export function findById(id, list) {
    return list.filter((x) => x.id === id)[0];
}

export function findIndexById(id, list) {
    return list.indexOf(findById(id, list));
}
