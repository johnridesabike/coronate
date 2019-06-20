import "jest-dom/extend-expect";
import {cleanup, fireEvent, render} from "@testing-library/react";
import {ByeTourney} from "../../../test-data/components";
import React from "react";
import RoundPanels from "../round";

const {click} = fireEvent;
afterEach(cleanup);

it("Auto-matching with bye players works", function () {
    const {getByText, getByTestId} = render(
        <ByeTourney>
            {(t) => <RoundPanels roundId={0} tournament={t}/>}
        </ByeTourney>,
    );
    click(getByText(/auto-pair unmatched players/i));
    expect(getByTestId("match-3-black")).toHaveTextContent("Bye Player");
});
