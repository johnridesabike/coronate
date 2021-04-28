/*
  Copyright (c) 2021 John Jackson. 

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
@react.component
let make: (
  ~tourneyId: Data.Id.t,
  ~subPage: Router.TourneyPage.t,
  ~windowDispatch: Window.action => unit,
) => React.element
