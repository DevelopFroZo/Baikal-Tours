<script>
  import { stores } from "@sapper/app";

  const { session } = stores();
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

  #language {
    text-transform: uppercase;
    display: flex;
    align-items: center;
    font-weight: bold;

    & > img {
      margin-left: 3px;
    }
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
</style>

<header>
  <div class="form-width line">
    <div class="header-name">
      <h1>Календарь событий</h1>
      <div>
        <img src="img/ot.png" alt="от" />
        <img src="img/logo.png" alt="logo" />
      </div>
    </div>
    <div class="page-name">Каталог событий</div>
  </div>
  <div class="right-side">
    <button id="language">
      ru
      <img src="img/language.png" alt="language" />
    </button>
    {#if !$session.isLogged}
      <a href="./login" id="login">Войти</a>
      <a href="./register" id="register">Регистрация</a>
    {:else}
      <a href="./" class = "my-page">*твоя почта*</a>
      <button class = "logout">Выход</button>
    {/if}
  </div>
</header>
