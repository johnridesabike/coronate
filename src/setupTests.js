import "./side-effects";

// This stops @reach packages from nagging us about adding their styles.
window.getComputedStyle = jest.fn().mockImplementation(
    () => ({getPropertyValue: () => 1})
);
// Our tester will click "yes" to everything.
window.confirm = jest.fn(() => true);
window.alert = jest.fn(() => true);

jest.mock("./Db.bs");
jest.mock("./PageTournament/TournamentData.bs");
