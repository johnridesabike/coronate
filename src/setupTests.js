/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
// Our tester will click "yes" to everything.
window.confirm = jest.fn(() => true);
window.alert = jest.fn(() => true);

jest.mock("./Db.bs");
jest.mock("./PageTournament/LoadTournament.bs");
