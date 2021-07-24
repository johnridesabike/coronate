/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
type t<'a, 'identity>

let make: (LocalForage_Config.t, LocalForage_Id.encodable<'a, 'identity>) => t<'a, 'identity>

let get: t<'a, 'identity> => Promise.t<'a>

let set: (t<'a, 'identity>, ~items: 'a) => Promise.t<unit>
