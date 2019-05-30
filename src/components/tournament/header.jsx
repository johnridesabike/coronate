import React, {useState} from "react";
import {DateFormat} from "../utility";
import Icons from "../icons";
import PropTypes from "prop-types";
import {useTournament} from "../../hooks";

const PlaceholderButton = () => (
    <button
        className="button-ghost placeholder"
        aria-hidden
        disabled
    />
);

export default function Header(props) {
    const {tourney, tourneyDispatch} = useTournament();
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const dateInput = (function () {
        const year = tourney.date.getFullYear();
        const month = (tourney.date.getMonth() < 9)
            ? "0" + (tourney.date.getMonth() + 1)
            : tourney.date.getMonth() + 1;
        const day = (tourney.date.getDate() < 10)
            ? "0" + tourney.date.getDate()
            : tourney.date.getDate();
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
    // TODO: Audit accesibility of these edit controls. (Keyboard focus etc.)
    return (
        <div className={props.className}>
            {(isEditingName)
            ? (
                <p className="display-20">
                    <PlaceholderButton />{" "}
                    <input
                        className="display-20"
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
                <h1 className="buttons-on-hover">
                    <PlaceholderButton />{" "}
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
            {(isEditingDate)
            ? (
                <p className="caption-30">
                    <PlaceholderButton />{" "}
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
                    <PlaceholderButton />{" "}
                    <DateFormat date={tourney.date} />{" "}
                    <button
                        className="button-ghost"
                        onClick={() => setIsEditingDate(true)}
                    >
                        <Icons.Edit />
                    </button>
                </p>
            )}

        </div>
    );
}
Header.propTypes = {
    className: PropTypes.string
};
