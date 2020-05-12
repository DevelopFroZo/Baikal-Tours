<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const locale = session.locale;
    const fetcher = new Fetcher(this.fetch);

    let locations = (await fetcher.get("/api/locations2?ln&bln", {
      credentials: "same-origin"
    })).data;

    let oldLocations = (await fetcher.get("/api/locations", {
      credentials: "same-origin"
    })).data;

    let bookingLocations = (await fetcher.get(`/api/bookingLocations`, {
      credentials: "same-origin"
    })).data;

    return { locale, locations, oldLocations, bookingLocations };
  }
</script>

<script>
  import i18n from "/helpers/i18n/index.js";
  import AdminPage from "../_admin_page.svelte";

  export let locale, locations, oldLocations, bookingLocations;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let showAddingWindow = false;
  let showOldLocationsWindow = false;
  let showBookingLocationsWindow = false;
  let addingName = "";
  let searchLocations = "";
  let searchBooking = "";
  let findedLocations = [];
  let findedBookingLocations = [];
  let addedLocation = {
    index: null,
    id: null
  };
  let changedAdding = {
    id: null,
    place: null
  };

  $: findedLocations = oldLocations.filter(
    el => el.name.toLowerCase().indexOf(searchLocations.toLowerCase()) !== -1
  );

  $: findedBookingLocations = bookingLocations.filter(
    el => el.name.toLowerCase().indexOf(searchBooking.toLowerCase()) !== -1
  );

  function addSecondLocation(place, id, n0) {
    place++;
    for (let i = place; i < locations.length; i++)
      if (!locations[i] || locations[i].n0 !== locations[place].n0) {
        place = i;
        break;
      }

    changedAdding.id = id;
    changedAdding.place = place;

    showAddingWindow = true;
  }

  function addThridLocation(place, id, n0, n1) {
    place++;
    for (let i = place + 1; i < locations.length; i++) {
      if (
        !locations[i] ||
        locations[i].n0 !== locations[place].n0 ||
        locations[i].n1 !== locations[place].n1
      ) {
        place = i;
        break;
      }
    }

    changedAdding.id = id;
    changedAdding.place = place;

    showAddingWindow = true;
  }

  function addFirstLocation() {
    changedAdding.place = locations.length;

    showAddingWindow = true;
  }

  async function addLocation() {
    let data = { name: addingName };
    if (changedAdding.id !== null) data.id = changedAdding.id;

    let result = await fetcher.post(`/api/locations2`, {
      ...data,
      isChild: true
    });

    if (result.ok) {
      locations.splice(changedAdding.place, 0, {
        id: result.data.id,
        n0: result.data.n0,
        n1: result.data.n1,
        n2: result.data.n2,
        name: addingName
      });
      locations = locations;
      changedAdding.id = null;
      changedAdding.place = null;
      addingName = "";
      showAddingWindow = false;
    } else alert(result.message);
  }

  async function editLocationName(id, name) {
    let result = await fetcher.put(`/api/locations2/${id}`, { name });

    if (!result.ok) alert(result.message);
  }

  async function deleteFirstLocation(id, n0) {
    let result = await fetcher.delete(`/api/locations2/${id}`);

    if (result.ok) locations = locations.filter(el => !(el.n0 === n0));
    else alert(result.message);
  }

  async function deleteSecondLocation(id, n0, n1) {
    let result = await fetcher.delete(`/api/locations2/${id}`);

    if (result.ok)
      locations = locations.filter(el => !(el.n0 === n0 && el.n1 === n1));
    else alert(result.message);
  }

  async function deleteThridLocation(id, index) {
    let result = await fetcher.delete(`/api/locations2/${id}`);

    if (result.ok) {
      locations.splice(index, 1);
      locations = locations;
    } else alert(result.message);
  }

  function editOldLocation(id, index) {
    addedLocation.id = id;
    addedLocation.index = index;
  }

  async function changeOldLocation(id, name) {
    let result = await fetcher.put(`/api/locations/${id}`, {
      location2Id: addedLocation.id
    });

    if (result.ok) {
      locations[addedLocation.index].location_name = name;
      showOldLocationsWindow = false;
      searchLocations = "";
      addedLocation.index = null;
      addedLocation.id = null;
    } else alert(result.message);
  }

  async function changeBookingLocation(id, name) {
    let result = await fetcher.put(`/api/bookingLocations/${id}`, {
      location2Id: addedLocation.id
    });

    if (result.ok) {
      locations[addedLocation.index].booking_location_name = name;
      showBookingLocationsWindow = false;
      searchBooking = "";
      addedLocation.index = null;
      addedLocation.id = null;
    } else alert(result.message);
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .locations-block {
    margin-top: 20px;
  }

  .first-level {
    margin-left: 0;

    input {
      font-weight: 900;
      width: 250px;
    }
  }

  .second-level {
    margin-left: 15px;

    input {
      font-weight: 600;
      width: 235px;
    }
  }

  .thrid-level {
    margin-left: 30px;

    input {
      width: 220px;
    }

    .add-location {
      visibility: hidden;
    }
  }

  ul {
    li {
      display: flex;
      align-items: center;

      &:not(:first-child) {
        margin-top: 10px;
      }

      & > *:not(:first-child) {
        margin-left: 30px;
      }

      input {
        height: 40px;
        padding-left: 10px;
        border: 1px solid $Gray;
        background: white;
        box-sizing: border-box;
      }

      .delete-location > img {
        width: 20px;
      }
    }
  }

  .add-location,
  .old-location,
  .booking-location {
    height: 40px;
    padding: 0px 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid $Gray;
    width: 250px;
  }

  .locations-block > .add-location {
    margin-top: 30px;
  }

  .adding-window {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;

    > button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: #00000088;
      z-index: 1;
    }

    > div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      z-index: 2;

      > *:not(:first-child) {
        margin-top: 20px;
      }

      > h3 {
        font-size: $Big_Font_Size;
      }

      > input,
      button {
        width: 500px;
        background: white;
        border: 1px solid $Gray;
        padding: 0 10px;
        height: 40px;
      }

      > button {
        width: auto;
        margin: 30px auto 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      > ul {
        margin-top: 20px;
        max-height: 400px;
        overflow: auto;

        > li {
          > button {
            padding: 10px;
            width: 250px;
            margin: auto;
            display: block;
            background: white;
            border: 1px solid $Gray;
            box-sizing: border-box;
          }

          :not(:first-child) {
            margin-top: 10px;
          }
        }
      }
    }
  }

  .head-line {
    margin-top: 20px;
    display: flex;

    > .name {
      width: 560px;
    }

    > .old-name,
    .booking-location-name {
      width: 230px;
    }
  }

  .old-location,
  .booking-location {
    width: 200px;
    justify-content: flex-start;
    overflow: auto;
    white-space: nowrap;
  }
