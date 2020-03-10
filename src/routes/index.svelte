<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import { parseFilterData, setFilterData, setFilterFromUrl, showActiveFilters } from "/helpers/filter.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let params = page.query,
      filter = [
        [
          {
            value: "",
            active: false
          },
          {
            value: "",
            active: false
          }
        ],
        [],
        [],
        [],
        [
          {
            value: "",
            active: false
          },
          {
            value: "",
            active: false
          }
        ]
      ],
      result_cards,
      showFilter = false,
      offset = 0,
      count = 15;

    let result_filters = await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    });

    filter[1] = setFilterData(result_filters.data.locations);
    filter[2] = setFilterData(result_filters.data.companions);
    filter[3] = setFilterData(result_filters.data.subjects);

    if (params.offset !== undefined) offset = parseInt(params.offset);
    if (params.count !== undefined) count = parseInt(params.count);

    let paramsKeys = Object.keys(params);

    if (paramsKeys.length > 0 && paramsKeys[0] === "filter" && paramsKeys[1] !== "count" && paramsKeys[1] !== "offset") {
      showFilter = true;
      if (params.dateStart !== undefined) {
        filter[0][0].active = true;
        filter[0][0].value = params.dateStart;
      }
      if (params.dateEnd !== undefined) {
        filter[0][1].active = true;
        filter[0][1].value = params.dateEnd;
      }
      if (params.locations !== undefined) {
        filter[1] = setFilterFromUrl(params.locations.split(","), filter[1]);
      }
      if (params.companions !== undefined) {
        filter[2] = setFilterFromUrl(params.companions.split(","), filter[2]);
      }
      if (params.subjects !== undefined) {
        filter[3] = setFilterFromUrl(params.subjects.split(","), filter[3]);
      }
      if (params.priceMin !== undefined) {
        filter[4][0].active = true;
        filter[4][0].value = params.priceMin;
      }
      if (params.priceMax !== undefined) {
        filter[4][1].active = true;
        filter[4][1].value = params.priceMax;
      }

      let query = parseFilterData(filter);
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
          offset: offset
        }
      });
    }

    let result_count = result_cards.count;
    result_cards = result_cards.actions;

    let locale = session.locale;

    return {
      result_cards,
      result_filters,
      locale,
      filter,
      showFilter,
      offset,
      count,
      result_count
    };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import Card from "/components/card_of_event.svelte";
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import Pagination from "/components/pagination.svelte";
  import {
    parseDate,
    parseDateForActiveFilter,
    parsePriceForActiveFilter
  } from "/helpers/parsers.js";
  import i18n from "/helpers/i18n/index.js";
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";
  import ActiveFilters from "/components/active_filters.svelte";

  export let result_cards,
    result_filters,
    locale,
    filter,
    showFilter,
    offset,
    count,
    result_count;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let date = "",
    price = "",
    priceStart = "",
    priceEnd = "",
    resp,
    pagCards = count,
    cards = result_cards,
    leftRange = true,
    rightRange = true,
    parseFilter = {},
    pagData;

  let url = {
    ...parseFilter,
    offset: offset / count * pagCards,
    count: pagCards
  };

  let options = [];

  for (let i = 0; i < 5; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

  $: {
    cards = result_cards;
    pagData = {
      allPags: Math.ceil(result_count / pagCards),
      pag: offset / count
    };

    checkActiveFilter();
  }

  function checkActiveFilter() {
    if (showFilter) {
      parseFilter = parseFilterData(filter);
      date = parseDateForActiveFilter(filter);
      price = parsePriceForActiveFilter(filter, _);
    }
  }

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

  function changeFilter() {
    //change date status and her correct view
    if (
      new Date(filter[0][0].value) > new Date(filter[0][1].value) &&
      filter[0][0].value !== "" &&
      filter[0][1].value !== ""
    )
      filter[0][0].value = filter[0][1].value;

    filter[0][0].active = filter[0][0].value === "" ? false : true;
    filter[0][1].active = filter[0][1].value === "" ? false : true;

    date = parseDateForActiveFilter(filter);

    if (filter[0][0].active && filter[0][1].active)
      date = filter[0][0].value + " - " + filter[0][1].value;
    else if (filter[0][0].active) date = filter[0][0].value;
    else if (filter[0][1].active) date = filter[0][1].value;
    else date = "";

    //change price status and her correct

    if (
      filter[4][0].value > filter[4][1].value &&
      filter[4][0].value !== "" &&
      filter[4][1].value !== ""
    ) {
      priceStart = filter[4][1].value;
      filter[4][0].value = filter[4][1].value;
    }

    if (filter[4][0].value === "" || filter[4][0].value === undefined)
      filter[4][0].active = false;
    else filter[4][0].active = true;

    if (filter[4][1].value === "" || filter[4][1].value === undefined)
      filter[4][1].active = false;
    else filter[4][1].active = true;

    price = parsePriceForActiveFilter(filter, _);

    parseFilter = parseFilterData(filter);
    parseFilter.count = pagCards;
    parseFilter.offset = pagData.pag * pagCards;

    showActiveFilters(filter);
    changePagAndURL(0);
  }

  function setPrice() {
    filter[4][0].value = priceStart;
    filter[4][1].value = priceEnd;

    changeFilter();
  }

  function setURL() {
    let URL = fetcher.makeQuery({ query: url });

    //#fix переписать логику на сторы
    goto(URL);
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

  async function clickPag(e) {
    let pagL = e.detail.pagL;

    changePagAndURL(pagL);
  }

  onMount(() => {
    localStorage.removeItem("actionsParams");
  });

  function closePrice(e){
    priceStart = '';
    priceEnd = '';

    setPrice();
  }

  function closeFilter(e){
    filter = e.detail.filter;

    changeFilter();
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 15px auto 15px;
    min-height: calc(100vh - 175px - 60px);
  }

  .cards-block {
    display: grid;
    grid-template-columns: repeat(3, 300px);
    justify-content: space-between;
    grid-row-gap: 41px;
  }

  input,
  .select {
    border: 1px solid #7b7b7b66;
    background: white;
    font-style: italic;
    padding: 0 3px;
    font-size: 13px;
    height: 23px;

    &[type="date"] {
      padding: 0;
    }

    &.date {
      width: 70px;
      position: relative;
    }

    &[type="number"] {
      width: 70px;
    }
  }

  .date::-webkit-inner-spin-button,
  .date::-webkit-clear-button {
    display: none;
    -webkit-appearance: none;
  }

  .date::-webkit-calendar-picker-indicator {
    background-color: transparent;
    position: absolute;
    right: 3px;
    top: 50%;
    transform: translateY(-50%);
  }

  #date-end,
  #price-end {
    margin-left: -5px;
  }

  h1 {
    font-weight: normal;
    font-size: $MaxBig_Font_Size;
  }

  .filters {
    background: $Light_Gray;
    padding: 18px 20px;
    margin: 20px 0 15px;
    display: flex;
    justify-content: space-between;
  }

  .price-filter {
    position: relative;

    & > div {
      position: absolute;
      top: 20px;
      left: 0;
      width: calc(100% - 10px);

      & > input {
        width: 100%;
      }
    }
  }

  .prices {
    display: flex;
  }

  .hide-range {
    visibility: hidden;
  }

  @media only screen and (max-width: 768px) {
    .filters {
      flex-direction: column;

      & > div {
        margin: 5px auto 0;
        width: 200px;

        & > input,
        & > button {
          width: 100%;
        }
      }
    }

    .two-input {
      display: flex;

      & > input {
        width: 50%;
        padding: 0 3px;
        box-sizing: border-box;
      }

      & > div {
        width: 50%;
        box-sizing: border-box;

        & > input {
          width: 100%;
          padding: 0 3px;
          box-sizing: border-box;
        }
      }
    }

    #price-end,
    #date-end {
      margin-left: -1px;
      width: calc(100% + 1px);
    }

    .cards-block {
      grid-template-columns: repeat(1, 100%);
    }
  }
