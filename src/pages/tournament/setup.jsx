import React, {useEffect, useRef, useState} from "react";
import {Link} from "@reach/router";
import VisuallyHidden from "@reach/visually-hidden";
import PropTypes from "prop-types";
import {DateFormat} from "../../components/utility";
import Icons from "../../components/icons";

// Why are dates so complicated?!?
// Note to future self & other maintainers: getDate() begins at 1, and
// getMonth() begins at 0. An HTML date input requires that the month begins at
// 1 and the JS Date() object requires that the month begins at 0.
function makeDateInput(date) {
    const year = date.getFullYear();
    const rawMonth = date.getMonth();
    const rawDate = date.getDate();
    // The date input requires a 2-digit month and day.
    const month = (
        rawMonth < 9
        ? "0" + String(rawMonth + 1)
        : rawMonth + 1
    );
    const day = (
        rawDate < 10
        ? "0" + rawDate
        : rawDate
    );
    return year + "-" + month + "-" + day;
}

export default function Setup({tournament}) {
    const {tourney, tourneyDispatch} = tournament;
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const nameInput = useRef(null);
    const dateInput = useRef(null);

    useEffect(
        function handleFocus() {
            if (isEditingName) {
                nameInput.current.focus();
            }
            if (isEditingDate) {
                dateInput.current.focus();
            }
        },
        [isEditingName, isEditingDate]
    );

    function changeToOne() {
        tourneyDispatch({
            type: "UPDATE_BYE_SCORES",
            value: 1
        });
        window.alert("Bye scores updated to 1.");
    }

    function changeToOneHalf() {
        tourneyDispatch({
            type: "UPDATE_BYE_SCORES",
            value: 0.5
        });
        window.alert("Bye scores updated to ½.");
    }

    function updateDate(event) {
        const [
            rawYear,
            rawMonth,
            rawDay
        ] = event.currentTarget.value.split("-");
        const year = Number(rawYear);
        const month = Number(rawMonth) - 1;
        const day = Number(rawDay);
        tourneyDispatch({
            date: new Date(year, month, day),
            type: "SET_DATE"
        });
    }

    return (
        <div className="content-area">
            {isEditingName
            ? (
                <form
                    className="display-20"
                    style={{textAlign: "left"}}
                    onSubmit={() => setIsEditingName(false)}
                >
                    <input
                        className="display-20"
                        style={{textAlign: "left"}}
                        ref={nameInput}
                        type="text"
                        value={tourney.name}
                        onChange={(event) => tourneyDispatch({
                            name: event.currentTarget.value,
                            type: "SET_NAME"
                        })}
                    />{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingName(false)}
                    >
                        <Icons.Check />
                    </button>
                </form>
            ) : (
                <h1 style={{textAlign: "left"}}>
                    <span className="inputPlaceholder">
                        {tourney.name}
                    </span>{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingName(true)}
                    >
                        <Icons.Edit />
                        <VisuallyHidden>
                            Edit name
                        </VisuallyHidden>
                    </button>
                </h1>
            )}
            {isEditingDate
            ? (
                <form
                    className="caption-30"
                    onSubmit={() => setIsEditingDate(false)}
                >
                    <input
                        className="caption-30"
                        type="date"
                        ref={dateInput}
                        value={makeDateInput(tourney.date)}
                        onChange={updateDate}
                    />{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingDate(false)}
                    >
                        <Icons.Check />
                    </button>
                </form>
            )
            : (
                <p className="caption-30">
                    <DateFormat date={tourney.date} />{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingDate(true)}
                    >
                        <Icons.Edit />
                        <VisuallyHidden>
                            Edit date
                        </VisuallyHidden>
                    </button>
                </p>
            )}
            <h2>Change bye scores</h2>
            <button aria-describedby="score-desc" onClick={changeToOne}>
                Change byes to 1
            </button>{" "}
            <button aria-describedby="score-desc" onClick={changeToOneHalf}>
                Change byes to ½
            </button>
            <p className="caption-30" id="score-desc">
                This will update all bye matches which have been previously
                scored in this tournament. To change the default bye value in
                future matches, go to the{" "}
                <Link to="/options">app options</Link>.
            </p>
        </div>
    );
}
Setup.propTypes = {
    tournament: PropTypes.object.isRequired
};
