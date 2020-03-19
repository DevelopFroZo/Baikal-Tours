<script>
  import { createEventDispatcher } from "svelte";

  export let filter, showFilter, date = "", price = "", min, max, _, search = "";

  $: if(search !== "")
      filter[0][0].value = search;

  const dispatch = createEventDispatcher();

  function closeFilter() {
    dispatch("closeFilter", {
      filter: filter
    });
  }

  function closePrice() {
    dispatch("closePrice");
  }
</script>

<style lang="scss">
    @import "./styles/global.scss";

  .active-filter-block {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-style: italic;
    font-size: $Medium_Font_Size;
    margin-bottom: 28px;

    & > .filter-head {
      margin-top: 5px;
    }
  }

  .active-filter {
    padding: 3px 7px;
    background: $Medium_Gray;
    border-radius: 20px;
    display: flex;
    align-items: center;
    margin-left: 8px;
    margin-top: 5px;

    & > button {
      margin-left: 7px;
    }
  }
</style>

{#if showFilter}
  <div class="active-filter-block">
    <div class="filter-head">{_('you_have_chosen')}</div>
    {#if date !== ''}
      <div class="active-filter">
        {date}
        <button
          class="delete-filter"
          on:click={() => {
            filter[0][0].value = '';
            filter[0][1].value = '';
            closeFilter();
          }}>
          <img src="img/clear.png" alt="clear" />
        </button>
      </div>
    {/if}

    {#each filter as filt, i}
      {#if i > min && i < max}
        {#each filt as fl, j}
          {#if fl.active}
            <div class="active-filter">
              {fl.value}
              <button
                class="delete-filter"
                on:click={() => {
                  fl.active = false;
                  closeFilter();
                }}>
                <img src="img/clear.png" alt="clear" />
              </button>
            </div>
          {/if}
        {/each}
      {/if}
    {/each}

    {#if price !== ''}
      <div class="active-filter">
        {price}
        <button
          class="delete-filter"
          on:click={() => {
            closePrice();
          }}>
          <img src="img/clear.png" alt="clear" />
        </button>
      </div>
    {/if}
  </div>
{/if}
