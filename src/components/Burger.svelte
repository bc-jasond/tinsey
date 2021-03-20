<script>
  import { shouldShowNav } from '../stores';
</script>

<style>
  .burger {
    cursor: pointer;
    font-size: 3rem;
    user-select: none;
    line-height: 1;
  }
</style>

<span
  class="burger"
  on:click="{() => ($shouldShowNav = !$shouldShowNav)}"
  title="Click me to show/hide the menu bar"
>
  🍔
</span>
