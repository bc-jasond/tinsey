const { OAuth2Client } = require('google-auth-library');
const linkifyUrls = require('linkify-urls');

import { getUser, createUser, saveUser } from '../_database.js'; // the underscore tells Sapper this isn't a route
import exampleSchedule from '../../example-schedule';

async function verifyToken(token) {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_API_FILBERT_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_API_FILBERT_CLIENT_ID,
    });
    // LoginTicket api/node_modules/google-auth-library/build/src/auth/loginticket.d.ts
    const googleUser = ticket.getPayload();
    // const {
    //     email,
    //     given_name,
    //     family_name,
    //     picture,
    //     iss,
    //     exp,
    // } = googleUser;
    return googleUser;
  } catch (err) {
    console.error('verifyToken()', token, err);
  }
}

async function getOrCreateGoogleUser(token) {
  try {
    const googleUser = await verifyToken(token);
    if (!googleUser) {
      return;
    }
    const user = await getUser(googleUser);
    // TODO: update db if any values are different
    if (user) {
      return user;
    }

    const newlyCreatedUser = await createUser(googleUser);
    return newlyCreatedUser;
  } catch (err) {
    console.error('getOrCreateGoogleUser()', token, err);
  }
}

async function saveSchedule(token, schedule) {
  try {
    const googleUser = await verifyToken(token);
    if (!googleUser) {
      return;
    }
    const user = await getUser(googleUser);
    user.meta.schedule = schedule;
    return saveUser(user);
  } catch (err) {
    console.error('saveSchedule()', token, schedule, err);
  }
}

export async function get(req, res, next) {
  const { token } = req.params;
  let { dayOfWeek } = req.query;
  dayOfWeek = parseInt(dayOfWeek, 10);
  const loggedInUser = await getOrCreateGoogleUser(token);
  res.setHeader('Content-Type', 'application/json');

  let schedule = {};
  //console.log('loggedInUser', loggedInUser);
  // use fixture date?
  if (false) {
    schedule = exampleSchedule;
  } else if (loggedInUser) {
    const { meta = {} } = loggedInUser;
    ({ schedule = {} } = meta);
  }

  // format meetings as an array for a given day of the week 0-6
  if (Number.isInteger(dayOfWeek)) {
    schedule = Object.values(schedule)
      .filter((meeting) => meeting.days[dayOfWeek])
      .map((meeting) => {
        meeting.description = meeting.description.split('\n').join('<br />')
        meeting.description = linkifyUrls(meeting.description || '', {attributes:{class:"button is-text is-large", style:"padding: 0; vertical-align: baseline; height: 27px;"}})
        return meeting;
      })
      .sort(
        (
          {
            startTimeHour: startTimeHourLeft,
            startTimeMinute: startTimeMinuteLeft,
          },
          {
            startTimeHour: startTimeHourRight,
            startTimeMinute: startTimeMinuteRight,
          }
        ) =>
          `${startTimeHourLeft}${startTimeMinuteLeft}` <
          `${startTimeHourRight}${startTimeMinuteRight}`
            ? -1
            : 1
      );
  }

  // send raw map of meetings keyed off of meeting id unsorted
  res.end(JSON.stringify(schedule));
}

export async function put(req, res, next) {
  const { token } = req.params;
  const updatedUser = await saveSchedule(token, req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(updatedUser.meta.schedule));
}
