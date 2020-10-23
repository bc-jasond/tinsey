const { OAuth2Client } = require('google-auth-library');

import { getUser, createUser } from '../_database.js'; // the underscore tells Sapper this isn't a route

async function getOrCreateGoogleUser(token) {
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

export async function get(req, res, next) {
  // the `slug` parameter is available because this file
  // is called [slug].json.js
  const { token } = req.params;
  let { dayOfWeek } = req.query;
  dayOfWeek = parseInt(dayOfWeek, 10);
  const loggedInUser = await getOrCreateGoogleUser(token);
  res.setHeader('Content-Type', 'application/json');

  let schedule = {};
  console.log('loggedInUser', loggedInUser);
  if (loggedInUser) {
    const { meta = {} } = loggedInUser;
    ({ schedule = {} } = meta);
  }

  // format meetings as an array for a given day of week 0-6
  if (Number.isInteger(dayOfWeek)) {
    schedule = Object.values(schedule)
      .filter((meeting) => meeting.days.includes(dayOfWeek))
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

  // send raw map of meetings keyed off of meeting id
  res.end(JSON.stringify(schedule));
}

export async function put(req, res, next) {
  next();
}
