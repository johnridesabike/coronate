module Config = LocalForage_Config
module Id = LocalForage_Id
module Map = LocalForage_Map
module Record = LocalForage_Record
module Js = LocalForage_Js

@module external localForage: Js.t = "localforage"
