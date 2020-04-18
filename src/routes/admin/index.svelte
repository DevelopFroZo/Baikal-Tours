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
      showFilter = false,
      group;

    if (params.offset !== undefined) offset = parseInt(params.offset);
    if (params.count !== undefined) count = parseInt(params.count);

    if (params.group !== undefined) {
      let groups = ["events", "active", "hidden", "archive"];
      let bl = false;
      for (let successGroup of groups) {
        if (params.group === successGroup) {
          group = successGroup;
          break;
        }
      }
    } else group = "events";

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
      paramsKeys[2] !== "offset" &&
      paramsKeys[2] !== "group"
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

      result_cards = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query
      });
    } else {
      result_cards = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query: {
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
      showFilter,
      group
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
  import { onMount } from "svelte";
  import ClickOutside from "/components/clickOutside.svelte";

  export let result_cards,
    result_filters,
    locale,
    filter,
    count,
    offset,
    result_count,
    showFilter,
    group;

  let options = [],
    cards = result_cards,
    search = filter[0][0].value;

  let cardsCounts = {
    active: 0,
    hidden: 0,
    archive: 0,
    allCards: 0
  };

  let pagData;

  $: {
    for (let key of Object.keys(cardsCounts)) cardsCounts[key] = 0;

    for (let i = 0; i < result_cards.length; i++) {
      cardsCounts[result_cards[i].status]++;
      cardsCounts.allCards++;
    }

    result_cards = result_cards.filter(
      el => !(group !== "events" && el.status !== group)
    );
    cards = result_cards.slice(offset, offset + count);
    result_count = result_cards.length;

    pagData = {
      allPags: Math.ceil(result_count / pagCards),
      pag: offset / count
    };

    if (showFilter) parseFilter = parseFilterDataForAdmin(filter);
  }

  const fetcher = new Fetcher();

  let pagCards = count,
    parseFilter = {};

  let url = {
    ...parseFilter,
    offset: (offset / count) * pagCards,
    count: pagCards,
    group: group
  };

  const _ = i18n(locale);

  for (let i = 0; i < 2; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

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
      count: pagCards,
      group: group
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
    var str = search.replace(/\s+/g, " ");
    str = str.replace(/[^ \u4e00-\u520fa-zа-яё\d]/giu, "");
    str = str.replace(/\ /g, ",");

    if (str.length !== 0) filter[0][0].active = true;
    else filter[0][0].active = false;

    filter[0][0].value = str;

    changeFilter();

    filter[0][0].value = search;
  }

  onMount(() => {
    localStorage.removeItem("adminActionParams");
  });

  function changeGroup(gr) {
    url.group = gr;
    setURL();
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

    & > button {
      border: 1px solid $Light_Blue;
      border-radius: 5px;
      -webkit-box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      -moz-box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      box-shadow: inset 0px 0px 5px 0px $Light_Blue;
      padding: 10px;
      font-size: $Big_Font_Size;
    }

    & > button:not(:first-child) {
      margin-left: 30px;
    }

    & > .active {
      background: rgba(103, 182, 255, 1);
      color: white;
      font-weight: bold;
      box-shadow: inset 0px 0px 6px rgba(0, 0, 0, 0.25);
      // border-color: $Medium_Gray;
    }
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
  }

  .option {
    position: absolute;
    top: 27px;
    left: 0;
    background: white;
    border: 1px solid $Dark_Gray;
    min-width: 100%;
    box-sizing: border-box;
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
    background: $Dark_Gray;
  }

  .hidden-status {
    background: $Light_Blue;
  }

  .full-event-block {
    margin-top: 15px;
  }
</style>

<svelte:head>
  <title>{_('actions')}</title>
</svelte:head>

<AdminPage page={0} {fetcher} {_} {locale}>
  <div class="events-status-block">
    <div class="event-statuses">
      <button
        class:active={group === 'events'}
        on:click={() => changeGroup('events')}>
        {_('actions')} {cardsCounts.allCards}
      </button>
      <button
        class:active={group === 'active'}
        on:click={() => changeGroup('active')}>
        {_('active')} {cardsCounts.active}
      </button>
      <button
        class:active={group === 'hidden'}
        on:click={() => changeGroup('hidden')}>
        {_('hidden')} {cardsCounts.hidden}
      </button>
      <button
        class:active={group === 'archive'}
        on:click={() => changeGroup('archive')}>
        {_('archive')} {cardsCounts.archive}
      </button>
    </div>
    <a href="./admin/action/edit" class="new-event">{_('new_event')}</a>
  </div>
  <div class="filter-block">
    <input
      type="text"
      placeholder={_('search_by_name')}
      bind:value={search}
      on:blur={checkSearchFilter}
      class="search-input"
      on:keyup={function(e) {
        if (e.key === 'Enter') this.blur();
      }} />
    <div class="select-block">
      <button
        class="select"
        bind:this={options[0].btn}
        on:click={() => {
          options[0].isVisible = true;
        }}>
        {_('thematics')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[0].isVisible = false)}
        exclude={[options[0].btn]}>
        {#if options[0].isVisible}
          <div class="option" bind:this={options[0].option}>
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
        {/if}
      </ClickOutside>
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[1].btn}
        on:click={() => {
          options[1].isVisible = true;
        }}>
        {_('location')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[1].isVisible = false)}
        exclude={[options[1].btn]}>
        {#if options[1].isVisible}
          <div class="option" bind:this={options[1].option}>
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
        {/if}
      </ClickOutside>
    </div>
  </div>
  <ActiveFilters
    {search}
    {filter}
    {showFilter}
    min={-1}
    max={3}
    on:closeFilter={closeFilter}
    white={true}
    {_} />
  <div class="events-block">
    {#each cards as card, i}
      <div class="full-event-block">
        <a
          class="event-block"
          on:click={() => localStorage.setItem('adminActionParams', document.location.href)}
          href={'./admin/action?id=' + card.id}>
          <div class="event">
            <div class="event-name-block">{card.name}</div>
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
                {_('active')}
              {:else if card.status === 'hidden'}
                {_('hidden')}
              {:else if card.status === 'archive'}{_('archive')}{/if}
            </div>
          </div>
        </a>
      </div>
    {/each}
  </div>
  <Pagination {pagData} on:clickPag={clickPag} />
</AdminPage>
