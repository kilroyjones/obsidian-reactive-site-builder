<script>
  export let type = "submit";
  export let href = "";
  export let mode = null;
  export let disabled = false;
</script>

{#if href}
  <a {href} class={mode}>
    <slot />
  </a>
{:else}
  <!-- on:click is shorthand for event delegation -->
  <button {type} class={mode} on:click {disabled}>
    <slot />
  </button>
{/if}
