<script context = "module">
  export async function preload(page, session) {
    let response = await this.fetch("/api/actions", {
      credentials: "same-origin"
    });
    let result_cards = await response.json();

    response = await this.fetch("/api/dataForFilters", {
      credentials: "same-origin"
    } );
    let result_filters = await response.json();
    let locale = session.locale;
    return { result_cards, result_filters, locale };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import Card from "/components/card_of_event.svelte";
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { onMount } from "svelte";
  import Fetcher from "/helpers/fetcher.js";
  import { parseDate } from "/helpers/parsers.js";
  import i18n from "/helpers/i18n/index.js";

  export let result_cards, result_filters, locale;
  const fetcher = new Fetcher();
  const _ = i18n( locale );

  let date = "",
    price = "",
    showFilter = false,
    priceStart = "",
    priceEnd = "",
    resp,
    cards = result_cards.data,
    start,
    arrData,
    dateStart,
    dateEnd,
    leftRange = true,
    rightRange = true;

  let options = [
    {
      isVisible: false,
      option: null,
      btn: null
    },
    {
      isVisible: false,
      option: null,
      btn: null
    },
    {
      isVisible: false,
      option: null,
      btn: null
    },
    {
      isVisible: false,
      option: null,
      btn: null
    },
    {
      isVisible: false,
      option: null,
      btn: null
    }
  ];

  let filter = [
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
  ];

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

    if (filter[4][0].active && filter[4][1].active)
      price = _("from") + " " + filter[4][0].value + "₽ " + _("to") + " " + filter[4][1].value + "₽";
    else if (filter[4][0].active) price = _("from") + " " + filter[4][0].value + "₽";
    else if (filter[4][1].active) price = _("to") + " " + filter[4][1].value + "₽";
    else price = "";

    //show active filters

    let params = {
      filter: ""
    };

    if (filter[0][0].active) {
      dateStart = new Date(filter[0][0].value).toISOString();
      params.dateStart = parseDate(new Date(dateStart));
    }

    if (filter[0][1].active) {
      dateEnd = new Date(filter[0][1].value).toISOString();
      params.dateEnd = parseDate(new Date(dateEnd));
    }

    arrData = getActiveOption(1);
    if (arrData.length !== 0) params.locations = arrData;

    arrData = getActiveOption(2);
    if (arrData.length !== 0) params.companions = arrData;

    arrData = getActiveOption(3);
    if (arrData.length !== 0) params.subjects = arrData;

    if (filter[4][0].active) params.priceMin = parseInt(filter[4][0].value);

    if (filter[4][1].active) params.priceMax = parseInt(filter[4][1].value);

    showFilter = false;
    for (let i = 0; i < filter.length; i++) {
      for (let j = 0; j < filter[i].length; j++) {
        if (filter[i][j].active) {
          showFilter = true;
          break;
        }
      }
    }

    getFilterData(params);
  }

  async function getFilterData(params) {
    let filterStatus = await fetcher.get("api/actions", { params });

    if (filterStatus.ok) cards = filterStatus.data;
  }

  function getActiveOption(category) {
    var data = [];
    for (var i = 0; i < filter[category].length; i++) {
      if (filter[category][i].active) data.push(filter[category][i].id);
    }
    return data;
  }

  function setPrice() {
    filter[4][0].value = priceStart;
    filter[4][1].value = priceEnd;

    changeFilter()
  }

  function setFilterData(category, res) {
    for (let i = 0; i < res.length; i++) {
      filter[category] = [
        ...filter[category],
        {
          id: res[i].id,
          value: res[i].name,
          active: false
        }
      ];
    }
  }

  setFilterData(1, result_filters.data.locations);
  setFilterData(2, result_filters.data.companions);
  setFilterData(3, result_filters.data.subjects);
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

  .select {
    width: 140px;
    height: 25px;
    text-align: left;
    position: relative;
    color: #00000099;

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

  .select-block {
    position: relative;
  }

  .option {
    position: absolute;
    top: 27px;
    left: 0;
    background: white;
    border: 1px solid #7b7b7b;
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

  .option-visible {
    visibility: visible;
  }

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
  <title>{_("event_catalog")}</title>
</svelte:head>

<svelte:window on:click={hideAll} />

<Header locale={locale}/>
<!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}]} /> -->
<div class="form-width">
  <h1>{_("event_catalog")}</h1>
  <div class="filters">
    <div class="two-input">
      <input
        placeholder={_("date_from")}
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
        placeholder={_("date_by")}
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
        {_("where")}
      </button>
      <div
        class="option"
        class:option-visible={options[0].isVisible}
        bind:this={options[0].option}>
        {#each filter[1] as city, i}
          <div on:click={() => (city.active = !city.active)}>
            <label>{city.value}</label>
            <input type="checkbox" bind:checked={city.active} on:change={changeFilter}/>
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
        {_("with_whom")}
      </button>
      <div
        class="option"
        class:option-visible={options[1].isVisible}
        bind:this={options[1].option}>
        {#each filter[2] as companios}
          <div on:click={() => (companios.active = !companios.active)}>
            <label>{companios.value}</label>
            <input type="checkbox" bind:checked={companios.active} on:change={changeFilter}/>
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
        {_("thematics")}
      </button>
      <div
        class="option"
        class:option-visible={options[2].isVisible}
        bind:this={options[2].option}>
        {#each filter[3] as subjects}
          <div on:click={() => (subjects.active = !subjects.active)}>
            <label>{subjects.value}</label>
            <input type="checkbox" bind:checked={subjects.active} on:change={changeFilter}/>
          </div>
        {/each}
      </div>
    </div>
    <div class="prices two-input">
      <div class="price-filter">
        <input
          type="number"
          placeholder={_("price_from")}
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
          placeholder={_("to")}
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
  {#if showFilter}
    <div class="active-filter-block">
      <div class="filter-head">{_("you_have_chosen")}</div>
      {#if date !== ''}
        <div class="active-filter">
          {date}
          <button
            class="delete-filter"
            on:click={() => {
              filter[0][0].value = '';
              filter[0][1].value = '';
              changeFilter()
            }}>
            <img src="img/clear.png" />
          </button>
        </div>
      {/if}

      {#each filter as filt, i}
        {#if i > 0 && i < 4}
          {#each filt as fl, j}
            {#if fl.active}
              <div class="active-filter">
                {fl.value}
                <button
                  class="delete-filter"
                  on:click={() => {
                    fl.active = false;
                    changeFilter()
                  }}>
                  <img src="img/clear.png" />
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
              priceStart = '';
              priceEnd = '';
              setPrice();
              changeFilter()
            }}>
            <img src="img/clear.png" />
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <div class="cards-block">
    {#each cards as cardInfo (cardInfo.id)}
      <Card {...cardInfo} locale={locale} />
    {/each}
  </div>
</div>
<Footer locale={locale}/>
