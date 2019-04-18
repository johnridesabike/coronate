// @ts-check
import React, {useState, useEffect, Fragment} from "react";
import {PanelContainer, Panel, moveArrItem} from "./utility";
/**
 * @typedef {import("../chess-tourney").PlayerManager} PlayerManager
 * @typedef {import("../chess-tourney").Tournament} Tournament
 * @typedef {import("../chess-tourney").Player} Player
 * @typedef {import("../chess-tourney").ConfigItem} ConfigItem
 */
/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament} props.tourney
 * @param {number[]} props.playerList
 * @param {function} props.newRound
 * @param {React.Dispatch<React.SetStateAction<number[]>>} props.setPlayerList
 */
export function TourneySetup({
    tourney,
    newRound,
    playerManager,
    playerList,
    setPlayerList
}) {
    const [isSelecting, setIsSelecting] = useState(playerList.length === 0);
    if (isSelecting) {
        return <PlayerSelect
            key={tourney.id}
            tourney={tourney}
            playerManager={playerManager}
            setIsSelecting={setIsSelecting}
            setPlayerList={setPlayerList}
            />;
    } else {
        return <TourneyManager
            key={tourney.id}
            tourney={tourney}
            newRound={newRound}
            setIsSelecting={setIsSelecting} />;
    }
}

/**
 * @param {Object} props
 * @param {PlayerManager} props.playerManager
 * @param {Tournament} props.tourney
 * @param {React.Dispatch<React.SetStateAction<number[]>>} props.setPlayerList
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsSelecting
 */
function PlayerSelect({playerManager, tourney, setIsSelecting, setPlayerList}) {
    const [pImports, setPImports] = useState(tourney.roster);
    useEffect(function () {
        tourney.roster = pImports;
        setPlayerList([...tourney.roster]);
    }, [pImports]);
    /** @param {number} id */
    const toggleCheck = function (id) {
        if (pImports.includes(id)) {
            setPImports(pImports.filter((i) => i !== id));
        } else {
            setPImports([id].concat(pImports));
        }
    };
    const globalRoster = playerManager.playerList;
    return (
        <Fragment>
            <p>
                Select your players.
            </p>
            <ul>
            {globalRoster.map((player) =>
                <li key={player.id}>
                    <input type="checkbox"
                        onChange={() => toggleCheck(player.id)}
                        checked={pImports.includes(player.id)}
                        disabled={
                            tourney.canRemovePlayer(player.id)
                } />
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
 * @param {function} props.newRound
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsSelecting
 */
export function TourneyManager({tourney, setIsSelecting, newRound}) {
    const getPlayer = tourney.players.getPlayerById;
    const [byeQueue, setByeQueue] = useState(tourney.byeQueue);
    /** @param {number} id */
    const byeSignUp = (id) => {
        setByeQueue([...byeQueue,...[id]]);
    };
    /** @param {number} id */
    const byeDrop = (id) => {
        setByeQueue(byeQueue.filter((p) => p !== id));
    };
    useEffect(function () {
        tourney.setByeQueue(byeQueue);
    }, [byeQueue]);
    /** @param {number} id */
    const canBye = (id) => (
        tourney.byeQueue.includes(id) || getPlayer(id).hasHadBye(tourney)
    );
    let byeList = <Fragment></Fragment>;
    if (byeQueue.length > 0) {
        byeList = (
            <Fragment>
                <h2>Bye signups:</h2>
                <ol>
                {byeQueue.map((id) =>
                    <li key={id}
                        className={(
                            (getPlayer(id).hasHadBye(tourney))
                            ? "inactive"
                            : "active"
                        )}>
                        {getPlayer(id).firstName}
                        <button
                            onClick={() => byeDrop(id)}
                            disabled={getPlayer(id).hasHadBye(tourney)}>
                            x
                        </button>
                    </li>
                )}
                </ol>
            </Fragment>
        );
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
                {tourney.roster.map((id) =>
                <tr key={id}
                    className={(
                        (tourney.inactive.includes(id))
                        ? "inactive"
                        : "active"
                    )}>
                    <td className="table__player">{getPlayer(id).firstName}</td>
                    <td className="table__number">{getPlayer(id).rating}</td>
                    <td className="table__number">
                    {tourney.getMatchesByPlayer(id).length}
                    </td>
                    <td>
                    {(
                        (canBye(id))
                        ? <button disabled>Bye</button>
                        : <button onClick={() => byeSignUp(id)}
                        >
                        Bye
                        </button>
                    )}
                    </td>
                </tr>
                )}
            </tbody>
        </table>
    );
    return (
        <PanelContainer>
            <Panel>
                <button onClick={() => setIsSelecting(true)}>
                    Select players
                </button>
                <button onClick={() => newRound()}
                    disabled={!tourney.isNewRoundReady()}>
                    New round
                </button>
                {rosterTable}
            </Panel>
            <Panel>
                {byeList}
                <Options key={tourney.id} tourney={tourney} />
            </Panel>
        </PanelContainer>
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
     * @param {string} funcName
     * */
    function tbToggle (event, funcName) {
        const item = tbOptions.filter((x) => x.funcName === funcName)[0];
        item.active = event.target.checked;
        setTbOptions([...tbOptions]);
    }
    /**
     * @param {number} pos
     * @param {1 | -1} dir
     * */
    function tbMove(pos, dir) {
        setTbOptions(moveArrItem(tbOptions, pos, dir));
    }
    useEffect(function () {
        tourney.tieBreak = tbOptions;
    });
    return (
        <section>
            <h3>Options</h3>
            <h3>Tie break priority</h3>
            <ol style={{display: "inline-block"}}>
            {tbOptions.map((tb, i) =>
                <OptionItem key={tb.funcName} item={tb} toggleAction={tbToggle}>
                    <button
                        disabled={i === 0}
                        onClick={() => tbMove(i, -1)}>
                        move up
                    </button>
                    <button
                        disabled={i === tbOptions.length - 1}
                        onClick={() => tbMove(i, 1)}>
                        move down
                    </button>
                </OptionItem>
            )}
            </ol>
        </section>
    );
}

/**
 *
 * @param {Object} props
 * @param {ConfigItem} props.item
 * @param {function} props.toggleAction
 * @param {React.ReactNode} [props.children]
 */
function OptionItem({item, toggleAction, children}) {
    return (
        <li>
        <div style={{display:"Flex", justifyContent:"space-between"}}>
            <span>
                <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(event) =>
                        toggleAction(event, item.funcName)}/>
                {item.name}
            </span>
            <span>
                {children}
            </span>
        </div>
        </li>
    );
}