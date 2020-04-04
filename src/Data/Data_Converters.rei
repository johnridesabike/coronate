let matches2ScoreData: array(Data_Match.t) => Data_Id.Map.t(Data_Scoring.t);

let createPairingData:
  (
    Data_Id.Map.t(Data_Scoring.t),
    Data_Id.Map.t(Data_Player.t),
    Data_Config.Pair.Set.t
  ) =>
  Data_Id.Map.t(Data_Pairing.t);
