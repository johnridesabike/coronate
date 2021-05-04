/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
module Config = LocalForage_Config
module Id = LocalForage_Id
module Map = LocalForage_Map
module Record = LocalForage_Record
module Js = LocalForage_Js

@module external localForage: Js.t = "localforage"
