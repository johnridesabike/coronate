import React, {useState} from "react";
import {DateFormat} from "../../components/utility";
import Icons from "../../components/icons";
import {Link} from "@reach/router";
import PropTypes from "prop-types";

export default function Setup({tournament}) {
    const {tourney, tourneyDispatch} = tournament;
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);

    function changeToOne() {
        tourneyDispatch({
            type: "UPDATE_BYE_SCORES",
            value: 1
        });
        window.alert("Bye value updated to 1.");
    }

    function changeToOneHalf() {
        tourneyDispatch({
            type: "UPDATE_BYE_SCORES",
            value: 0.5
        });
        window.alert("Bye value updated to ½.");
    }

    // lol, why are dates so complicated?!?
    const dateInput = (function () {
        const year = tourney.date.getFullYear();
        const month = (
            tourney.date.getMonth() < 9
            ? "0" + (tourney.date.getMonth() + 1)
            : tourney.date.getMonth() + 1
        );
        const day = (
            tourney.date.getDate() < 10
            ? "0" + tourney.date.getDate()
            : tourney.date.getDate()
        );
        return year + "-" + month + "-" + day;
    }());

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
                <p className="display-20" style={{textAlign: "left"}}>
                    <input
                        className="display-20"
                        style={{textAlign: "left"}}
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
                </p>
            ) : (
                <h1 className="buttons-on-hover" style={{textAlign: "left"}}>
                    <span className="inputPlaceholder">
                        {tourney.name}
                    </span>{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingName(true)}
                    >
                        <Icons.Edit />
                    </button>
                </h1>
            )}
            {isEditingDate
            ? (
                <p className="caption-30">
                    <input
                        className="caption-30"
                        type="date"
                        value={dateInput}
                        onChange={updateDate}
                    />{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingDate(false)}
                    >
                        <Icons.Check />
                    </button>
                </p>
            )
            : (
                <p className="caption-30 buttons-on-hover">
                    <DateFormat date={tourney.date} />{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingDate(true)}
                    >
                        <Icons.Edit />
                    </button>
                </p>
            )}
            <h2>Change bye scores</h2>
            <button onClick={changeToOne}>Change to 1</button>{" "}
            <button onClick={changeToOneHalf}>Change to ½</button>
            <p className="caption-30">
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
