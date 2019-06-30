import React, {useReducer} from "react";
import PropTypes from "prop-types";

function basicReducer(state, action) {
    return {...state, ...action};
}
const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};

export default function NewPlayer({dispatch}) {
    const [newPlayerData, newPlayerDispatch] = useReducer(
        basicReducer,
        newPlayerDefault
    );

    function handleSubmit(event) {
        event.preventDefault();
        const {firstName, lastName, rating} = newPlayerData;
        newPlayerDispatch(newPlayerDefault);
        dispatch({
            firstName,
            lastName,
            rating: Number(rating),
            type: "ADD_PLAYER"
        });
    };

    function updateField(event) {
        event.preventDefault();
        const {name, value} = event.currentTarget;
        const update = (function () {
            switch (name) {
            case "firstName":
                return {firstName: value};
            case "lastName":
                return {lastName: value};
            case "rating":
                return {rating: value};
            default:
                return {};
            }
        }());
        newPlayerDispatch(update);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <legend>Register a new player</legend>
                <p>
                    <label htmlFor="firstName">First name</label>
                    <input
                        name="firstName"
                        type="text"
                        value={newPlayerData.firstName}
                        required
                        onChange={updateField}
                    />
                </p>
                <p>
                    <label htmlFor="lastName">Last name</label>
                    <input
                        name="lastName"
                        type="text"
                        value={newPlayerData.lastName}
                        required
                        onChange={updateField}
                    />
                </p>
                <p>
                    <label htmlFor="rating">Rating</label>
                    <input
                        name="rating"
                        type="number"
                        value={newPlayerData.rating}
                        required
                        onChange={updateField}
                    />
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
