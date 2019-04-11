import React, {useState, Fragment} from "react";

export function RoundContainer({tourney, round, roundList, setRoundList}) {
    if (round) {
        return <Round round={round} />
    } else {
        return <NewRound tourney={tourney} setRoundList={setRoundList} />
    }
}

function NewRound({tourney, setRoundList}) {
    const makeRound = function () {
        tourney.newRound();
        setRoundList([...tourney.roundList]);
    };
    if (tourney.isNewRoundReady()) {
        return (
            <button
                onClick={makeRound}>
                Make new round
            </button>);
    } else {
        return <p>Complete the first last round first.</p>
    }
}

function Round({round}) {
    const tourney = round.ref_tourney;
    const [matches, setMatches] = useState(round.matches);
    const setWinner = (color, index, event) => {
        let origMatch = round.matches[index];
        if(event.target.checked) {
            if(color === 0) {
                origMatch.whiteWon();
            } else if (color === 1) {
                origMatch.blackWon();
            } else if (color === 0.5) {
                origMatch.draw();
            }
        } else {
            origMatch.resetResult();
        }
        // matches[index] = match;
        setMatches(round.matches.map(o => Object.assign({}, o)));
    }
    const randomize = () => {
        matches.forEach((match, i) => {
            let origMatch = round.matches[i];
            if (origMatch.isBye()) {
                return;
            }
            let rando = Math.random();
            if (rando >= 0.55) {
                origMatch.whiteWon();
            } else if (rando >= .1) {
                origMatch.blackWon();
            } else {
                origMatch.draw();
            }
        });
        setMatches(round.matches.map(o => Object.assign({}, o)));
    }
    return (
        <Fragment>
            <table className="table__roster">
                <caption>Round {round.id + 1} results</caption>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Won</th>
                    <th>White</th>
                    <th>Draw</th>
                    <th>Black</th>
                    <th>Won</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {/* {matches.map((match, i) =>
                    <RoundMatch
                        key={i}
                        tourney={tourney}
                        roundId={roundId}
                        matchId={i}
                        setWinner={setWinner} />
                )} */}
                </tbody>
            </table>
            <p style={{textAlign: "center"}}>
                <button onClick={randomize}>Random!</button>
            </p>
            <h2>Actions</h2>
            {/* <button
                disabled={round !== last(tourney.roundList)}
                data-roundid={round.id}
                onClick={delFunc}>
                Delete round
            </button> */}
        </Fragment>
    );
}