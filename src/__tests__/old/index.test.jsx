// import "jest-dom/extend-expect";
// import {cleanup, fireEvent, render} from "@testing-library/react";
// import {ByeTourney} from "../../../../test-data/components";
// import {withRoundData} from "../../round";
// import PairPicker from "../index";
// import PropTypes from "prop-types";
// import React from "react";
// import TournamentData from "../../tournament-data";

// const {click} = fireEvent;

// afterEach(cleanup);

// const PairPickerWithData = withRoundData(PairPicker);

// const BattleForGothamCityRound = ({roundId}) => (
//     <TournamentData tourneyId="tvAdS4YbSOznrBgrg0ITA">
//         {(t) => (
//             <PairPickerWithData tournament={t} roundId={roundId} />
//         )}
//     </TournamentData>
// );
// BattleForGothamCityRound.propTypes = {
//     roundId: PropTypes.string.isRequired
// };
// const ByeTourneyRound = ({roundId}) => (
//     <ByeTourney>
//         {(t) => (
//             <PairPickerWithData tournament={t} roundId={roundId} />
//         )}
//     </ByeTourney>
// );
// ByeTourneyRound.propTypes = {
//     roundId: PropTypes.string.isRequired
// };

// it("Selecting and unselecting players works", function () {
//     const {queryByText, getByText, getByLabelText} = render(
//         <BattleForGothamCityRound roundId="1" />
//     );
//     click(getByText(/add bruce wayne/i));
//     expect(getByText(/white: bruce wayne/i)).toBeInTheDocument();
//     click(getByText(/add dick grayson/i));
//     expect(getByText(/black: dick grayson/i)).toBeInTheDocument();
//     click(getByLabelText(/remove bruce wayne/i));
//     expect(queryByText(/white: bruce wayne/i)).not.toBeInTheDocument();
//     click(getByLabelText(/remove dick grayson/i));
//     expect(queryByText(/black: dick grayson/i)).not.toBeInTheDocument();
// });
// it("Swapping colors works", function () {
//     const {getByText} = render(
//         <BattleForGothamCityRound roundId="1" />
//     );
//     click(getByText(/add bruce wayne/i));
//     click(getByText(/add dick grayson/i));
//     click(getByText(/swap colors/i));
//     expect(getByText(/white: dick grayson/i)).toBeInTheDocument();
//     expect(getByText(/black: bruce wayne/i)).toBeInTheDocument();

// });
// it("Removed players are removed from selection", function () {
//     const {getByText, queryByText, getByLabelText} = render(
//         <BattleForGothamCityRound roundId="1" />
//     );
//     click(getByText(/add bruce wayne/i));
//     expect(getByText(/white: bruce wayne/i)).toBeInTheDocument();
//     click(getByText(/add or remove players from the roster/i));
//     click(getByLabelText(/Select Bruce Wayne/i));
//     click(getByText(/^done$/i));
//     expect(queryByText(/white: bruce wayne/i)).not.toBeInTheDocument();
// });
// it("Selecting bye players works", function () {
//     const {getByText} = render(
//         <ByeTourneyRound roundId="0" />
//     );
//     click(getByText(/add bye player/i));
//     expect(getByText(/white: bye player/i)).toBeInTheDocument();
// });
// it("Selected bye players are removed when not needed anymore", function () {
//     const {getByText, getByLabelText, queryByText} = render(
//         <ByeTourneyRound roundId="0" />
//     );
//     click(getByText(/add bye player/i));
//     // Remove a player to make it even
//     click(getByText(/add or remove players from the roster/i));
//     click(getByLabelText(/Select joel robinson/i));
//     click(getByText(/^done$/i));
//     expect(queryByText(/white: bye player/i)).not.toBeInTheDocument();
// });
xit("", function (){});