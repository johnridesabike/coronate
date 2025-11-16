/*
  Copyright (c) 2025 Pascal Honegger.

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
import "@testing-library/jest-dom";
import * as GetItems from "localforage-getitems";
import * as RemoveItems from "localforage-removeitems";
import * as SetItems from "localforage-setitems";
import * as localForage from 'localforage';

window.confirm = vi.fn(() => true);
window.alert = vi.fn(() => true);

vi.mock("./Db.bs");
vi.mock("./PageTournament/LoadTournament.bs");

/* Ensure that all LocalForage plugins get loaded. Need to be done here and in the App.res */
GetItems.extendPrototype(localForage);
RemoveItems.extendPrototype(localForage);
SetItems.extendPrototype(localForage);