</style>

<svelte:head>
  <title>{_('event_catalog')}</title>
</svelte:head>

<svelte:window on:click={hideAll} />

<Header {locale} />
<!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}]} /> -->
<div class="form-width">
  <h1>{_('event_catalog')}</h1>
  <div class="filters">
    <div class="two-input">
      <input
        placeholder={_('date_from')}
        class="date"
        type="text"
        bind:value={filter[0][0].value}
        on:change={changeFilter}
        on:focus={function(e) {
          e.target.type = 'date';
        }}
        on:blur={function(e) {
          e.target.type = 'text';
        }} />
      <input
        placeholder={_('date_by')}
        class="date"
        type="text"
        bind:value={filter[0][1].value}
        on:change={changeFilter}
        on:focus={function(e) {
          e.target.type = 'date';
        }}
        on:blur={function(e) {
          e.target.type = 'text';
        }}
        id="date-end" />
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[0].btn}
        on:click={() => {
          options[0].isVisible = true;
        }}>
        {_('where')}
      </button>
      <div
        class="option"
        class:option-visible={options[0].isVisible}
        bind:this={options[0].option}>
        {#each filter[1] as city, i}
          <div
            on:click={() => {
              city.active = !city.active;
              changeFilter();
            }}>
            <label>{city.value}</label>
            <input type="checkbox" bind:checked={city.active} />
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
        {_('with_whom')}
      </button>
      <div
        class="option"
        class:option-visible={options[1].isVisible}
        bind:this={options[1].option}>
        {#each filter[2] as companios}
          <div
            on:click={() => {
              companios.active = !companios.active;
              changeFilter();
            }}>
            <label>{companios.value}</label>
            <input type="checkbox" checked={companios.active} />
          </div>
        {/each}
      </div>
    </div>
    <div class="select-block">
      <button
        class="select"
        bind:this={options[2].btn}
        on:click={() => {
          options[2].isVisible = true;
        }}>
        {_('thematics')}
      </button>
      <div
        class="option"
        class:option-visible={options[2].isVisible}
        bind:this={options[2].option}>
        {#each filter[3] as subjects}
          <div
            on:click={() => {
              subjects.active = !subjects.active;
              changeFilter();
            }}>
            <label>{subjects.value}</label>
            <input type="checkbox" bind:checked={subjects.active} />
          </div>
        {/each}
      </div>
    </div>
    <div class="prices two-input">
      <div class="price-filter">
        <input
          type="number"
          placeholder={_('price_from')}
          id="price-start"
          bind:value={priceStart}
          on:blur={setPrice}
          bind:this={options[3].btn}
          on:click={() => {
            options[3].isVisible = true;
          }} />
        <div
          class:hide-range={!options[3].isVisible}
          bind:this={options[3].option}>
          <input
            type="range"
            min={result_filters.data.prices[0].min}
            max={priceEnd === '' ? result_filters.data.prices[0].max - 1 : priceEnd}
            bind:value={priceStart}
            on:change={setPrice} />
        </div>
      </div>
      <div class="price-filter">
        <input
          type="number"
          placeholder={_('to')}
          id="price-end"
          bind:value={priceEnd}
          on:blur={setPrice}
          bind:this={options[4].btn}
          on:click={() => {
            options[4].isVisible = true;
          }} />
        <div
          class:hide-range={!options[4].isVisible}
          bind:this={options[4].option}>
          <input
            type="range"
            min={priceStart}
            max={result_filters.data.prices[0].max}
            bind:value={priceEnd}
            on:change={setPrice} />
        </div>
      </div>
    </div>
  </div>
  
  <ActiveFilters {filter} {showFilter} {date} {price} min={0} max={4} {_} on:closeFilter={closeFilter} on:closePrice={closePrice}/>

  <div class="cards-block">
    {#each cards as cardInfo (cardInfo.id)}
      <Card {...cardInfo} {locale} />
    {/each}
  </div>

  <Pagination {pagData} on:clickPag={clickPag} />
</div>
<Footer {locale} />
