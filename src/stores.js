import { writable } from 'svelte/store';

export let GoogleAuth = writable(undefined);
export let currentGoogleUser = writable(undefined);
export let shouldShowNav = writable(true);
