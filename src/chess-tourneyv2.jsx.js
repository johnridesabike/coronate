/**
 * The components in this file will eventually replace the v1 file.
 */
import React, {useState} from "react";
import {createTournament} from "./chess-tourney";

export function Players({playerManager}) {
    const [roster, setRoster] = useState(playerManager.roster);
    const newPlayerDefault = {firstName: "", lastName: "", rating: 1200};
    const [newPlayer, setNewPlayer] = useState(newPlayerDefault);
    const handleSubmit = function (event) {
        event.preventDefault();
        playerManager.addPlayer(newPlayer);
        setNewPlayer(newPlayerDefault);
        setRoster([...playerManager.roster]);
    };
    const updateField = function (event) {
        let update = {};
        update[event.target.name] = event.target.value
        setNewPlayer(Object.assign({}, newPlayer, update));
    };
    const delPlayer = function (event) {
        playerManager.delPlayer(event.target.dataset.id);
        setRoster([...playerManager.roster]);
    };
    let rosterTable = "";
    if (roster.length > 0) {
        rosterTable = 
        <table>
            <caption>Demo Roster</caption>
            <thead>
                <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Rating</th>
                <th></th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {roster.map((player) =>
                <tr key={player.id} >
                    <td className="table__player">{player.firstName}</td>
                    <td className="table__player">{player.lastName}</td>
                    <td className="table__number">{player.rating}</td>
                    <td>
                        <button 
                            data-id={player.id}
                            onClick={delPlayer}>
                            x
                        </button>
                    </td>
                    <td></td>
                </tr>
                )}
            </tbody>
        </table>
    }
    return (
        <div className="roster">
            {rosterTable}
            <p>
                Add your own players:
            </p>
            <form onSubmit={handleSubmit}>
                <p>
                    <label>
                    First name&nbsp;
                    <input type="text" name="firstName" onChange={updateField}
                        value={newPlayer.firstName} required />
                    </label>
                </p>
                <p>
                    <label>
                    Last name&nbsp;
                    <input type="text" name="lastName" onChange={updateField}
                        value={newPlayer.lastName} required />
                    </label>
                </p>
                <p>
                    <label>
                    Rating&nbsp;
                    <input type="number" name="rating" onChange={updateField}
                        value={newPlayer.rating} required />
                    </label>
                </p>
                <p>
                    <input type="submit" value="Add"/>
                </p>
            </form>
        </div>
    );
}

export function TournamentList({playerManager}) {
    const newTourneyDefaults = {name: "Test"};
    const [tourneyList, setTourneyList] = useState([]);
    const [newTourneyData, setNewTourneyData] = useState(newTourneyDefaults);
    const [openTourney, setOpenTourney] = useState(null);
    const newTourney = function(event) {
        event.preventDefault();
        let tourney = createTournament(event.target.name.value);
        setTourneyList([...tourneyList,...[tourney]])
        setNewTourneyData(newTourneyDefaults);
        setOpenTourney(tourney);
    };
    const updateField = function (event) {
        let update = {};
        update[event.target.name] = event.target.value
        setNewTourneyData(Object.assign({}, newTourneyData, update));
    };
    return (
        <main>
            {(tourneyList.length > 0)
            ?
                <ol>
                    {tourneyList.map((tourney, i) => 
                        <li key={i}>
                            {tourney.name}
                        </li>    
                    )}
                </ol>
            :
                <p>
                    No tournaments added yet.
                </p>
            }
            <form onSubmit={newTourney}>
                <input type="text" name="name" value={newTourneyData.name}
                    onChange={updateField} required />
                <input type="submit" value="New Tournament" />
            </form>
            {openTourney &&
                <Tournament tourney={openTourney} playerManager={playerManager} />
            }
        </main>
    );
}

function Tournament({tourney, playerManager}) {
    const [roster, setRoster] = useState(tourney.roster.all);
    const importDefault = function () {
        tourney.roster.importPlayerList(playerManager.roster);
        setRoster([...tourney.roster.all])
    };
    return (
        <div>
            {(roster.length > 0) 
            ?
                <ul>
                {roster.map((player) =>
                    <li key={player.id}>
                        {player.firstName}      
                    </li>
                )}
                </ul>
            :
                <button onClick={importDefault}>
                    Import all players?
                </button>
            }
        </div>
    );
}