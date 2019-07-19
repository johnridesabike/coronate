// import "jest-dom/extend-expect";
// import {cleanup, render} from "@testing-library/react";
// import PropTypes from "prop-types";
// import React from "react";
// import Scores from "../scores";
// import TournamentData from "../tournament-data";
// import dashify from "dashify";

// afterEach(cleanup);

// const WaneManorOpen = ({children}) => (
//     <TournamentData tourneyId="CaouTNel9k70jUJ0h6SYM">
//         {children}
//     </TournamentData>
// );
// WaneManorOpen.propTypes = {children: PropTypes.func.isRequired};

// it("The tie break scores calculate correctly", function () {
//     const {getByTestId} = render(
//         <WaneManorOpen>{(t) => <Scores tournament={t}/>}</WaneManorOpen>
//     );
//     const batman = (score) => getByTestId(dashify("Bruce Wayne " + score));
//     expect(batman("Median")).toHaveTextContent("4");
//     expect(batman("Solkoff")).toHaveTextContent("7½");
//     expect(batman("Cumulative score")).toHaveTextContent("10");
//     expect(batman("Cumulative of opposition")).toHaveTextContent("15");
// });

// it("The players are ranked correctly", function () {
//     const {getByTestId} = render(
//         <WaneManorOpen>{(t) => <Scores tournament={t}/>}</WaneManorOpen>
//     );
//     expect(getByTestId("0")).toHaveTextContent("Bruce Wayne");
//     expect(getByTestId("1")).toHaveTextContent("Selina Kyle");
//     expect(getByTestId("2")).toHaveTextContent("Dick Grayson");
//     expect(getByTestId("3")).toHaveTextContent("Barbara Gordon");
//     expect(getByTestId("4")).toHaveTextContent("Alfred Pennyworth");
//     expect(getByTestId("5")).toHaveTextContent("Helena Wayne");
//     expect(getByTestId("6")).toHaveTextContent("James Gordon");
//     expect(getByTestId("7")).toHaveTextContent("Jason Todd");
//     expect(getByTestId("8")).toHaveTextContent("Kate Kane");
// });

// it("Half-scores are rendered correctly", function () {
//     const {getByTestId} = render(
//         <WaneManorOpen>{(t) => <Scores tournament={t}/>}</WaneManorOpen>
//     );
//     expect(getByTestId("barbara-gordon-score")).toHaveTextContent("2½");
//     expect(getByTestId("kate-kane-score")).toHaveTextContent("½");
// });

xit("", function (){});