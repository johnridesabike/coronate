// @ts-check
import React, {useState, useEffect, Fragment} from "react";
/**
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Tournament} Tournament
 * @typedef {import("../chess-tourney").Player} Player
 */
/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament} props.tourney
 * @param {Player[]} props.playerList
 * @param {React.Dispatch<React.SetStateAction<Player[]>>} props.setPlayerList
 */
export function TourneySetup({tourney, playerManager, playerList, setPlayerList}) {
    const [isSelecting, setIsSelecting] = useState(playerList.length === 0);
    if (isSelecting) {
        return <PlayerSelect
            key={tourney.id}
            tourney={tourney} 
            playerManager={playerManager}
            setIsSelecting={setIsSelecting}
            setPlayerList={setPlayerList}
            />
    } else {
        return <TourneyManager
            key={tourney.id}
            tourney={tourney}
            setIsSelecting={setIsSelecting} />
    }
}

/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament} props.tourney
 * @param {React.Dispatch<React.SetStateAction<Player[]>>} props.setPlayerList
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsSelecting
 */
function PlayerSelect({playerManager, tourney, setIsSelecting, setPlayerList}) {
    const [pImports, setPImports] = useState(tourney.players.roster.map((p) => p.id));
    useEffect(function () {
        tourney.players.setByIdList(playerManager, pImports);
        setPlayerList([...tourney.players.roster])
    }, [pImports]);
    /** @param {React.ChangeEvent<HTMLInputElement>} event */
    const toggleCheck = function (event) {
        const id = Number(event.currentTarget.dataset.id);
        if (pImports.includes(id)) {
            setPImports(pImports.filter((i) => i!== id));
        } else {
            setPImports([id].concat(pImports));
        }
    };
    const globalRoster = playerManager.roster;
    return (
        <Fragment>
            <p>
                Select your players.
            </p>
            <ul>
            {globalRoster.map((player) =>
                <li key={player.id}>
                    <input type="checkbox" data-id={player.id}
                        onChange={toggleCheck}
                        checked={pImports.includes(player.id)}
                        disabled={tourney.players.canRemovePlayerById(player.id)} />
                    {player.firstName} {player.lastName}
                </li>    
            )}
            </ul>
            <button onClick={() => setPImports(globalRoster.map((p) => p.id))}>
                Select all
            </button>
            <button onClick={() => setPImports([])}>
                Select none
            </button>
            <button onClick={() => setIsSelecting(false)}>
                Done
            </button>
        </Fragment>
    );
}
/**
 *
 * @param {Object} props
 * @param {Tournament} props.tourney
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsSelecting
 */
export function TourneyManager({tourney, setIsSelecting}) {
    const [byeQueue, setByeQueue] = useState(tourney.byeQueue);
    /** @param {Player} player */
    const byeSignUp = (player) => {
        setByeQueue([...byeQueue,...[player]]);
    };
    /** @param {Player} player */
    const byeDrop = (player) => {
        setByeQueue(byeQueue.filter((p) => p !== player));
    };
    useEffect(function () {
        tourney.setByeQueue(byeQueue.map((p) => tourney.players.getPlayerById(p.id)));
    }, [byeQueue]);
    let byeList = <Fragment></Fragment>;
    if (byeQueue.length > 0) {
        byeList = (
            <Fragment>
                <h2>Bye signups:</h2>
                <ol>
                {byeQueue.map((player) =>  
                    <li key={player.id}
                        className={player.hasHadBye(tourney) ? "inactive" : "active"}>
                        {player.firstName}
                        <button
                            onClick={() => byeDrop(player)}
                            disabled={player.hasHadBye(tourney)}>
                            x
                        </button>
                    </li>
                )}
                </ol>
            </Fragment>
        )
    }
    let rosterTable = (
        <table>
            <caption>Roster</caption>
            <thead>
                <tr>
                <th>First name</th>
                <th>Rating</th>
                <th>Rounds played</th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {tourney.players.roster.map((player) =>
                <tr key={player.id} 
                    className={tourney.players.inactive.includes(player) ? "inactive" : "active"}>
                    <td className="table__player">{player.firstName}</td>
                    <td className="table__number">{player.rating}</td>
                    <td className="table__number">
                    {tourney.getMatchesByPlayer(player).length}
                    </td>
                    <td>
                    {(tourney.byeQueue.includes(player) || player.hasHadBye(tourney)
                        ? <button disabled>Bye</button>
                        : <button onClick={() => byeSignUp(player)}>Bye</button>)
                    }
                    </td>
                </tr>
                )}
            </tbody>
        </table>
    );
    return (
        <Fragment>
            {rosterTable}
            {byeList}
            <button onClick={() => setIsSelecting(true)}>
                Select players
            </button>
            <button>
                New round
            </button>
            <Options key={tourney.id} tourney={tourney} />
        </Fragment>
    );
}

/**
 * 
 * @param {Object} props
 * @param {Tournament} props.tourney
 */
function Options({tourney}) {
    const [tbOptions, setTbOptions] = useState(tourney.tieBreak);
    /**
     * @param {React.ChangeEvent<HTMLInputElement>} event
     * @param {number} pos
     * */
    const tbToggle = (event, pos) => {
        tbOptions[pos].active = event.target.checked;
        setTbOptions([...tbOptions]);
    };
    /**
     * @param {number} pos
     * @param {1 | -1} dir
     * */
    const tbMove = (pos, dir) => {
        const newPos = pos + dir;
        const newTbOptions = [...tbOptions];
        const movedMethod = newTbOptions.splice(pos, 1)[0];
        newTbOptions.splice(newPos, 0, movedMethod);
        setTbOptions(newTbOptions);
    };
    useEffect(function () {
        tourney.tieBreak = tbOptions
    });
    return (
        <section>
            <h3>Options</h3>
            <h3>Tie break priority</h3>
            <ol>
            {tbOptions.map((method, i) => 
                <li key={method.funcName}>
                    <input 
                        type="checkbox"
                        checked={method.active} 
                        onChange={(event) => tbToggle(event, i)}/>
                    {method.name}
                    <button onClick={() => tbMove(i, -1)} disabled={i === 0}>
                        <span role="img" aria-label="Move up">↑</span>
                    </button>
                    <button onClick={() => tbMove(i, 1)}
                        disabled={i === tbOptions.length - 1} >
                        <span role="img" aria-label="Move down">↓</span>
                    </button>
                </li>
            )}
            </ol>
        </section>
    );
}