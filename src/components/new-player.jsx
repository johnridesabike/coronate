import React, {useState} from "react";
import PropTypes from "prop-types";
import {assoc} from "ramda";

export default function NewPlayer({dispatch}) {
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayerData, setNewPlayerdata] = useState(newPlayerDefault);

    const handleSubmit = function (event) {
        event.preventDefault();
        const {firstName, lastName, rating} = newPlayerData;
        setNewPlayerdata(newPlayerDefault);
        dispatch({firstName, lastName, rating, type: "ADD_PLAYER"});
    };

    const updateField = function (event) {
        event.preventDefault();
        const {name, value} = event.currentTarget;
        setNewPlayerdata((prevState) => assoc(name, value, prevState));
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Register a new player</legend>
                <p>
                    <label>
                        First name{" "}
                        <input
                            name="firstName"
                            type="text"
                            value={newPlayerData.firstName}
                            required
                            onChange={updateField}
                        />
                    </label>
                </p>
                <p>
                    <label>
                        Last name{" "}
                        <input
                            name="lastName"
                            type="text"
                            value={newPlayerData.lastName}
                            required
                            onChange={updateField}
                        />
                    </label>
                </p>
                <p>
                    <label>
                        Rating {" "}
                        <input
                            name="rating"
                            type="number"
                            value={newPlayerData.rating}
                            required
                            onChange={updateField}
                        />
                    </label>
                </p>
                <p>
                    <input type="submit" value="Add"/>
                </p>
            </fieldset>
        </form>
    );
}
NewPlayer.propTypes = {
    dispatch: PropTypes.func.isRequired
};
