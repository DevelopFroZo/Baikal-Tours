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

    let filter = [
        [
          {
            value: "",
            active: false
          }
        ],
        [],
        []
      ],
      offset = 0,
      count = 15,
      params = page.query,
      result_cards,
      showFilter = false;

    if (params.offset !== undefined) offset = parseInt(params.offset);
    if (params.count !== undefined) count = parseInt(params.count);

    let result_filters = await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    });

    filter[1] = setFilterData(result_filters.data.subjects);
    filter[2] = setFilterData(result_filters.data.locations);

    let paramsKeys = Object.keys(params);

    if (
      paramsKeys.length > 1 &&
      paramsKeys[0] === "filter" &&
      paramsKeys[2] !== "count" &&
      paramsKeys[2] !== "offset"
    ) {
      showFilter = true;
      if (params.search !== undefined) {
        filter[0][0].value = params.search;
        filter[0][0].active = true;
      }
      if (params.locations !== undefined) {
        filter[2] = setFilterFromUrl(params.locations.split(","), filter[2]);
      }
      if (params.subjects !== undefined) {
        filter[1] = setFilterFromUrl(params.subjects.split(","), filter[1]);
      }

      let query = parseFilterDataForAdmin(filter);
      query.offset = offset;
      query.count = count;

      result_cards = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query
      });
    } else {
      result_cards = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query: {
          count: count,
          offset: offset,
          allStatuses: ""
        }
      });
    }

    let locale = session.locale;

    let result_count = result_cards.count;
    result_cards = result_cards.actions;

    return {
      result_cards,
      result_filters,
      locale,
      filter,
      offset,
      count,
      result_count,
      showFilter
    };
  }
</script>

