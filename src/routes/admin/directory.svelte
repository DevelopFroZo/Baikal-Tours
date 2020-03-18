<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(session, page) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;

    let result_directories = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data;

    return { locale, result_directories };
  }
</script>

<script>
  import AdminPage from "./_admin_page.svelte";

  export let locale, result_directories;
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  h1 {
    margin-top: 35px;
    margin-bottom: 25px;
    font-size: $Big_Font_Size;
  }

  .directories-line {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    & > div {
      width: 250px;
      background: white;
      box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    }
  }

  .directory-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 10px 10px 20px;
    border: solid $Light_Gray;
    border-width: 0 0 1px 0;

    & > h2 {
      font-size: $Medium_Font_Size;
    }
  }

  .directory-info{
      padding: 10px 10px 10px 20px;
  }

  .transfers-block, .subjects-block{
      font-weight: bold;
  }

  .location-block{
      font-weight: bold;

      & > li{
          margin-left: 10px;
          font-weight: normal;
      }
  }
</style>

<AdminPage page={2}>
  <h1>Справочники</h1>
  <div class="directories-line">
    <div class="directory">
      <div class="directory-header">
        <h2>Локации</h2>
        <button>
          <img src="/img/edit_green.png" alt="edit" />
        </button>
      </div>
      <div class="directory-info">
        <ul class="location-block">
          Иркутская область
          {#each result_directories.locations as location}
            <li>{location.name}</li>
          {/each}
        </ul>
      </div>
    </div>
    <div class="directory">
      <div class="directory-header">
        <h2>Тематики</h2>
        <button>
          <img src="/img/edit_green.png" alt="edit" />
        </button>
      </div>
      <div class="directory-info">
        <ul class="subjects-block">
          {#each result_directories.subjects as subject}
            <li>{subject.name}</li>
          {/each}
        </ul>
      </div>
    </div>
    <div class="directory">
      <div class="directory-header">
        <h2>Трансферы</h2>
        <button>
          <img src="/img/edit_green.png" alt="edit" />
        </button>
      </div>
      <div class="directory-info">
        <ul class="transfers-block">
          {#each result_directories.transfers as transfer}
            <li>{transfer.name}</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</AdminPage>
