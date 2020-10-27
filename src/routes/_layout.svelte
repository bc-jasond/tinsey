<script>
  import Nav from '../components/Nav.svelte';
  import Burger from '../components/Burger.svelte';
  import { shouldShowNav } from '../stores';

  export let segment;
</script>

<style>
</style>

<Nav segment="{segment}" />
{#if !$shouldShowNav}
  <Burger isAbs />
{/if}
<slot />
