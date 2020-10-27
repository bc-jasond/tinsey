<script>
  export let isAbs = false;

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
  on:dblclick="{() => ($shouldShowNav = !$shouldShowNav)}"
  title="Double-click me to show/hide the menu bar"
>
  🍔
</span>
