// also refreshes the Oauth2 token
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.async = true;
    tag.defer = true;
    tag.onload = resolve;
    tag.onerror = reject;
    tag.src = src;
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(tag);
  });
}

export async function googleAuth() {
  if (!window.gapi) {
    await loadScript('https://apis.google.com/js/platform.js');
  }
  if (!window.gapi.auth2) {
    await new Promise((resolve) => window.gapi.load('auth2', resolve));
    await window.gapi.auth2.init({
      client_id: process.env.GOOGLE_API_FILBERT_CLIENT_ID,
    });
  }
  return window.gapi.auth2.getAuthInstance(); // GoogleAuth
}

export function getGoogleUser(user) {
  if (!user.getBasicProfile) {
    return {};
  }
  const profile = user.getBasicProfile();
  return {
    name: profile.getName(),
    givenName: profile.getGivenName(),
    imageUrl: profile.getImageUrl(),
    email: profile.getEmail(),
    idToken: user.getAuthResponse().id_token,
  };
}

export async function googleGetLoggedInUser() {
  // Pace.start();
  const GoogleAuth = await googleAuth();
  // Pace.stop();
  if (!GoogleAuth.isSignedIn.get()) {
    return false;
  }
  return GoogleAuth.currentUser.get();
}
