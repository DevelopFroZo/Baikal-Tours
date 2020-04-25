<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import {
    parseFilterData,
    setFilterData,
    setFilterFromUrl,
    showActiveFilters
  } from "/helpers/filter.js";
  import { isMobile } from "/helpers/validators.js";

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
      }),
      result_compiliations,
      query,
      compiliationQuery,
      result_favorites;

    filter[1] = setFilterData(result_filters.data.locations);
    filter[2] = setFilterData(result_filters.data.companions);
    filter[3] = setFilterData(result_filters.data.subjects);

    if (params.offset !== undefined) offset = parseInt(params.offset);
    if (params.count !== undefined) count = parseInt(params.count);

    let paramsKeys = Object.keys(params);

    if (
      paramsKeys.length > 0 &&
      paramsKeys[0] === "filter" &&
      paramsKeys[1] !== "count" &&
      paramsKeys[1] !== "offset"
    ) {
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

      let filterParams = parseFilterData(filter);
      query = filterParams.params;
      compiliationQuery = filterParams.compiliationsParams;

      result_compiliations = (await fetcher.get("/api/compiliations", {
        credentials: "same-origin",
        query: compiliationQuery
      })).data;

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
      result_compiliations = (await fetcher.get("/api/compiliations", {
        credentials: "same-origin"
      })).data;
    }

    if (params.subjects !== undefined) {
      let subjects = params.subjects.split(",");

      result_favorites = (await fetcher.get("/api/actions/", {
        credentials: "same-origin",
        query: {
          filter: "",
          favoritesOnly: "",
          subjects
        }
      })).actions;
    } else {
      result_favorites = (await fetcher.get("/api/actions/", {
        credentials: "same-origin",
        query: {
          favoritesOnly: ""
        }
      })).actions.slice(0, 4);
    }

    let result_count = result_cards.count;
    result_cards = result_cards.actions;

    let locale = session.locale;
    let mobile = isMobile(session["user-agent"]);

    return {
      result_cards,
      result_filters,
      locale,
      filter,
      showFilter,
      offset,
      count,
      result_count,
      result_compiliations,
      result_favorites,
      mobile
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
  import { onMount, afterUpdate } from "svelte";
  import ActiveFilters from "/components/active_filters.svelte";
  import Selection from "/components/selection.svelte";
  import { slide } from "svelte/transition";
  import * as animateScroll from "svelte-scrollto";
  import SimilarEvent from "/components/similar_event.svelte";
  import Carousel from "/components/carousel.svelte";
  import ClickOutside from "/components/clickOutside.svelte";

  export let result_cards,
    result_filters,
    locale,
    filter,
    showFilter,
    offset,
    count,
    result_count,
    result_compiliations,
    result_favorites,
    mobile;

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
    pagData,
    selectionsCarousel,
    start = false,
    head,
    scrollY,
    compiliations,
    swiper = null;

  let url = {
    ...parseFilter,
    offset: (offset / count) * pagCards,
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
      parseFilter = parseFilterData(filter).params;
      date = parseDateForActiveFilter(filter);
      price = parsePriceForActiveFilter(filter, _);
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

    parseFilter = parseFilterData(filter).params;
    parseFilter.count = pagCards;
    parseFilter.offset = pagData.pag * pagCards;

    showActiveFilters(filter);
    changePagAndURL(0);
  }

  function setPrice() {
    animateScroll.scrollTo({ offset: scrollY, duration: 300 });

    let bl = false;

    if (filter[4][0].value !== priceStart) {
      filter[4][0].value = priceStart;
      bl = true;
    }

    if (filter[4][1].value !== priceEnd) {
      filter[4][1].value = priceEnd;
      bl = true;
    }

    if (bl) changeFilter();
  }

  function setURL() {
    let URL = fetcher.makeQuery({ query: url });

    //#fix переписать логику на сторы
    goto(`/actions${URL}`);
  }

  function changePagAndURL(pagL) {
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

    animateScroll.scrollTo({ offset: head.offsetTop - 150, duration: 1500 });

    changePagAndURL(pagL);
  }

  onMount(() => {
    localStorage.removeItem("actionsParams");
  });

  function closePrice(e) {
    animateScroll.scrollTo({ offset: scrollY, duration: 300 });

    priceStart = "";
    priceEnd = "";

    setPrice();
  }

  function closeFilter(e) {
    filter = e.detail.filter;

    animateScroll.scrollTo({ offset: scrollY, duration: 300 });

    changeFilter();
  }

  function fLoad() {
    selectionsStart = true;
    if (start) startSelection();
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
    grid-template-columns: repeat(3, auto);
    justify-content: space-between;
    grid-row-gap: 30px;
    margin-top: 50px;
  }

  input:not([type="checkbox"]),
  .select {
    background: white;
    padding: 0 3px;
    font-size: $Big_Font_Size;
    width: 130px;
    padding: 25px 20px;
    box-sizing: border-box;
    color: #3b394a;

    &.date {
      position: relative;

      &:last-child {
        margin-left: 30px;
      }
    }

    &::placeholder {
      color: #3b394a;
    }
  }

  .select {
    width: 170px;
    height: 74px;
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

  .filters {
    background: #f5f7fa;
    padding: 45px 50px;
    margin: 30px 0 70px;
    display: flex;
    justify-content: space-between;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    width: 1300px;
    margin-left: -50px;
    box-sizing: border-box;
  }

  .selections-carousel {
    margin-top: 235px;
    overflow: hidden;
    position: relative;
  }

  .price-filter {
    position: relative;

    & > :global(div) {
      position: absolute;
      bottom: -20px;
      left: 0;
      width: 100%;
    }

    & input[type="range"] {
      width: 100%;
    }

    &:last-child > :global(div) {
      width: calc(100% - 30px);
      left: 30px;
    }
  }

  .prices {
    display: flex;
  }

  .selection-carousel {
    margin-top: 235px;
    opacity: 0;
    transition: 0.3s;

    & :global(.selection-block) {
      margin-left: 15px;
    }
  }

  .selection-carousel-loaded {
    opacity: 1;
  }

  .selections-block {
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    grid-row-gap: 40px;
    border-radius: 10px;
    margin-top: 60px;
  }

  #price-end {
    margin-left: 30px;
  }

  .two-input {
    position: relative;

    &::before {
      position: absolute;
      content: " ";
      width: 20px;
      height: 2px;
      background: #34353f;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
    }
  }

  .select::before {
    transform: rotate(90deg);
    width: 15px;
    height: 10px;
    right: 20px;
    background-image: url(../img/next.svg);
  }

  h2 {
    margin-top: 235px;
  }

  h2,
  h1 {
    font-family: $Playfair;
    color: #434343;
    font-size: $UltraBig_Font_Size;

    & > span {
      font-family: inherit;
      color: $Blue;
    }
  }

  h1 {
    margin-top: 100px;
  }

  .option {
    border: none;
    top: 100%;
    left: 0;
    width: 370px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
    visibility: visible;

    & > div {
      padding: 15px 20px;

      & > label {
        font-size: $Big_Font_Size;
        font-family: $Gilroy;
        color: #3b394a;
        width: calc(100% - 40px);
      }

      & > img {
        opacity: 0.3;
        height: 20px;
        margin-right: 10px;
      }
    }
  }

  .more-events {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 115px;

    & > h2 {
      font-size: 36px;
      margin: 0;
    }

    & > button {
      border-radius: 100px;
      background: $Dark_Blue_Gradient;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.15);
      color: white;
      padding: 15px 55px;
      font-family: $Gilroy;
      font-size: $LowBig_Font_Size;
      position: relative;

      & > img {
        position: absolute;
        bottom: 15px;
        right: 10px;
        width: 40px;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .filters {
      flex-direction: column;

      & > *:not(:first-child) {
        margin-top: 15px;
      }
    }

    .two-input {
      display: flex;
      justify-content: space-between;

      &:before {
        width: 10px;
      }

      & > input {
        margin: 0 !important;
        width: 125px;
        font-size: $Medium_Font_Size !important;
        padding: 15px 20px;
      }
    }

    #price-end,
    #price-start {
      margin: 0 !important;
      font-size: $Medium_Font_Size;
      padding: 15px 20px;
      width: 125px;
    }

    .select {
      padding: 15px 20px;
      height: auto;

      &:before {
        top: calc(50% - 3px);
      }
    }

    .option,
    .select {
      width: 100%;
      font-size: $Medium_Font_Size;

      & label {
        font-size: $Medium_Font_Size;
      }
    }

    .cards-block {
      grid-template-columns: repeat(1, 100%);
    }

    .selections-carousel {
      margin-top: 160px;
    }

    h1 {
      margin-top: 60px;
      font-size: 24px;
    }

    .filters {
      padding: 30px 10px;
      margin: 30px 0 60px;
      display: flex;
      justify-content: space-between;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      width: 100%;
      box-sizing: border-box;
    }

    .selections-block {
      grid-template-columns: repeat(1, 100%);
      grid-row-gap: 15px;
      margin-top: 30px;
    }

    .more-events {
      flex-direction: column;
      margin-top: 60px;

      & > h2 {
        font-size: 24px;
        width: 100%;
      }

      & > button {
        margin-top: 25px;
        display: block;
        width: 100%;
      }
    }

    .price-filter {
      & > :global(div) {
        width: 100% !important;
        top: 45px;
        padding: 0;
        left: 0 !important;
      }

      & input[type="range"]{
        padding: 0;
      }
    }
  }
</style>

<svelte:head>
  <title>{_('event_catalog')}</title>
  <link rel="stylesheet" href="https://unpkg.com/swiper/css/swiper.css" />
</svelte:head>

<svelte:window bind:scrollY />

<Header {locale} />
<!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}]} /> -->
<div class="form-width">

  <div class="selections-carousel">
    <Carousel
      data={{ slidesPerView: 'auto', slidesPerView: mobile ? 'auto' : 3, spaceBetween: mobile ? 10 : 30, slidesPerGroup: mobile ? 1 : 3, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, watchOverflow: false }}
      carouselData={result_compiliations}>
      {#each result_compiliations as compiliation}
        <Selection
          width={mobile ? 210 : 390}
          height={mobile ? 140 : 200}
          {...compiliation} />
      {/each}
    </Carousel>
  </div>

  <h1>{_('event_catalog')}</h1>

  <div class="filters">
    <div class="two-input">
      <input
        placeholder={_('date_from')}
        class="date"
        type="date"
        bind:value={filter[0][0].value}
        on:change={() => {
          animateScroll.scrollTo({ offset: scrollY, duration: 300 });
          changeFilter();
        }} />
      <input
        placeholder={_('date_by')}
        class="date"
        type="date"
        bind:value={filter[0][1].value}
        on:change={() => {
          animateScroll.scrollTo({ offset: scrollY, duration: 300 });
          changeFilter();
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
      <ClickOutside
        on:clickoutside={() => (options[0].isVisible = false)}
        exclude={[options[0].btn]}>
        {#if options[0].isVisible}
          <div class="option" bind:this={options[0].option} transition:slide>
            {#each filter[1] as city, i}
              <div
                on:click={() => {
                  city.active = !city.active;
                  animateScroll.scrollTo({ offset: scrollY, duration: 300 });
                  changeFilter();
                }}>
                <img src="/img/placeholder.svg" alt="place" />
                <label>{city.value}</label>
                <input type="checkbox" bind:checked={city.active} />
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
        {_('with_whom')}
      </button>
      <ClickOutside
        on:clickoutside={() => (options[1].isVisible = false)}
        exclude={[options[1].btn]}>
        {#if options[1].isVisible}
          <div class="option" bind:this={options[1].option} transition:slide>
            {#each filter[2] as companios}
              <div
                on:click={() => {
                  companios.active = !companios.active;
                  animateScroll.scrollTo({ offset: scrollY, duration: 300 });
                  changeFilter();
                }}>
                <label>{companios.value}</label>
                <input type="checkbox" checked={companios.active} />
              </div>
            {/each}
          </div>
        {/if}
      </ClickOutside>
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
      <ClickOutside
        on:clickoutside={() => (options[2].isVisible = false)}
        exclude={[options[2].btn]}>
        {#if options[2].isVisible}
          <div class="option" bind:this={options[2].option} transition:slide>
            {#each filter[3] as subjects}
              <div
                on:click={() => {
                  subjects.active = !subjects.active;
                  animateScroll.scrollTo({ offset: scrollY, duration: 300 });
                  changeFilter();
                }}>
                <label>{subjects.value}</label>
                <input type="checkbox" bind:checked={subjects.active} />
              </div>
            {/each}
          </div>
        {/if}
      </ClickOutside>
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
          class="price"
          on:click={() => {
            options[3].isVisible = true;
          }} />
        <!-- <ClickOutside
          on:clickoutside={() => (options[3].isVisible = false)}
          exclude={[options[3].btn]}>
          {#if options[3].isVisible}
            <input
              type="range"
              min={result_filters.data.prices[0].min}
              max={priceEnd === '' ? result_filters.data.prices[0].max - 1 : priceEnd}
              bind:value={priceStart}
              on:change={setPrice} />
          {/if}
        </ClickOutside> -->
      </div>
      <div class="price-filter">
        <input
          type="number"
          placeholder={_('to')}
          id="price-end"
          bind:value={priceEnd}
          on:blur={setPrice}
          bind:this={options[4].btn}
          class="price"
          on:click={() => {
            options[4].isVisible = true;
          }} />
        <!-- <ClickOutside
          on:clickoutside={() => (options[4].isVisible = false)}
          exclude={[options[4].btn]}>
          {#if options[4].isVisible}
            <input
              type="range"
              min={priceStart}
              max={result_filters.data.prices[0].max}
              bind:value={priceEnd}
              on:change={setPrice} />
          {/if}
        </ClickOutside> -->
      </div>
    </div>
  </div>

  <ActiveFilters
    {filter}
    {showFilter}
    {date}
    {price}
    min={0}
    max={4}
    {_}
    on:closeFilter={closeFilter}
    on:closePrice={closePrice} />

  <div class="selections-block">
    {#each result_favorites as favorite}
      <SimilarEvent {_} {favorite} />
    {/each}
  </div>

  <div class="more-events">
    <h2>{_('more_events')}</h2>
    <button class="show-card">
      {_('show_on_card')}
      <img src="/img/placeholder-map.svg" alt="placeholder" />
    </button>
  </div>

  <div class="cards-block" bind:this={head}>
    {#each cards as cardInfo (cardInfo.id)}
      <Card {...cardInfo} {locale} />
    {/each}
  </div>

  <Pagination {pagData} on:clickPag={clickPag} />
</div>
<Footer {locale} />
