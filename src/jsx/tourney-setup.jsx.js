import React, {useState, useEffect, Fragment} from "react";

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

function PlayerSelect({playerManager, tourney, setIsSelecting, setPlayerList}) {
    const [pImports, setPImports] = useState(tourney.roster.all.map((p) => p.id));
    useEffect(function () {
        tourney.roster.setByIdList(playerManager, pImports);
        setPlayerList([...tourney.roster.all])
    }, [pImports]);
    const toggleCheck = function (event) {
        const id = Number(event.target.dataset.id);
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
                        disabled={tourney.roster.canRemovePlayerById(player.id)} />
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

export function TourneyManager({tourney, setIsSelecting}) {
    const [byeQueue, setByeQueue] = useState(tourney.byeQueue);
    const byeSignUp = (player) => {
        setByeQueue([...byeQueue,...[player]]);
    };
    const byeDrop = (player) => {
        setByeQueue(byeQueue.filter((p) => p !== player));
    };
    useEffect(function () {
        tourney.setByeQueue(byeQueue.map((id) => tourney.roster.getPlayerById(id)));
    }, [byeQueue]);
    let byeList = "";
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
                {tourney.roster.all.map((player) =>
                <tr key={player.id} 
                    className={tourney.roster.inactive.includes(player) ? "inactive" : "active"}>
                    <td className="table__player">{player.firstName}</td>
                    <td className="table__number">{player.rating}</td>
                    <td className="table__number">
                    {tourney.getMatchesByPlayer(player).length}
                    </td>
                    <td>
                    {tourney.roster.getActive().length % 2 !== 0 &&
                        (tourney.byeQueue.includes(player) || player.hasHadBye(tourney)
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

function Options({tourney}) {
    const [tbOptions, setTbOptions] = useState(tourney.tieBreak);
    const tbToggle = (event) => {
        let id = event.target.dataset.pos;
        tbOptions[id].active = event.target.checked;
        setTbOptions([...tbOptions]);
    };
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
                        data-pos={i} 
                        checked={method.active} 
                        onChange={tbToggle}/>
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