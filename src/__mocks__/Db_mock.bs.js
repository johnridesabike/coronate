// Generated by ReScript, PLEASE EDIT WITH CARE

import * as React from "react";
import * as Belt_Map from "bs-platform/lib/es6/belt_Map.js";
import * as Belt_Set from "bs-platform/lib/es6/belt_Set.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as TestData$Coronate from "../TestData.bs.js";
import * as Data_Config$Coronate from "../Data/Data_Config.bs.js";
import * as Data_Player$Coronate from "../Data/Data_Player.bs.js";
import * as LocalForage_Id$Coronate from "../Externals/LocalForage_Id.bs.js";
import * as Data_Tournament$Coronate from "../Data/Data_Tournament.bs.js";
import * as LocalForage_Map$Coronate from "../Externals/LocalForage_Map.bs.js";

function func(prim, prim$1, prim$2, prim$3, prim$4, prim$5, prim$6) {
  var tmp = {
    name: prim$2,
    storeName: prim$4
  };
  if (prim !== undefined) {
    tmp.description = Caml_option.valFromOption(prim);
  }
  if (prim$1 !== undefined) {
    tmp.driver = Caml_option.valFromOption(prim$1);
  }
  if (prim$3 !== undefined) {
    tmp.size = Caml_option.valFromOption(prim$3);
  }
  if (prim$5 !== undefined) {
    tmp.version = Caml_option.valFromOption(prim$5);
  }
  return tmp;
}

var Config = LocalForage_Id$Coronate.MakeEncodable({
      encode: Data_Config$Coronate.encode,
      decode: Data_Config$Coronate.decode
    });

var Player = LocalForage_Id$Coronate.MakeEncodable({
      encode: Data_Player$Coronate.encode,
      decode: Data_Player$Coronate.decode
    });

var Tournament = LocalForage_Id$Coronate.MakeEncodable({
      encode: Data_Tournament$Coronate.encode,
      decode: Data_Tournament$Coronate.decode
    });

var tournaments = LocalForage_Map$Coronate.make(func(undefined, undefined, "Coronate", undefined, "Tournaments", undefined, undefined), Tournament);

function loadDemoDB(param) {
  
}

function genericDbReducer(state, action) {
  switch (action.TAG | 0) {
    case /* Del */0 :
        return Belt_Map.remove(state, action._0);
    case /* Set */1 :
        return Belt_Map.set(state, action._0, action._1);
    case /* SetAll */2 :
        return action._0;
    
  }
}

function configReducer(state, action) {
  switch (action.TAG | 0) {
    case /* AddAvoidPair */0 :
        return {
                avoidPairs: Belt_Set.add(state.avoidPairs, action._0),
                byeValue: state.byeValue,
                lastBackup: state.lastBackup
              };
    case /* DelAvoidPair */1 :
        return {
                avoidPairs: Belt_Set.remove(state.avoidPairs, action._0),
                byeValue: state.byeValue,
                lastBackup: state.lastBackup
              };
    case /* DelAvoidSingle */2 :
        var id = action._0;
        return {
                avoidPairs: Belt_Set.reduce(state.avoidPairs, Data_Config$Coronate.Pair.$$Set.empty, (function (acc, pair) {
                        if (Data_Config$Coronate.Pair.has(pair, id)) {
                          return acc;
                        } else {
                          return Belt_Set.add(acc, pair);
                        }
                      })),
                byeValue: state.byeValue,
                lastBackup: state.lastBackup
              };
    case /* SetAvoidPairs */3 :
        return {
                avoidPairs: action._0,
                byeValue: state.byeValue,
                lastBackup: state.lastBackup
              };
    case /* SetByeValue */4 :
        return {
                avoidPairs: state.avoidPairs,
                byeValue: action._0,
                lastBackup: state.lastBackup
              };
    case /* SetState */5 :
        return action._0;
    case /* SetLastBackup */6 :
        return {
                avoidPairs: state.avoidPairs,
                byeValue: state.byeValue,
                lastBackup: action._0
              };
    
  }
}

function useAllItemsFromDb(data) {
  var match = React.useReducer(genericDbReducer, data);
  return {
          items: match[0],
          dispatch: match[1],
          loaded: true
        };
}

function useAllPlayers(param) {
  return useAllItemsFromDb(TestData$Coronate.players);
}

function useAllTournaments(param) {
  return useAllItemsFromDb(TestData$Coronate.tournaments);
}

function useConfig(param) {
  return React.useReducer(configReducer, TestData$Coronate.config);
}

export {
  loadDemoDB ,
  Config ,
  Tournament ,
  Player ,
  tournaments ,
  useAllPlayers ,
  useAllTournaments ,
  useConfig ,
  
}
/* Config Not a pure module */
