<script>
  export let segment;

  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { GoogleAuth, currentGoogleUser, shouldShowNav } from '../stores';
  import Burger from './Burger.svelte';

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
  {#if $shouldShowNav}
    <ul transition:fade|local="{{ duration: 250 }}" class="level-left">
      <li class="level-item">
        <h1
          class="title is-family-monospace has-text-grey"
          style="font-weight: 100"
        >
          tinsey
        </h1>
      </li>
      <li class="level-item">
        <a
          class="button is-rounded"
          class:is-info="{segment === undefined ? 'page' : undefined}"
          aria-current="{segment === undefined ? 'page' : undefined}"
          href="."
        >my schedule</a>
      </li>
      {#if $currentGoogleUser}
        <li class="level-item">
          <a
            class="button is-rounded"
            class:is-info="{segment === 'setup' ? 'page' : undefined}"
            aria-current="{segment === 'setup' ? 'page' : undefined}"
            href="setup"
          >setup</a>
        </li>
      {/if}
    </ul>
  {:else}
    <ul class="level-left"></ul>
  {/if}
  <ul class="level-right">
    {#if $shouldShowNav}
      <li transition:fade|local="{{ duration: 250 }}" class="level-item">
        {#if !$currentGoogleUser}
          <button class="button" on:click="{doLoginGoogle}">login with Google</button>
        {:else}
          <button
            class="button"
            on:click="{doLogoutGoogle}"
          >{$currentGoogleUser.givenName}
            ({$currentGoogleUser.email})</button>
        {/if}
      </li>
    {/if}
    <li>
      <Burger />
    </li>
  </ul>
</nav>
