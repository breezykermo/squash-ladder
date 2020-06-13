const { ladderModel, playerModel, challengeModel } = require('./../model/clubLadders.model');

async function getLadders (req, res) {
  console.log('==========');
  // console.log(req.query.acceptInvite);
  console.log(req.params);
  console.log(req.params);
  try {
    const ladders = await ladderModel.find({});
    res.status(201);
    res.json(ladders);
  } catch (error) {
    console.log('ERROR: Error running /GET ladders =', error);
    res.sendStatus(500);
  }
};

async function postLadder (req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      throw new Error('one or more parameters for POST /ladder were missing');
    }
    const ladder = await ladderModel.create(req.body);
    res.status(200);
    res.json(ladder);
  } catch (error) {
    console.log('ERROR: running /POST ladder =', error);
    res.status(400);
    res.json({serverError: `ERROR: Express Server:: ${error}`});
  }
}

async function getPlayers (_, res) {
  try {
    const players = await playerModel.find({});
    res.status(201);
    res.json(players);
  } catch (error) {
    console.log('ERROR: Error running /GET players =', error);
    res.sendStatus(500);
  }
};

async function postPlayer (req, res) {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      throw new Error('one or more parameters for POST /player were missing');
    }
    const player = await playerModel.create(req.body);
    res.status(200);
    res.json(player);
  } catch (error) {
    console.log('ERROR: running /POST player =', error);
    res.status(400);
    res.json({serverError: `ERROR: Express Server:: ${error}`});
  }
}

async function getChallenges (_, res) {
  try {
    const challenges = await challengeModel.find({});
    res.status(201);
    res.json(challenges);
  } catch (error) {
    console.log('ERROR: Error running /GET challenges =', error);
    res.sendStatus(500);
  }
};

async function postChallenge (req, res) {
  try {
    // Body will contain the player Ids.
    const challenge = await challengeModel.create(req.body);
    res.status(200);
    res.json(challenge);
  } catch (error) {
    console.log('ERROR: Error running DB /POST challenge  =', error);
    res.status(400);
    res.json({serverError: `ERROR: Express Server:: ${error}`});
  }
}

// Update (PUT) challenge- support any 1..n of the following fields being passed
// - invitationStatus, resultStatus, winner etc
async function putChallenge (req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      throw new Error('no challenge id was provided in PUT call.');
    }

    let challenge = await challengeModel.findOneAndUpdate({_id}, req.body, {
      new: true
    });

    if (!challenge) {
      //   No challenge found
      throw new Error(`no challenge was found with id=${_id}`);
    }

    res.status(200);
    res.json(challenge);
  } catch (error) {
    console.log('ERROR: Error running PUT /challenge =', error);
    res.status(400);
    res.json({serverError: `ERROR::: ${error}`});
  }
}

async function putPlayer (req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      throw new Error('no player id was provided in PUT call.');
    }

    let player = await playerModel.findOneAndUpdate({_id}, req.body, {
      new: true
    });

    if (!player) {
      //   No player found
      throw new Error(`no player was found with id=${_id}`);
    }

    res.status(200);
    res.json(player);
  } catch (error) {
    console.log('ERROR: Error running PUT /player =', error);
    res.status(400);
    res.json({serverError: `ERROR::: ${error}`});
  }
}

module.exports = {
  getLadders,
  postLadder,
  getChallenges,
  postChallenge,
  getPlayers,
  postPlayer,
  putChallenge,
  putPlayer
}