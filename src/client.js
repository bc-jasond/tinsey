import * as sapper from '@sapper/app';

import { GoogleAuth, currentGoogleUser } from './stores';
import { getGoogleUser, googleAuth } from './common/google-auth';

googleAuth()
  .then((auth) => {
    GoogleAuth.set(auth);
    if (auth.isSignedIn.get()) {
      currentGoogleUser.set(getGoogleUser(auth.currentUser.get()));
    }
  })
  .catch((err) => console.error(err));

sapper.start({
  target: document.querySelector('#sapper'),
});