</style>

<AdminPage {locale} {_} {fetcher} page={2}>
  <h1>{_('locations')}</h1>
  <div class="head-line">
    <h3 class="name">{_('location_name')}</h3>
    <h3 class="old-name">{_('old_location_name')}</h3>
    <h3 class="booking-location-name">{_('booking_location')}</h3>
  </div>
  <div class="locations-block">
    <ul>
      {#each locations as location, i}
        {#if location.n1 && !location.n2}
          <li class="second-level">
            <input
              type="text"
              bind:value={location.name}
              on:blur={() => editLocationName(location.id, location.name)} />
            <button
              class="add-location"
              on:click={() => addThridLocation(i, location.id, location.n0, location.n1)}>
              {_('add_thrid_level_location')}
            </button>
            <button
              class="old-location"
              on:click={() => {
                editOldLocation(location.id, i);
                showOldLocationsWindow = true;
              }}>
              {location.location_name ? location.location_name : ''}
            </button>
            <button
              class="booking-location"
              on:click={() => {
                editOldLocation(location.id, i);
                showBookingLocationsWindow = true;
              }}>
              {location.booking_location_name ? location.booking_location_name : ''}
            </button>
            <button
              class="delete-location"
              on:click={() => {
                if (confirm(_('delete_list').replace(/{text}/g, location.name))) deleteSecondLocation(location.id, location.n0, location.n1);
              }}>
              <img src="/img/cross.svg" alt="delete" />
            </button>
          </li>
        {:else if location.n1 && location.n2}
          <li class="thrid-level">
            <input
              type="text"
              bind:value={location.name}
              on:blur={() => editLocationName(location.id, location.name)} />
            <button class="add-location" />
            <button
              class="old-location"
              on:click={() => {
                editOldLocation(location.id, i);
                showOldLocationsWindow = true;
              }}>
              {location.location_name ? location.location_name : ''}
            </button>
            <button
              class="booking-location"
              on:click={() => {
                editOldLocation(location.id, i);
                showBookingLocationsWindow = true;
              }}>
              {location.booking_location_name ? location.booking_location_name : ''}
            </button>
            <button
              class="delete-location"
              on:click={() => {
                if (confirm(_('delete_location').replace(/{text}/g, location.name))) deleteThridLocation(location.id, i);
              }}>
              <img src="/img/cross.svg" alt="delete" />
            </button>
          </li>
        {:else}
          <li class="first-level">
            <input
              type="text"
              bind:value={location.name}
              on:blur={() => editLocationName(location.id, location.name)} />
            <button
              class="add-location"
              on:click={() => addSecondLocation(i, location.id, location.n0)}>
              {_('add_second_level_location')}
            </button>
            <button
              class="old-location"
              on:click={() => {
                editOldLocation(location.id, i);
                showOldLocationsWindow = true;
              }}>
              {location.location_name ? location.location_name : ''}
            </button>
            <button
              class="booking-location"
              on:click={() => {
                editOldLocation(location.id, i);
                showBookingLocationsWindow = true;
              }}>
              {location.booking_location_name ? location.booking_location_name : ''}
            </button>
            <button
              class="delete-location"
              on:click={() => {
                if (confirm(_('delete_list').replace(/{text}/g, location.name))) deleteFirstLocation(location.id, location.n0);
              }}>
              <img src="/img/cross.svg" alt="delete" />
            </button>
          </li>
        {/if}
      {/each}
    </ul>

    <button class="add-location" on:click={addFirstLocation}>
      {_('add_first_level_location')}
    </button>
  </div>
</AdminPage>

{#if showAddingWindow}
  <div class="adding-window">
    <button
      class="close-adding-window"
      on:click={() => (showAddingWindow = false)} />
    <div class="adding-window-block">
      <h3>{_('type_location_name')}</h3>
      <input type="text" bind:value={addingName} />
      <button
        class="add-location"
        disabled={!addingName.length}
        on:click={addLocation}>
        {_('add_location')}
      </button>
    </div>
  </div>
{/if}

{#if showOldLocationsWindow}
  <div class="adding-window">
    <button
      class="close-adding-window"
      on:click={() => (showOldLocationsWindow = false)} />
    <div class="adding-window-block">
      <h3>{_('location_validate')}</h3>
      <input
        type="text"
        bind:value={searchLocations}
        placeholder={_('search')} />
      <ul>
        {#each findedLocations as location}
          <li>
            <button
              on:click={() => changeOldLocation(location.id, location.name)}>
              {location.name}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

{#if showBookingLocationsWindow}
  <div class="adding-window">
    <button
      class="close-adding-window"
      on:click={() => (showBookingLocationsWindow = false)} />
    <div class="adding-window-block">
      <h3>{_('booking_locations')}</h3>
      <input type="text" bind:value={searchBooking} placeholder={_('search')} />
      <ul>
        {#each findedBookingLocations as location}
          <li>
            <button
              on:click={() => changeBookingLocation(location.id, location.name)}>
              {location.name}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}
