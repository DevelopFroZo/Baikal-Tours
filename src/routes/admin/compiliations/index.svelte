<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import {
    setFilterData,
    parseFilterDataForAdmin,
    setFilterFromUrl,
    showActiveFilters
  } from "/helpers/filter.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let locale = session.locale;

    let result_compiliations = (await fetcher.get("api/compiliations", {
      credentials: "same-origin"
    })).data;

    return {
      result_compiliations,
      locale
    };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let locale, result_compiliations;

  const _ = i18n(locale);
  const fetcher = new Fetcher();
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .head-line {
    display: flex;
    align-items: center;
    margin-top: 20px;
    justify-content: space-between;
  }

  h3 {
    text-align: center;
    margin-top: 30px;
  }

  .compiliations-block {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(3, 200px);
    justify-content: space-between;
    grid-row-gap: 20px;
  }

  .compiliation-block {
    display: block;
    background: white;
    font-size: $Medium_Font_Size;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    padding: 10px;
  }

  .select-block {
    position: relative;
  }

  .select {
    width: 190px;
    height: 22px;
    text-align: left;
    position: relative;
    color: #00000099;
    background: white;
    border: 1px solid black;
    border-radius: 5px;
    padding-left: 12px;
    box-sizing: border-box;
    margin-top: 0;

    &::before {
      position: absolute;
      content: " ";
      width: 10px;
      height: 4px;
      top: 50%;
      right: 5px;
      transform: translateY(-50%);
      background-image: url(../img/change.png);
      background-size: 100% 100%;
    }
  }

  .option {
    position: absolute;
    top: 27px;
    left: 0;
    background: white;
    border: 1px solid $Dark_Gray;
    min-width: 100%;
    box-sizing: border-box;
    visibility: hidden;
    z-index: 2;
    max-height: 300px;
    overflow: auto;

    & > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      padding: 0 5px;

      & > input {
        margin-left: 5px;
      }
    }
  }

  .filter-block {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
  }

  .option-visible {
    visibility: visible;
  }
</style>

<AdminPage page={6} {fetcher} {locale} {_}>
  <div class="head-line">
    <h1>{_('selections')}</h1>
    <a href="/admin/compiliations/edit" class="new-compilation">
      {_('new_compilation')}
    </a>
  </div>

  <div class="compiliations-block">
    {#if result_compiliations.length > 0}
      {#each result_compiliations as compiliation}
        <a
          href={`/admin/compiliations/compiliation?url=${compiliation.url}`}
          class="compiliation-block">
          <h2>{compiliation.name}</h2>
        </a>
      {/each}
    {:else}
      <h3>{_('compiliations_not_found')}</h3>
    {/if}
  </div>
</AdminPage>
