import "./side-effects";

// This stops @reach packages from nagging us about adding their styles.
window.getComputedStyle = jest.fn().mockImplementation(
    () => ({getPropertyValue: () => 1})
);
// Our tester will click "yes" to everything.
window.confirm = jest.fn(() => true);

jest.mock("./hooks/db");
jest.mock("./pages/tournament/tournament-data");
