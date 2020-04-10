<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { parseDateForCards } from "/helpers/parsers.js";
  import SortableList from "/components/sortableList.svelte";
  import { onMount } from "svelte";

  export let name, id, _, fetcher;

  let showEvents = false,
    events = [],
    allEvents = [];

  async function addEvent(eventInfo) {
    let bl = true;
    for (let event of events) {
      if (event.id === eventInfo.id) {
        bl = false;
        break;
      }
    }

    if (bl) {
      let result = await fetcher.post("/api/favorites", {
        subjectId: id,
        actionId: eventInfo.id
      });
      if (result.ok) {
        eventInfo.favorite_id = result.data;
        events.push(eventInfo);
        events = events;
        showEvents = false;
      } else console.log(result.message);
    } else alert(_("already_added_event"));
  }

  async function sortEvents(e) {
    let newEvents = e.detail,
      i = 0;

    for (let event of events) {
      if (event.id !== newEvents[i].id) {
        let j = 0;
        for(let newEvent of newEvents){
          if(newEvent.id === event.id)
            break;
          j++;
        }
        let result = await fetcher.put(`/api/favorites/${event.favorite_id}`, {
          number: j + 1,
          action: "swipe"
        });
        if (result.ok) events = newEvents;
        break;
      }
      i++;
    }
  }

  onMount(getEvents);

  async function getEvents() {
    events = (await fetcher.get("/api/actions", {
      query: {
        filter: "",
        favoritesOnly: "",
        subjects: id
      }
    })).actions;

    allEvents = (await fetcher.get("/api/actions", {
      query: {
        filter: "",
        subjects: id
      }
    })).actions;
  }

  async function deleteEvent(id, i) {
    let result = await fetcher.delete(`/api/favorites/${id}`);
    if (result.ok) {
      events.splice(i, 1);
      events = events;
    }
    else console.log(result)
  }
</script>

<style lang="scss">
  @import "./styles/admin";

  .add-event {
    padding: 10px;
    border-radius: 10px;
    font-size: $LowBig_Font_Size;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-top: 40px;
    background: white;
  }

  .events-block {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 3;

    & > button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #00000088;
      z-index: 1;
    }

    & > .all-events-block {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 800px;
      padding: 20px;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      z-index: 2;
      background: white;
      overflow: auto;
    }
  }

  .event-block {
    padding: 20px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    background: white;
    width: 100%;
    box-sizing: border-box;

    & > * {
      text-align: left;
    }

    & > h3 {
      font-size: $LowBig_Font_Size;
      width: 90%;
    }

    & > .event-info {
      display: flex;
      margin-top: 20px;
      justify-content: space-between;
      align-items: flex-start;
    }

    &:not(:first-child) {
      margin-top: 20px;
    }
  }

  .subject-events-block {
    margin-top: 40px;
    width: 350px;

    & .event-block {
      position: relative;

      & > button {
        position: absolute;
        top: 10px;
        right: 10px;

        & > img {
          width: 15px;
          height: 15px;
        }
      }
    }
  }
</style>

<div>
  <h2>{name}</h2>

  <div class="subject-events-block">

    <SortableList
      list={events}
      key="id"
      on:sort={sortEvents}
      let:item
      let:index>
      <div class="event-block">
        <h3>{item.name}</h3>
        <div class="event-info">
          <span>{item.locations.join('; ')}</span>
          <span>
            {parseDateForCards(item.date_starts, item.date_ends, _).join('; ')}
          </span>
        </div>
        <button class="delete" on:click={() => deleteEvent(item.favorite_id, index)}>
          <img src="/img/cross.svg" alt="delete" />
        </button>
      </div>
    </SortableList>

    {#if events.length === 0}
      <h4>{_('no_favorite_events')}</h4>
    {/if}

  </div>

  {#if events.length < 4}
    <button class="add-event" on:click={() => (showEvents = true)}>
      {_('add_action')}
    </button>
  {/if}
</div>

{#if showEvents}
  <div class="events-block">
    <button on:click={() => (showEvents = false)} />
    <div class="all-events-block">
      {#each allEvents as event}
        <button class="event-block" on:click={() => addEvent(event)}>
          <h3>{event.name}</h3>
          <div class="event-info">
            <span>{event.locations.join('; ')}</span>
            <span>
              {parseDateForCards(event.date_starts, event.date_ends, _).join('; ')}
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}
