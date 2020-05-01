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
  import ClickOutside from "/components/clickOutside.svelte";

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
  let notFoundText = "";
  let findLocations = [];
  let allLocations = [];
  let searchBlock;
  let showFindLocations = false;
  let allEvents;

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
    allEvents = Object.assign([], eventsWithCoords);
    eventsWithCoords = eventsWithCoords;
  }

  function showEvent(e) {
    visibleEvent = e.detail.meta;
  }

  function searchLocations() {
    findLocations = [];
    for (let location of allLocations) {
      if (location.toLowerCase().includes(searchText.toLowerCase())) {
        let leftText = location.substring(
          0,
          location.toLowerCase().indexOf(searchText.toLowerCase())
        );
        let rightText = location.substring(
          leftText.length + searchText.length,
          location.length
        );
        let allText = `${leftText}<b>${location.substring(
          leftText.length - 1,
          leftText.length + searchText.length
        )}</b>${rightText}`;

        findLocations.push({
          formatedText: allText,
          location: location
        });
        if (findLocations.length > 2) break;
      }
    }
    visibleEvent = null;
    findLocations = findLocations;
  }

  function showFindEvents() {
    eventsWithCoords = [];

    for (let event of allEvents) {
      if (event.meta.location.toLowerCase().includes(searchText.toLowerCase()))
        eventsWithCoords.push(event);
    }

    if (!eventsWithCoords.length) notFoundText = searchText;

    eventsWithCoords = eventsWithCoords;
    showFindLocations = false;
  }

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
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    z-index: 3;

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
      width: calc(100% - 130px);
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

  .finded-location {
    padding: 0 25px;

    &:not(:first-child) {
      margin-top: 15px;
    }

    & > button {
      font-size: $LowBig_Font_Size;
      text-align: left;
    }
  }

  .finded-list {
    padding-bottom: 15px;
  }

  .see-all {
    font-size: $LowBig_Font_Size;
    text-decoration: underline;
    color: #4d5062;
    margin-top: 15px;
    display: block;
    text-align: center;
    width: 100%;
  }

  .not-found {
    position: absolute;
    top: calc(100% + 20px);
    color: #c1c1c1;
    font-size: $LowBig_Font_Size;
    display: block;
    width: calc(100% - 50px);
  }
</style>

<svelte:head>
  <title>{_("events_on_card")}</title>
</svelte:head>

<Header {locale} />
<div class="map-block">
  <div class="left-side">
    <div class="search-block">
      <input
        type="text"
        on:keyup={searchLocations}
        bind:value={searchText}
        placeholder={_('search')}
        bind:this={searchBlock}
        on:focus={() => (showFindLocations = true)}
        on:blur={showFindEvents}
        on:keydown={function(e) {
          if (e.key === 'Enter') {
            showFindEvents();
            this.blur();
          }
        }} />
      <button on:click={showFindEvents}>
        <img src="/img/search.svg" alt="search" />
      </button>

      <div class="finded-locations" on:clickOutside>
        <ClickOutside
          exclude={[searchBlock]}
          on:clickoutside={() => (showFindLocations = false)}>
          {#if showFindLocations && findLocations.length && searchText.length}
            <ul class="finded-list">
              {#each findLocations as location}
                <li class="finded-location">
                  <button
                    on:click={() => {
                      searchText = location.location;
                      showFindEvents();
                    }}>
                    {@html location.formatedText}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </ClickOutside>
      </div>
      {#if !visibleEvent && !eventsWithCoords.length && (showFindLocations || searchText.length)}
        <span class="not-found">
          {_('locations_search_not_found').replace(/{text}/g, notFoundText)}
        </span>
      {:else if !allEvents.length}
        <span class="not-found">{_('events_not_found')}</span>
      {/if}
    </div>
    <div class="cards-block">
      {#if visibleEvent}
        <Card {...visibleEvent} {_} />
        <button class="see-all" on:click={() => (visibleEvent = null)}>
          {_('see_all_events')}
        </button>
      {:else if eventsWithCoords.length}
        {#each eventsWithCoords as event}
          <Card {...event.meta} {_} />
        {/each}
      {/if}
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
