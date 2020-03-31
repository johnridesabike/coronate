let makeScoreData:
  (
    ~existingData: Data_Id.Map.t(Scoring.t),
    ~playerId: Data_Id.t,
    ~origRating: int,
    ~newRating: int,
    ~result: float,
    ~oppId: Data_Id.t,
    ~color: Scoring.Color.t
  ) =>
  Scoring.t;

let matches2ScoreData: array(Data_Match.t) => Data_Id.Map.t(Scoring.t);

let createPairingData:
  (
    Data_Id.Map.t(Scoring.t),
    Data_Id.Map.t(Data_Player.t),
    Data_Config.AvoidPairs.t
  ) =>
  Data_Id.Map.t(Pairing.t);
