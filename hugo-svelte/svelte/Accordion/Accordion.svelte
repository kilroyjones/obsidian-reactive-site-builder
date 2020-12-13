<script>
  import { createEventDispatcher, setContext } from "svelte";
  import { selected } from "./store.js";
  import Section, { ACCORDION } from "./AccordionSection.svelte";

  export let value = undefined;
  export let className = "";
  const dispatch = createEventDispatcher();
  $: isControlled = typeof value !== "undefined";
  $: if (isControlled) {
    selected.set(value);
  }
  let currentSelected;

  const unsubscribe = selected.subscribe((value) => {
    currentSelected = value;
  });
  const handleChange = function (newValue) {
    console.log(isControlled, newValue, currentSelected);
    if (currentSelected === newValue) {
      selected.set(undefined);
    } else if (!isControlled) {
      selected.set(newValue);
    } else {
    }
    dispatch("change", newValue);
  };
  setContext(ACCORDION, {
    handleChange,
    selected,
  });
</script>

<style>
  .accordion {
    list-style: none;
  }
</style>

<div class={`accordion ${className}`}>
  <slot />
</div>