<script>
  import AdminPage from "./_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { parseDateForCards } from "/helpers/parsers.js";
  import Pagination from "/components/pagination.svelte";
  import { goto } from "@sapper/app";
  import ActiveFilters from "/components/active_filters.svelte";

  export let result_cards,
    result_filters,
    locale,
    filter,
    count,
    offset,
    result_count,
    showFilter;

  let options = [],
    cards = result_cards;

  $: {
    cards = result_cards;
    pagData = {
      allPags: Math.ceil(result_count / pagCards),
      pag: offset / count
    };

    if (showFilter) parseFilter = parseFilterDataForAdmin(filter);
  }

  const fetcher = new Fetcher();

  let pagCards = count,
    parseFilter = {};

  let cardsCounts = {
    active: 0,
    hidden: 0,
    archive: 0
  };

  let pagData = {
    allPags: Math.ceil(result_count / pagCards),
    pag: offset / count
  };

  let url = {
    ...parseFilter,
    offset: (offset / count) * pagCards,
    count: pagCards
  };

  for (let i = 0; i < result_cards.length; i++) {
    switch (result_cards[i].status) {
      case "active":
        cardsCounts.active++;
        break;
      case "hidden":
        cardsCounts.hidden++;
        break;
      case "archive":
        cardsCounts.archive++;
        break;
    }
  }

  const _ = i18n(locale);

  for (let i = 0; i < 2; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

  function hideAll(e) {
    for (let i = 0; i < options.length; i++) {
      e = e || event;
      let target = e.target || e.srcElement;
      const its_menu =
        target == options[i].option || options[i].option.contains(target);
      const its_btnMenu = target == options[i].btn;
      if (!its_menu && !its_btnMenu) options[i].isVisible = false;
    }
  }

  function setURL() {
    let URL = fetcher.makeQuery({ query: url });

    //#fix переписать логику на сторы
    goto("/admin" + URL);
  }

  function changePagAndURL(pagL) {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    pagData.pag = pagL;

    url = {
      ...parseFilter,
      offset: pagData.pag * pagCards,
      count: pagCards
    };

    setURL();
  }

  function clickPag(e) {
    let pagL = e.detail.pagL;

    changePagAndURL(pagL);
  }

  function changeFilter() {
    parseFilter = parseFilterDataForAdmin(filter);
    parseFilter.count = pagCards;
    parseFilter.offset = pagData.pag * pagCards;

    changePagAndURL(0);
    showFilter = showActiveFilters(filter);
  }

  function closeFilter(e) {
    filter = e.detail.filter;

    changeFilter();
  }

  function checkSearchFilter() {
    var str = filter[0][0].value.replace(/\s+/g, " ");

    if (str.length !== 0) filter[0][0].active = true;
    else filter[0][0].active = false;

    filter[0][0].value = str;
    changeFilter();
  }

  async function changeFavorite(i) {
    cards[i].is_favorite = !cards[i].is_favorite;

    let test = await fetcher.put("/api/actions/" + cards[i].id, {
      isFavorite: cards[i].is_favorite
    });
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .events-status-block {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
  }

  .event-statuses {
    display: flex;

    & > div {
      border: 1px solid $Light_Blue;
      border-radius: 5px;
      -webkit-box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      -moz-box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      padding: 10px;
      font-size: $Big_Font_Size;
    }

    & > div:not(:first-child) {
      margin-left: 30px;
    }

    & > .events {
      background: rgba(103, 182, 255, 1);
      color: white;
      font-weight: bold;
      box-shadow: inset 0px 0px 6px rgba(0, 0, 0, 0.25);
      // border-color: $Medium_Gray;
    }
  }

  .new-event {
    border: 1px solid $Green;
    border-radius: 5px;
    padding: 10px;
    font-size: $Big_Font_Size;
    background: $Green;
    color: white;
    box-shadow: inset 0px 0px 6px #67b6ff;
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
  }

  .option-visible {
    visibility: visible;
  }

  .filter-block {
    margin-top: 25px;
  }

  .event-block {
    display: flex;
    background: white;
    font-size: $Medium_Font_Size;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    & > .event {
      width: 100%;
      padding: 10px;
    }

    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .event-name-block {
    display: flex;
    align-items: flex-end;
    font-weight: bold;

    & > img {
      width: 21px;
      margin-right: 11px;
      visibility: hidden;
    }
  }

  .event-info-block {
    display: flex;
    margin-top: 18px;

    & > div {
      flex: calc(10 / 3);
      padding-right: 15px;
    }
  }

  .events-block {
    margin-top: 30px;
  }

  .event-status-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .event-status {
    width: 85px;
    position: relative;
    font-weight: bold;
    box-shadow: inset 0px 0px 7px rgba(0, 0, 0, 0.25);

    & > div {
      color: white;
    }
  }

  .active-status {
    background: $Green;
  }

  .archive-status {
    background: $Gray;
  }

  .hidden-status {
    background: $Light_Blue;
  }

  .full-event-block {
    position: relative;

    & > button {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1;
    }
  }
</style>

<svelte:head>
  <title>События</title>
</svelte:head>

<svelte:window on:click={hideAll} />

<AdminPage page={0}>
  <div class="events-status-block">
    <div class="event-statuses">
      <div class="events">События {result_count}</div>
      <div>Активные {cardsCounts.active}</div>
      <div>Скрытые {cardsCounts.hidden}</div>
      <div>Архив {cardsCounts.archive}</div>
    </div>
    <a href="./admin/edit" class="new-event">Новое событие</a>
  </div>
  <div class="filter-block">
    <input
      type="text"
      placeholder="поиск по названию"
      bind:value={filter[0][0].value}
      on:blur={checkSearchFilter}
      class="search-input" />
    <div class="select-block">
      <button
        class="select"
        bind:this={options[0].btn}
        on:click={() => {
          options[0].isVisible = true;
        }}>
        Тематика
      </button>
      <div
        class="option"
        class:option-visible={options[0].isVisible}
        bind:this={options[0].option}>
        {#each filter[1] as subject}
          <div
            on:click={() => {
              subject.active = !subject.active;
              changeFilter();
            }}>
            <label>{subject.value}</label>
            <input type="checkbox" bind:checked={subject.active} />
          </div>
        {/each}
      </div>
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[1].btn}
        on:click={() => {
          options[1].isVisible = true;
        }}>
        Локация
      </button>
      <div
        class="option"
        class:option-visible={options[1].isVisible}
        bind:this={options[1].option}>
        {#each filter[2] as location}
          <div
            on:click={() => {
              location.active = !location.active;
              changeFilter();
            }}>
            <label>{location.value}</label>
            <input type="checkbox" bind:checked={location.active} />
          </div>
        {/each}
      </div>
    </div>
  </div>
  <ActiveFilters
    {filter}
    {showFilter}
    min={-1}
    max={3}
    on:closeFilter={closeFilter}
    {_} />
  <div class="events-block">
    {#each cards as card, i}
      <div class="full-event-block">
        <button on:click={() => changeFavorite(i)}>
          {#if !card.is_favorite}
            <img src="/img/star.png" />
          {:else}
            <img src="/img/favorite-star.png" />
          {/if}
        </button>
        <a class="event-block" href={'./admin/action?id=' + card.id}>
          <div class="event">
            <div class="event-name-block">
              <img src="/img/star.png" />
              {card.name}
            </div>
            <div class="event-info-block">
              <div>{card.subjects.join('; ')}</div>
              <div>
                {parseDateForCards(card.date_starts, card.date_ends, _)}
              </div>
              <div>{card.locations.join('; ')}</div>
            </div>
          </div>
          <div
            class="event-status"
            class:active-status={card.status === 'active'}
            class:archive-status={card.status === 'archive'}
            class:hidden-status={card.status === 'hidden'}>
            <div class="event-status-text">
              {#if card.status === 'active'}
                Активное
              {:else if card.status === 'hidden'}
                Скрытое
              {:else if card.stauts === 'archive'}Архив{/if}
            </div>
          </div>
        </a>
      </div>
    {/each}
  </div>
  <Pagination {pagData} on:clickPag={clickPag} />
</AdminPage>
