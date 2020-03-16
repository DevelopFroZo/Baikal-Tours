<script>
  import { stores } from "@sapper/app";
  import Fetcher from "/helpers/fetcher.js";
  import i18n from "/helpers/i18n/index.js";

  export let locale,
    little = false;

  const fetcher = new Fetcher();

  const { session } = stores();

  const _ = i18n(locale);

  let languages = [
    {
      id: 1,
      lang: "ru"
    },
    {
      id: 2,
      lang: "en"
    },
    {
      id: 3,
      lang: "zh"
    }
  ];

  let secondLanguage = locale;

  async function changeLanguage() {
    let result = await fetcher.put("/api/locales/" + secondLanguage);

    document.location.reload();
  }
</script>

<style lang="scss">
  @import "./styles/global";

  header {
    height: 46px;
    background-color: $Gray;
    padding: 7px 15px 7px 0;
    box-sizing: border-box;
    position: relative;
    border-radius: 0 0 5px 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  }

  .header-name {
    padding: 0 15px;
    display: inline-block;

    & > div {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      & > img:last-child {
        margin-left: 6px;
      }
    }
  }

  h1 {
    color: $Dark_Blue;
    text-transform: uppercase;
    font-size: $MaxMedium_Font_Size;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-name {
    margin-left: 37px;
    font-size: $Medium_Font_Size;
  }

  .right-side, .left-side {
    display: flex;
    align-items: center;
  }

  .language {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: bold;
    border: 1px solid $Gray;
    background-image: url("../img/language.png");
    background-repeat: no-repeat;
    background-position: right .7em top 50%, 0 0;
    width: 45px;
    -moz-appearance: none;
    -webkit-appearance: none;
    cursor: pointer;

    &::-ms-expand{
      display: none;
    }

    & > option{
      background: $Gray;
    }
  }

  a {
    font-size: $LowMedium_Font_Size;

    &[href="./login"] {
      margin-left: 23px;
    }

    &[href="./register"] {
      margin-left: 15px;
      padding: 5px 8px;
      border-radius: 5px;
      background: white;
    }
  }

  .logout {
    margin-left: 23px;
  }

  .language-img {
    margin-left: 5px;
  }

  .my-page {
    margin-left: 15px;
    padding: 5px 8px;
    border-radius: 5px;
    font-weight: bold;
  }

  @media only screen and (max-width: 768px) {
    .user-info {
      display: none;
    }

    .page-name {
      margin-left: 0;
    }
  }
</style>

<header class="form-width line" class:short={little}>
  <div class="left-side">
    <a class="header-name" href="./">
      <h1>{_('event_calendar')}</h1>
      <div>
        <img src="img/ot.png" alt="от" />
        <img src="img/logo.png" alt="logo" />
      </div>
    </a>
    <select
      bind:value={secondLanguage}
      on:change={changeLanguage}
      class="language">
      {#each languages as lang}
        <option value={lang.lang}>{lang.lang}</option>
      {/each}
    </select>
  </div>
  <div class="right-side">
    <div class="user-info">
      {#if !$session.isLogged}
        <a href="./login" id="login">{_('authorize')}</a>
        <a href="./register" id="register">{_('registration')}</a>
      {:else}
        <a href="./profile?section=settings" class="my-page">*твоя почта*</a>
        <a class="logout" href="/logout">{_('logout')}</a>
      {/if}
    </div>
  </div>
</header>
