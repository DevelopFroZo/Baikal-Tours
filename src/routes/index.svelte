<script context = "module">
  export async function preload(page, session) {
    let response = await this.fetch("/api/actions");
    let result_cards = await response.json();

    response = await this.fetch("/api/dataForFilters");
    let result_filters = await response.json();
    return { result_cards, result_filters };
  }
</script>

<script>
  import Header from "../components/header.svelte";
  import Footer from "../components/footer.svelte";
  import Card from "../components/card_of_event.svelte";
  import { onMount } from "svelte";
  import Fetcher from "./_helpers/fetcher.js";
  import { parseDate } from "../helpers/parsers.js";

  export let result_cards, result_filters;
  const fetcher = new Fetcher();

  let date = "",
    price = "",
    showFilter = false,
    priceStart = "",
    priceEnd = "",
    resp,
    cards = [],
	start,
	arrData, dateStart, dateEnd;

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

  $: {
    if (start) {
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
        price = "от " + filter[4][0].value + "р до " + filter[4][1].value + "р";
      else if (filter[4][0].active) price = "от " + filter[4][0].value + "р";
      else if (filter[4][1].active) price = "до" + filter[4][1].value + "р";
      else price = "";

      //show active filters

      let params = {
        filter: ""
	  };

      if (filter[0][0].active) {
        dateStart = new Date(filter[0][0].value).toISOString();
        params.dateStart = parseDate(dateStart);
      }

      if (filter[0][1].active) {
        dateEnd = new Date(filter[0][1].value).toISOString();
        params.dateEnd = parseDate(dateEnd);
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
  }

  async function getFilterData(params) {

	console.log(params)

	let filterStatus = await fetcher.get("api/actions", { params });
	
	console.log(filterStatus)

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
  }

  onMount(() => {
    setFilterData(1, result_filters.data.locations);
    setFilterData(2, result_filters.data.companions);
    setFilterData(3, result_filters.data.subjects);

    cards = result_cards.data;

    start = true;
  });

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
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 45px auto 15px;
    min-height: calc(100vh - 175px - 60px);
  }

  .cards-block {
    display: grid;
    grid-template-columns: repeat(3, auto);
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
</style>

<svelte:head>
  <title>Каталог событий</title>
</svelte:head>

<svelte:window on:click={hideAll} />

<Header />
<div class="form-width">
  <h1>Каталог событий</h1>
  <div class="filters">
    <div>
      <input
        placeholder="Дата с"
        class="date"
        type="text"
        bind:value={filter[0][0].value}
        on:focus={function(e) {
          e.target.type = 'date';
        }}
        on:blur={function(e) {
          e.target.type = 'text';
        }} />
      <input
        placeholder="Дата по"
        class="date"
        type="text"
        bind:value={filter[0][1].value}
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
        где
      </button>
      <div
        class="option"
        class:option-visible={options[0].isVisible}
        bind:this={options[0].option}>
        {#each filter[1] as city, i}
          <div on:click={() => (city.active = !city.active)}>
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
        с кем
      </button>
      <div
        class="option"
        class:option-visible={options[1].isVisible}
        bind:this={options[1].option}>
        {#each filter[2] as companios}
          <div on:click={() => (companios.active = !companios.active)}>
            <label>{companios.value}</label>
            <input type="checkbox" bind:checked={companios.active} />
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
        тематика
      </button>
      <div
        class="option"
        class:option-visible={options[2].isVisible}
        bind:this={options[2].option}>
        {#each filter[3] as subjects}
          <div on:click={() => (subjects.active = !subjects.active)}>
            <label>{subjects.value}</label>
            <input type="checkbox" bind:checked={subjects.active} />
          </div>
        {/each}
      </div>
    </div>
    <div>
      <input
        type="number"
        placeholder="цена от"
        id="price-start"
        bind:value={priceStart}
        on:blur={setPrice} />
      <input
        type="number"
        placeholder="до"
        id="price-end"
        bind:value={priceEnd}
        on:blur={setPrice} />
    </div>
  </div>
  {#if showFilter}
    <div class="active-filter-block">
      <div class="filter-head">Вы выбрали:</div>
      {#if date !== ''}
        <div class="active-filter">
          {date}
          <button
            class="delete-filter"
            on:click={() => {
              filter[0][0].value = '';
              filter[0][1].value = '';
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
            }}>
            <img src="img/clear.png" />
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <div class="cards-block">
    {#each cards as cardInfo (cardInfo.id)}
      <Card {...cardInfo} />
    {/each}
  </div>
</div>
<Footer />
