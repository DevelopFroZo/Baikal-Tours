<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let params = page.query;
    let locale = session.locale;
    let actions;

    if (params.filter === "") {
      actions = await fetcher.get("api/actions", {
        credentials: "same-origin",
        query: params
      });
    } else
      actions = await fetcher.get("api/actions", {
        credentials: "same-origin"
      });

    return { locale, actions };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import YandexMap from "/components/yandexMap/index.svelte";
  import i18n from "/helpers/i18n/index.js";
  import Image from "/components/imageCenter.svelte";
  import { parseDateForCards } from "/helpers/parsers.js";
  import { slide } from "svelte/transition";
  import Card from "/components/cardOfEventForMap.svelte";

  export let locale, actions;

  const _ = i18n(locale);
  const customIcon = {
    iconImageHref: "/img/placeholder-map.svg",
    iconImageSize: [30, 42],
    iconImageOffset: [-14, -36]
  };
  const apiKey = "c7b75af8-80f3-4ff2-afb6-a05da8ecdeec";

  let eventsWithCoords = [];
  let visibleEvent = null;
  let searchText = "";
  let inputIsFocused = false;
  let findLocations = [];
  let allLocations = [];

  function makePlaceholders() {
    for (let event of actions.actions)
      if (event.locations)
        for (let location of event.locations)
          if (location.coords) {
            eventsWithCoords.push({
              coords: location.coords,
              meta: {
                name: event.name,
                image_url: event.image_url,
                location: location.address
                  ? `${location.name}, ${location.address}`
                  : location.name,
                id: event.id,
                date_starts: event.date_starts,
                date_ends: event.date_ends
              }
            });
            allLocations.push(
              location.address
                ? `${location.name}, ${location.address}`
                : location.name
            );
          }

    eventsWithCoords = eventsWithCoords;
  }

  function showEvent(e) {
    visibleEvent = e.detail.meta;
  }

  function searchLocations() {
    findLocations = [];
    if (searchText.length) {
      for (let location of allLocations) {
        if (location.includes(searchText)) {
          findLocations.push(location);
          findLocations = findLocations;
          if (findLocations.length > 2) break;
        }
      }
    }
  }

  function showFindEvents() {}

  makePlaceholders();
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .map-block {
    width: 100%;
    height: 100vh;
    background: $Light_Gray;
  }

  .left-side {
    position: absolute;
    left: calc(50% - 600px);
    z-index: 1;
    background: white;
    top: 160px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    width: 400px;
    border-radius: 10px;
    height: calc(100vh - 200px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-block {
    padding: 25px;
    background: white;
    position: relative;
    box-sizing: border-box;
    height: 100px;

    & > .finded-locations {
      position: absolute;
      width: calc(100% - 50px);
      padding-top: 50px;
      background: #f5f5f5;
      border-radius: 25px;
      z-index: 3;
    }

    & > input {
      position: absolute;
      top: 25px;
      padding-left: 25px;
      z-index: 4;
      width: calc(100% - 50px);
      font-size: $LowBig_Font_Size;
      height: 50%;
    }

    & > button {
      position: absolute;
      top: 50%;
      right: 45px;
      width: 25px;
      transform: translateY(-50%);
      z-index: 5;
    }
  }

  .cards-block {
    height: calc(100% - 100px);
    overflow: auto;
    padding: 0 25px;

    & > :global(div:not(:first-child)) {
      margin-top: 30px;
    }
  }
</style>

<Header {locale} />
<div class="map-block">
  <div class="left-side">
    <div class="search-block">
      <input
        type="text"
        on:keyup={searchLocations}
        bind:value={searchText}
        placeholder={_('search')}
        on:focus={() => (inputIsFocused = true)}
        on:blur={() => (inputIsFocused = false)} />
      <button on:click={showFindEvents}>
        <img src="/img/search.svg" alt="search" />
      </button>
      <div class="finded-locations">
        {#if inputIsFocused && findLocations.length}
          <ul>
            {#each findLocations as location}
              <li>
                <button>{location}</button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
    <div class="cards-block">
      {#if visibleEvent}
        <Card {...visibleEvent.meta} {_} />
      {:else if eventsWithCoords.length}
        {#each eventsWithCoords as event}
          <Card {...event.meta} {_} />
        {/each}
      {:else}{/if}
    </div>
  </div>
  <YandexMap
    {apiKey}
    {customIcon}
    staticPlacemarks={eventsWithCoords}
    on:placemarkMeta={showEvent}
    center={[52.285725130459866, 104.28156685575135]} />
</div>
<Footer {locale} />
