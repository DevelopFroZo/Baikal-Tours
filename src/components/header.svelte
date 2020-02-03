<script>
  import { stores } from "@sapper/app";
  import Fetcher from "/helpers/fetcher.js";
  import { translationText } from "/helpers/translate.js";

  export let locale;

  const fetcher = new Fetcher();

  const { session } = stores();

  let languages = [
    {
      id: 1,
      lang: "ru"
    },
    {
      id: 2,
      lang: "en",
    },
    {
      id: 3,
      lang: "zh"
    }
  ]

  let secondLanguage = locale;

  async function changeLanguage(){
    let result = await fetcher.put("/api/locales/" + secondLanguage);

    document.location.reload();
  }
</script>

<style lang="scss">
  @import "./styles/global";

  header {
    height: 46px;
    background-color: $Gray;
    padding: 7px 0;
    box-sizing: border-box;
    position: relative;
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
  }

  .page-name {
    margin-left: 37px;
    font-size: $Medium_Font_Size;
  }

  .right-side {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }

  .language {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: bold;
  }

  a {
    font-size: $LowMedium_Font_Size;

    &[href="./login"] {
      margin-left: 23px;
    }

    &[href="./register"], &.my-page {
      margin-left: 15px;
      padding: 5px 8px;
      border-radius: 5px;
      background: white;
    }
  }

  .logout{
    margin-left: 23px;
  }

  @media only screen and (max-width: 768px) {
    .right-side{
      display: none;
    }

    .page-name{
      margin-left: 0;
    }

    .line{
      justify-content: space-between;
    }
  }
</style>

<header>
  <div class="form-width line">
    <a class="header-name" href="./">
      <h1>{translationText.eventCalendar[locale]}</h1>
      <div>
        <img src="img/ot.png" alt="от" />
        <img src="img/logo.png" alt="logo" />
      </div>
    </a>
  </div>
  <div class="right-side">
    <select bind:value={secondLanguage} on:change={changeLanguage} class = "language">
      {#each languages as lang}
        <option value={lang.lang}>{lang.lang}</option>
      {/each}
    </select>
    <img src="img/language.png" alt="language" />
    {#if !$session.isLogged}
      <a href="./login" id="login">{translationText.authorize[locale]}</a>
      <a href="./register" id="register">{translationText.registration[locale]}</a>
    {:else}
      <a href="./" class = "my-page">*твоя почта*</a>
      <button class = "logout">{translationText.logout[locale]}</button>
    {/if}
  </div>
</header>
