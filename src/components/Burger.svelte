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
  .abs {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0.75rem;
  }
</style>

<div
  class="burger"
  class:abs="{isAbs}"
  on:dblclick="{() => ($shouldShowNav = !$shouldShowNav)}"
  title="Double-click me to show/hide the menu bar"
>
  🍔
</div>
