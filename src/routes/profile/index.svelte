<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let locale = session.locale,
      section = page.query.section;

    let sections = ["settings", "actions", "organizer"],
      bl = false;
    if (section !== undefined)
      for (let secondSection of sections)
        if (secondSection === section) {
          bl = true;
          break;
        }

    if(session.userId === undefined)
      this.redirect(302, "/login");

    if (section === undefined || !bl)
      this.redirect(302, "/profile?section=settings");

    let userInfo = (await fetcher.get(`/api/users/${session.userId}`, {
      credentials: "same-origin"
    })).data;

    let subjectsInfo = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.subjects;

    let userSubscribeds = (await fetcher.get(`/api/users/${session.userId}/subscribed`, {
      credentials: "same-origin"
    })).data;

    return { locale, section, userInfo, subjectsInfo, userSubscribeds};
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import Settings from "./_settings.svelte";
  import Actions from "./_actions.svelte";
  import Organizer from "./_organizer.svelte";
  import { goto } from "@sapper/app";
  import i18n from "/helpers/i18n/index.js";

  export let locale, section, userInfo, subjectsInfo, userSubscribeds;
  const _ = i18n( locale );

  function setSection(sectionType) {
    goto(`/profile?section=${sectionType}`);
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  h1 {
    font-weight: normal;
    font-size: $MaxBig_Font_Size;
    margin: 20px 0;
  }

  .form-width {
    min-height: calc(100vh - 210px);
    padding-bottom: 30px;
  }
</style>

<svelte:head>
  <title>{_(section)}</title>
</svelte:head>

<Header {locale} little={true} />
<div class="form-width">
  <h1>{_("personal_account")}</h1>
  <div class="profile-type-block">
    <button
      class:active={section === 'settings'}
      on:click={() => setSection('settings')}
      disabled={section === 'settings'}>
      {_("account_settings")}
    </button>
    <button
      class:active={section === 'actions'}
      on:click={() => setSection('actions')}
      disabled={section === 'actions'}>
      {_("my_events")}
    </button>
    <button
      class:active={section === 'organizer'}
      on:click={() => setSection('organizer')}
      disabled={section === 'organizer'}>
      {_("organizer_office")}
    </button>
  </div>

  {#if section === 'settings'}
    <Settings {userInfo} {...userInfo} {subjectsInfo} {_}/>
  {:else if section === 'actions'}
    <Actions {userSubscribeds} {_}/>
  {:else if section === 'organizer'}
    <Organizer {_}/>
  {/if}
</div>

<Footer {locale} little={true} />
