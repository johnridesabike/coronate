import Activity from "react-feather/dist/icons/activity";
import Alert from "react-feather/dist/icons/alert-triangle";
import ArrowDown from "react-feather/dist/icons/arrow-down";
import ArrowLeft from "react-feather/dist/icons/arrow-left";
import ArrowUp from "react-feather/dist/icons/arrow-up";
import Award from "react-feather/dist/icons/award";
import Check from "react-feather/dist/icons/check";
import CheckCircle from "react-feather/dist/icons/check-circle";
import ChevronDown from "react-feather/dist/icons/chevron-down";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import ChevronRight from "react-feather/dist/icons/chevron-right";
import ChevronUp from "react-feather/dist/icons/chevron-up";
import Circle from "react-feather/dist/icons/circle";
import Download from "react-feather/dist/icons/download";
import Edit from "react-feather/dist/icons/edit";
import Help from "react-feather/dist/icons/help-circle";
import Info from "react-feather/dist/icons/info";
import Javascript from "simple-icons/icons/javascript";
import Layers from "react-feather/dist/icons/layers";
import List from "react-feather/dist/icons/list";
// import Logo from "./logo";
import Plus from "react-feather/dist/icons/plus";
import React from "react";
import ReactIcon from "simple-icons/icons/react";
import Repeat from "react-feather/dist/icons/repeat";
import Settings from "react-feather/dist/icons/settings";
import Sidebar from "react-feather/dist/icons/sidebar";
import Trash from "react-feather/dist/icons/trash-2";
import Unfullscreen from "react-feather/dist/icons/minimize-2";
import UserMinus from "react-feather/dist/icons/user-minus";
import UserPlus from "react-feather/dist/icons/user-plus";
import Users from "react-feather/dist/icons/users";
import X from "react-feather/dist/icons/x";

// This converts a specified `simple-icons` icon into a React component.
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
    Activity,
    Alert,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Award,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Circle,
    Download,
    Edit,
    Help,
    Info,
    Javascript: simpleIcon(Javascript),
    Layers,
    List,
    // Logo,
    Plus,
    React: simpleIcon(ReactIcon),
    Repeat,
    Settings,
    Sidebar,
    Trash,
    Unfullscreen,
    UserMinus,
    UserPlus,
    Users,
    X
};
