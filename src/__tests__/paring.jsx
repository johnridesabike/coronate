// @ts-check
import React, {useReducer} from "react";
import {render, cleanup} from "react-testing-library";
import "jest-dom/extend-expect";
import Round from "../components/tournament/round";
import {dataReducer, defaultData, DataContext} from "../state/global-state";

afterEach(cleanup);

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
function TestApp({children}) {
    const [data, dispatch] = useReducer(dataReducer, defaultData);
    return (
        <DataContext.Provider value={{data, dispatch}}>
            {children}
        </DataContext.Provider>
    );
}

it("renders without crashing", function () {
    const tree = (
        <TestApp>
            <Round tourneyId={1} roundId={0} />
        </TestApp>
    );
    render(tree);
});
