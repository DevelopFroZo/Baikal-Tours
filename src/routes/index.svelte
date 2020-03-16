<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;

    let subjects = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.subjects;

    let actions = (await fetcher.get("/api/actions", {
      credentials: "same-origin",
      query: {
        offset: 0,
        count: 5
      }
    })).actions;

    return { locale, subjects, actions };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import Quiz from "/components/quiz.svelte";
  import Selection from "/components/selection.svelte";
  import Card from "/components/card_of_event.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { onMount } from "svelte";

  export let locale, subjects, actions;

  const fetcher = new Fetcher();

  const _ = i18n(locale);

  let selectionsBlock,
    actinosBlock,
    isLoad = false,
    flickityLoad = false;

  onMount(() => {
    isLoad = true;
    if (flickityLoad) startFlickity();

    localStorage.removeItem("actionsParams");
  });

  function fLoad() {
    flickityLoad = true;
    if (isLoad) startFlickity();
  }

  function startFlickity() {
    new Flickity(selectionsBlock, {
      groupCells: 2
    });

    new Flickity(actinosBlock, {
      groupCells: 3
    });
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  h1 {
    text-align: center;
    font-size: $Big_Font_Size;
    font-weight: normal;
    margin-top: 45px;
    margin-bottom: 20px;
  }

  .info-block {
    display: flex;
    margin: 50px auto 0;
    width: 830px;
    text-align: center;

    & > div {
      flex: 0.4;

      & > h2 {
        margin-bottom: 13px;
      }

      & > p:not(:first-child) {
        margin-top: 16px;
      }

      & > .new-section {
        margin-top: 25px !important;
      }
    }

    & > frame {
      flex: 0.6;
      width: 100%;
      height: 100%;
    }
  }

  .form-width {
    padding-bottom: 50px;
  }

  .form-width > h2 {
    font-size: $Big_Font_Size;
    margin-top: 50px;
    text-align: center;
  }

  .selections-block {
    width: 675px;
    display: flex;
    justify-content: space-between;
    margin: 20px auto 0;
  }

  .selection-carousel {
    width: 675px;
    margin: 25px auto 0;

    & :global(.selection-block) {
      margin-left: 30px;
    }
  }

  .action-carousel {
    margin: 25px auto 0;

    & :global(.card) {
      margin-left: 15px;
    }
  }
</style>

<svelte:head>
  <title>{_('event_calendar')}</title>
  <script src="./js/flickity.min.js" on:load={fLoad}>

  </script>
  <link
    rel="stylesheet"
    href="https://unpkg.com/flickity@2/dist/flickity.min.css" />
</svelte:head>

<Header {locale} />
<div class="form-width">
  <h1>{_("main_text")}</h1>
  <Quiz {_} {subjects} {fetcher} />
  <div class="info-block">
    <div>
      <h2>{_("event_calendar_baikal")}</h2>
      <p>
        <b>{_("event_calendar_text_1")}</b>
      </p>
      <p>
        {_("event_calendar_text_2")}
      </p>
      <p class="new-section">
        <b>{_("event_calendar_text_3")}</b>
      </p>
      <p>{_("event_calendar_text_4")}</p>
    </div>
    <frame
      src="https://www.youtube.com/watch?v=Ryh-7RNmC44"
      name="video"
      scrolling="no"
      noresize />
  </div>

  <h2>{_("selections_top")}</h2>
  <div class="selections-block">
    <Selection width={200} height={150} />
    <Selection width={200} height={150} />
    <Selection width={200} height={150} />
  </div>
  <div class="selection-carousel" bind:this={selectionsBlock}>
    <Selection width={270} height={150} />
    <Selection width={270} height={150} />
    <Selection width={270} height={150} />
  </div>

  <h2>{_("actions_top")}</h2>
  <div class="action-carousel" bind:this={actinosBlock}>
    {#each actions as action}
      <Card {...action} {locale} saveURL={false}/>
    {/each}
  </div>
</div>
<Footer {locale} />
