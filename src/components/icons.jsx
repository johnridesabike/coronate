/* eslint-disable max-len */
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
import Plus from "react-feather/dist/icons/plus";
import React from "react";
import ReactIcon from "simple-icons/icons/react";
import Repeat from "react-feather/dist/icons/repeat";
import Settings from "react-feather/dist/icons/settings";
import Sidebar from "react-feather/dist/icons/sidebar";
import Trash from "react-feather/dist/icons/trash-2";
import UserMinus from "react-feather/dist/icons/user-minus";
import UserPlus from "react-feather/dist/icons/user-plus";
import Users from "react-feather/dist/icons/users";
import X from "react-feather/dist/icons/x";

/**
 * This converts a specified `simple-icons` icon into a React component.
 */
const simpleIcon = (icon) => (props) => (
    <span
        dangerouslySetInnerHTML={{__html: icon.svg}}
        aria-label={icon.title}
        role="img"
        style={{fill: "#" + icon.hex}}
        {...props}
    />
);

const Logo = () => (
    <svg height="512" viewBox="0 0 135.467 135.467" width="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="b">
                <stop offset="0" stopColor="#a9e7da"/>
                <stop offset="1" stopColor="#00a8d2"/>
            </linearGradient>
            <linearGradient id="a">
                <stop offset="0" stopColor="#003e1d"/>
                <stop offset=".682" stopColor="#00d765"/>
                <stop offset="1" stopColor="#00ff78"/>
            </linearGradient>
            <linearGradient gradientTransform="translate(-135.467)" gradientUnits="userSpaceOnUse" id="c" spreadMethod="pad" x1="0" x2="135.467" xlinkHref="#a" y1="67.733" y2="67.733"/>
            <clipPath id="d">
                <ellipse cx="395.909" cy="386.562" fill="#5df" rx="317.639" ry="317.061" stroke="#9cb0ae" strokeWidth="25.966"/>
            </clipPath>
            <clipPath id="f">
                <circle cx="67.733" cy="67.733" fill="#5df" r="65.077" stroke="#9cb0ae" strokeWidth="5.312"/>
            </clipPath>
            <linearGradient gradientUnits="userSpaceOnUse" id="g" x1="79.933" x2="54.912" xlinkHref="#b" y1="44.439" y2="132.546"/>
            <clipPath id="e">
                <circle cx="256" cy="255.215" r="274.286" strokeWidth="11.863"/>
            </clipPath>
        </defs>
        <ellipse cx="-67.733" cy="67.733" fill="url(#c)" rx="66.182" ry="66.182" stroke="#000" strokeWidth="3.102" transform="rotate(-90)"/>
        <path clipPath="url(#e)" d="M242.59 21.986v27.112h-30.537v27.109h30.537l-.002 43.969c-13.13 5.035-26.353 17.41-39.39 36.8-8.365-6.922-18.264-14.206-30.096-21.695-15.316-8.941-30.394-13.412-45.233-13.412-26.825 0-52.222 10.987-76.193 32.961-23.972 21.974-35.864 48.085-35.674 78.334.19 48.513 31.202 99.404 93.033 152.674L91.627 490H154v46h216v-46h50.375l-17.406-104.162c61.64-53.27 92.65-104.16 93.031-152.674 0-30.25-11.986-56.36-35.957-78.334-23.971-21.974-49.275-32.96-75.91-32.96-14.84 0-29.963 4.47-45.373 13.411a153.652 153.652 0 0 0-29.559 22.276c-13.27-19.679-26.629-32.226-39.787-37.338V76.207h30.535v-27.11h-30.535v-27.11z" fill="#22241c" transform="matrix(.24694 0 0 .24694 4.516 4.71)"/>
        <path clipPath="url(#f)" d="M79.933 44.44s-26.92 8.205-33.778 23.897c-6.048 13.838 7.965 16.967 8.668 33.263.704 16.302-27.055 32.197-27.055 32.197l48.432 1.67s7.868-17.103 4.723-32.166c-3.652-17.498-20.04-20.033-20.598-35.568-.55-15.304 19.608-23.294 19.608-23.294z" fill="url(#g)"/>
        <ellipse cx="-67.733" cy="67.733" fill="none" rx="66.182" ry="66.182" stroke="#000" strokeWidth="3.102" transform="rotate(-90)"/>
    </svg>
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
    Logo,
    Plus,
    React: simpleIcon(ReactIcon),
    Repeat,
    Settings,
    Sidebar,
    Trash,
    UserMinus,
    UserPlus,
    Users,
    X
};
