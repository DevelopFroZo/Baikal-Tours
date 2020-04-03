<script>
  import { stores, goto } from "@sapper/app";
  import Fetcher from "/helpers/fetcher.js";
  import i18n from "/helpers/i18n/index.js";
  import ChangeLanguage from "/components/language_select.svelte";
  import Register from "./register/index.svelte";
  import Login from "./login/index.svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let locale;

  const fetcher = new Fetcher();
  const { session, page } = stores();
  const _ = i18n(locale);

  async function changeLanguage(e) {
    let lang = e.detail.lang;
    let result = await fetcher.put("/api/locales/" + lang);

    document.location.reload();
  }
</script>

<style lang="scss">
  @import "./styles/global";

  header {
    background-color: white;
    padding: 20px 40px;
    box-sizing: border-box;
    position: fixed;
    border-radius: 10px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
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
    color: $MaxDark_Gray;
    text-transform: uppercase;
    font-size: $LowBig_Font_Size;
    font-weight: normal;
    font-family: $Gilroy;
    margin-bottom: 10px;
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

  .right-side,
  .left-side {
    display: flex;
    align-items: center;
    position: relative;
  }

  a,
  button {
    font-size: $LowBig_Font_Size;
    font-family: $Gilroy;

    &.login,
    &.logout {
      margin-left: 15px;
      background: white;
      border-radius: 100px;
      padding: 15px 45px 15px 30px;
      border: 1px solid $Blue;
      color: $Blue;
      display: flex;
      align-items: center;
      box-sizing: border-box;

      & > img {
        width: 20px;
        height: 20px;
        margin-right: 20px;
      }
    }

    &.logout {
      padding: 15px 45px;
    }

    &.register {
      margin-left: 23px;
      padding: 15px 30px;
      border-radius: 100px;
      background: $Blue_Gradient;
      display: flex;
      align-items: center;
      color: white;
      box-sizing: border-box;

      & > img {
        width: 20px;
        height: 20px;
        margin-right: 20px;
      }
    }
  }

  .language-img {
    margin-left: 5px;
  }

  .my-page {
    font-weight: bold;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .language {
    position: absolute;
    right: -100px;
    top: 5px;
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

<header class="form-width line">
  <div class="left-side">
    <a class="header-name" href="./">
      <h1>{_('event_calendar')}</h1>
      <div>
        <img src="img/ot.png" alt="от" />
        <img src="img/logo.png" alt="logo" />
      </div>
    </a>
    <div class="language">
      <ChangeLanguage {locale} on:changeLanguage={changeLanguage} />
    </div>
  </div>
  <div class="right-side">
    <div class="user-info">
      {#if !$session.isLogged}
        <button
          class="login"
          on:click={() => goto(parseUrlByPage($page, [], {window: 'login'}))}>
          <img src="/img/log-in.svg" alt="login" />
          {_('authorize')}
        </button>
        <button
          class="register"
          on:click={() => goto(parseUrlByPage($page, [], {window: 'register'}))}>
          <img src="/img/user.svg" alt="user" />
          {_('registration')}
        </button>
      {:else}
        <a href="./profile?section=settings" class="my-page">
          {`${$session.name} ${$session.surname}`}
        </a>
        <a class="logout" href="/logout">{_('logout')}</a>
      {/if}
    </div>
  </div>
</header>

<Register
  page={$page}
  {_}
  {fetcher}
  on:confirmPassword={() => goto(parseUrlByPage($page, ["window"], {window: "confirm-password"}))}
  on:login={() => goto(parseUrlByPage($page, ["window"], {window: 'login'}))} />

<Login
  page={$page}
  {_}
  {fetcher}
  on:forgotPassword={() => goto(parseUrlByPage($page, ["window"], {window: 'forgot-password'}))}
  on:login={() => goto(parseUrlByPage($page, ["window"], {window: 'login'}))}
  on:register={() => goto(parseUrlByPage($page, ["window"], {window: 'register'}))} />
