// Our tester will click "yes" to everything.
window.confirm = jest.fn(() => true);
window.alert = jest.fn(() => true);

jest.mock("./Db.bs");
jest.mock("./PageTournament/LoadTournament.bs");
