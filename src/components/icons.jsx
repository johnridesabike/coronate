import Alert from "react-feather/dist/icons/alert-circle";
import ArrowDown from "react-feather/dist/icons/arrow-down";
import ArrowUp from "react-feather/dist/icons/arrow-up";
import Check from "react-feather/dist/icons/check";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import ChevronRight from "react-feather/dist/icons/chevron-right";
import Edit from "react-feather/dist/icons/edit";
import Info from "react-feather/dist/icons/info";
import Javascript from "simple-icons/icons/javascript";
import Layers from "react-feather/dist/icons/layers";
import List from "react-feather/dist/icons/list";
import Plus from "react-feather/dist/icons/plus";
import React from "react";
import ReactIcon from "simple-icons/icons/react";
import Repeat from "react-feather/dist/icons/repeat";
import Settings from "react-feather/dist/icons/settings";
import Trash from "react-feather/dist/icons/trash-2";
import UserMinus from "react-feather/dist/icons/user-minus";
import UserPlus from "react-feather/dist/icons/user-plus";
import Users from "react-feather/dist/icons/users";
import X from "react-feather/dist/icons/x";

const simpleIcon = (icon) => (props) => (
    <span
        dangerouslySetInnerHTML={{__html: icon.svg}}
        aria-label={icon.title}
        role="img"
        style={{fill: "#" + icon.hex}}
        {...props}
    />
);

export default {
    Alert,
    ArrowDown,
    ArrowUp,
    Check,
    ChevronLeft,
    ChevronRight,
    Edit,
    Info,
    Javascript: simpleIcon(Javascript),
    Layers,
    List,
    Plus,
    React: simpleIcon(ReactIcon),
    Repeat,
    Settings,
    Trash,
    UserMinus,
    UserPlus,
    Users,
    X
};
