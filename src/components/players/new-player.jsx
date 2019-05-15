import React, {useState} from "react";
import {usePlayers} from "../../state";
import {assoc} from "ramda";

export default function NewPlayer() {
    const {playerDispatch} = usePlayers();
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayerData, setNewPlayerdata] = useState(newPlayerDefault);
    /** @param {React.FormEvent<HTMLFormElement>} event */
    const handleSubmit = function (event) {
        event.preventDefault();
        const {firstName, lastName, rating} = newPlayerData;
        setNewPlayerdata(newPlayerDefault);
        playerDispatch({type: "ADD_PLAYER", firstName, lastName, rating});
    };
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
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
                        <input type="text" name="firstName"
                            onChange={updateField}
                            value={newPlayerData.firstName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Last name{" "}
                        <input type="text" name="lastName"
                            onChange={updateField}
                            value={newPlayerData.lastName} required />
                    </label>
                </p>
                <p>
                    <label>
                        Rating {" "}
                        <input
                            type="number"
                            name="rating"
                            onChange={updateField}
                            value={newPlayerData.rating}
                            required />
                    </label>
                </p>
                <p>
                    <input type="submit" value="Add"/>
                </p>
            </fieldset>
        </form>
    );
}
