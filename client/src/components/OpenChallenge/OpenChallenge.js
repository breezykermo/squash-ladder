import React, { useState } from 'react';
import Emoji from '../Emoji';
import moment from 'moment';

export default function OpenChallenge({players, loggedInPlayer, nextChallenge, updateChallenge, updatePlayer}) {
  const [state, setState] = useState({winner: '', commentary: '', score: ''});
  const challengerName = (nextChallenge) ? nextChallenge.challenger.firstName + ' ' + nextChallenge.challenger.lastName : null;
  const challengedName = (nextChallenge) ? nextChallenge.challenged.firstName + ' ' + nextChallenge.challenged.lastName : null;
  const lastUpdatedFormatted = (nextChallenge) ? moment(nextChallenge.lastUpdated).format("Do") + ' ' + moment(nextChallenge.lastUpdated).format("MMM") : null;

  const handleChallengeChange = (inStatus) => {
    // Set the new status on the challenge object and call function to write changes to DB and update this.state.
    nextChallenge.status = inStatus;
    // Update status text
    const responseType = (inStatus === 'inviteAccepted') ? 'accepted' : 'declined';
    nextChallenge.statusSummaryText = `${challengedName} ${responseType} challenge of: ${challengerName}`;
    updateChallenge(nextChallenge);
  }

  function handleResult(event) {
    event.preventDefault();

    // set status
    nextChallenge.status = 'complete';

    // set winner and loser & update Wins and losses.
    const challenger = nextChallenge.challenger;
    const challenged = nextChallenge.challenged;
    if (loggedInPlayer._id === nextChallenge.challengerId) {
      // The challenger has submitted the result.
      if (state.winner === 'yes') {
        nextChallenge.winner = challenger;
        nextChallenge.loser = challenged;
      } else {
        nextChallenge.winner = challenged;
        nextChallenge.loser = challenger;
      }
    } else {
      // The challenged player has submitted the result.
      if (state.winner === 'yes') {
        nextChallenge.winner = challenged;
        nextChallenge.loser = challenger;
      } else {
        nextChallenge.winner = challenger;
        nextChallenge.loser = challenged;
      }
    }
    nextChallenge.winnerId = nextChallenge.winner._id;
    nextChallenge.loserId = nextChallenge.loser._id;

    // Update game stats:
    nextChallenge.winner.numWins++;
    nextChallenge.loser.numLosses++;

    // === UPDATE PLAYER
    // Alter the the player positions (if applicable)
    if (nextChallenge.winner.position < nextChallenge.loser.position) {
      console.log(`INFO: Winner of challenge: ${nextChallenge.winner.name} is already higher than ${nextChallenge.loser.name} -no change to ladder.`);
      // Set trend to "no change".
      nextChallenge.winner.trend = 0;  //0 = same; 1=up -1: down
      nextChallenge.loser.trend = 0;
    } else {
      // The players' position is swapped.
      const winnerPos = nextChallenge.winner.position;
      const loserPos = nextChallenge.loser.position;
      nextChallenge.winner.position = loserPos;
      nextChallenge.loser.position = winnerPos;
      // Update the player trend:-
      nextChallenge.winner.trend = 1;  //0 = same; 1=up -1: down
      nextChallenge.loser.trend = -1;
    }
    // Update Player form
    nextChallenge.winner.form.push('W');
    nextChallenge.winner.form.shift();
    nextChallenge.loser.form.push('L');
    nextChallenge.loser.form.shift();

    // Set commentary, score
    nextChallenge.commentary = state.commentary;
    nextChallenge.winningScore = state.score;

    // set status text
    nextChallenge.statusSummaryText =
      `${nextChallenge.winner.firstName}
      ${nextChallenge.winner.lastName}
      bt ${nextChallenge.loser.firstName}
      ${nextChallenge.loser.lastName} (${nextChallenge.winningScore})`;

    // update the player objects - FIX ME- is this the right technique?
    updatePlayer(nextChallenge.winnerId, nextChallenge.winner);
    updatePlayer(nextChallenge.loserId, nextChallenge.loser);
    updateChallenge(nextChallenge);
  }

  function handleFormChange (event) {
    const { name, value } = event.target;
    setState( prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  function getOpponentName() {
    if (nextChallenge.challengerId === loggedInPlayer._id) return challengedName;
    else return challengerName;
  }

  return (
    <>
      <div className="nextChallengePane">
      {
        (!nextChallenge &&

        <div className="noChallengePane">
          <p>Currently no game planned</p>
          <p>Pick a new challenger!</p>
          <p className="statusEmoji"><Emoji symbol="????"/></p>
        </div>)

        /* Invited (Player is the "challenger") */
        || (nextChallenge.status === 'invited' && nextChallenge.challengerId === loggedInPlayer._id &&
            <div className="invitedChallengerView">
              <p className="challengedText">Challenged {getOpponentName()}</p>
              <p>on {lastUpdatedFormatted}</p>
              <p className="responseText">Awaiting response...</p>
              <p className="statusEmoji"><Emoji symbol="????"/></p>
            </div>)

        /* Invited (by a challenger) */
        || (nextChallenge.status === 'invited' && nextChallenge.challengerId !== loggedInPlayer._id &&
          <div className="invitedChallengedView">
            <p className="challengedByText">Challenged by {getOpponentName()}</p>
            <p className="challengedDate">on {lastUpdatedFormatted}</p>
            <div className="challengedButtons">
              <button className="accept challengedButton" onClick={() => handleChallengeChange('inviteAccepted')}>Accept <Emoji symbol="????"/></button>
              <button className="decline challengedButton" onClick={() => handleChallengeChange('inviteDeclined')}>Decline <Emoji symbol="????"/></button>
            </div>
          </div>)

        /* Invite accepted - Result can be entered */
        || (nextChallenge.status === 'inviteAccepted' &&
        <div className="resultFormContainer">
          <form className="form" onSubmit={handleResult}>
            <p className="opponent"><Emoji className="opponentEmoji" symbol="????"/>vs {getOpponentName()}</p>
            <div className="winnerInput">
              <p className="winnerLabel">Did you win?</p>
              <input type="radio" id="yes" name="winner" value="yes" onChange={(event) => handleFormChange(event)} required/>
              <label htmlFor="yes">Yes</label>
              <input type="radio" id="no" name="winner" value="no" onChange={(event) => handleFormChange(event)} required/>
              <label htmlFor="no">No</label>
            </div>
            <div className="scoreInput">
              <label className="scoreLabel">Winning score</label>
              <input className="scoreText" name="score" type="text" placeholder="e.g. 4-6 7-6 (6-4) 6-2" required onChange={(event) => handleFormChange(event)}></input>
            </div>
            <textarea name="commentary" rows="2" cols="39" onChange={(event) => handleFormChange(event)} placeholder="optional commentary"></textarea>
            <br></br>
            <button className="formButton" type="submit" width="auto">Submit</button>
          </form>
        </div>)
      }
      </div>
    </>
  )
}
