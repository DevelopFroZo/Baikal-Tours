<script>
  import { createEventDispatcher } from "svelte";
  export let pagList, pag, allPags;

  const dispatch = createEventDispatcher();

  function changePag(pagL) {
    dispatch("clickPag", {
      pagL: pagL
    });
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .active-pag {
    color: lightseagreen;
  }

  .pag-block > button {
    margin-right: 5px;
  }
</style>

{#if allPags !== 1}
  <div class="pag-block">
    {#if pag > 0}
      <button on:click={() => changePag(pag - 1)}>←</button>
    {/if}
    {#if pag > 2 && allPags > 5}
      <button on:click={() => changePag(0)} class:active-pag={pag === 0}>
        1
      </button>
      {#if pag > 3}
        <span>...</span>
      {/if}
    {/if}
    {#each pagList as pagL}
      <button on:click={() => changePag(pagL)} class:active-pag={pag === pagL}>
        {pagL + 1}
      </button>
    {/each}
    {#if pag < allPags - 3 && allPags > 5}
      {#if pag < allPags - 4}
        <span>...</span>
      {/if}
      <button
        on:click={() => changePag(allPags - 1)}
        class:active-pag={pag === allPags - 1}>
        {allPags}
      </button>
    {/if}
    {#if pag < allPags - 1}
      <button on:click={() => changePag(pag + 1)}>→</button>
    {/if}
  </div>
{/if}