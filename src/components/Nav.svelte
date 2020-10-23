<script>
  export let segment;

  import { onDestroy } from 'svelte';
  import { GoogleAuth, currentGoogleUser } from '../stores';

  import { googleAuth, getGoogleUser } from '../common/google-auth';

  const googleAuthUnsubscribe = GoogleAuth.subscribe((auth) => {
    if (auth?.isSignedIn?.get?.()) {
      $currentGoogleUser = getGoogleUser(auth?.currentUser?.get?.());
    } else {
      $currentGoogleUser = undefined;
    }
  });

  onDestroy(googleAuthUnsubscribe);

  async function doLoginGoogle() {
    if (!$currentGoogleUser) {
      // open google window to let the user select a user to login as, or to grant access
      try {
        const user = await $GoogleAuth.signIn({ prompt: 'select_account' });
        $currentGoogleUser = getGoogleUser(user);
      } catch (err) {
        console.error(err);
        $currentGoogleUser = undefined;
      }
    }
  }

  async function doLogoutGoogle() {
    if (window.confirm('Logout?')) {
      await $GoogleAuth.signOut();
      // refresh GoogleAuth instance
      $GoogleAuth = await googleAuth();
      $currentGoogleUser = undefined;
    }
  }
</script>

<style>
</style>

<nav class="level p-3 m-0">
  <ul class="level-left">
    <li class="level-item">
      <a
        class="button is-rounded"
        class:is-info="{segment === undefined ? 'page' : undefined}"
        aria-current="{segment === undefined ? 'page' : undefined}"
        href="."
      >my schedule</a>
    </li>
    <li class="level-item">
      <a
        class="button is-rounded"
        class:is-info="{segment === 'setup' ? 'page' : undefined}"
        aria-current="{segment === 'setup' ? 'page' : undefined}"
        href="setup"
      >setup</a>
    </li>
  </ul>
  <ul class="level-right">
    <li class="level-item">
      {#if !$currentGoogleUser}
        <a class="button" on:click="{doLoginGoogle}">login with Google</a>
      {:else}
        <a
          class="button"
          on:click="{doLogoutGoogle}"
        >{$currentGoogleUser.email}</a>
      {/if}
    </li>
  </ul>
</nav>
