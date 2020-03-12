<script>
  import i18n from "/helpers/i18n/index.js";

  export let locale;

  const _ = i18n( locale );
</script>

<style lang="scss">
  @import "./styles/global.scss";

  * {
    color: $Dark_Gray;
  }

  footer {
    border: solid rgba(0, 0, 0, 0.2);
    border-width: 2px 0 0 0;
    padding: 15px 0 15px 0;
    box-sizing: border-box;

    & > .form-width {
      padding: 0 115px;
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      justify-content: center;

      & > div {
        width: 200px;
      }

      & > .left-side {
        text-align: right;
        font-size: $Mini_Font_Size;
      }

      & > .center {
        font-size: $LowMedium_Font_Size;
        margin-left: 125px;
      }

      & > .right-side {
        font-size: $LowMedium_Font_Size;
        width: 300px;
        margin-left: 100px;
      }
    }
  }

  .left-side > div {
    margin-top: 10px;
  }

  .underline {
    text-decoration: underline;
    margin-top: 15px;
    display: block;
    font-size: $Mini_Font_Size;
  }

  .hrefs > a:not(:first-child) {
    display: block;
    margin-top: 10px;
  }

  h1 {
    font-size: $LowMedium_Font_Size;
    font-weight: bold;
  }

  .mail {
    margin-top: 10px;
  }

  .info {
    margin-top: 15px;

    & > a {
      display: inline-block;
      padding: 5px;
      border-radius: 5px;
      background: $Light_Gray;
      font-weight: bold;
      text-decoration: underline;
      margin-top: 5px;
    }
  }

  @media only screen and (max-width: 768px) {
    .form-width{
      padding: 0 10px !important;
      justify-content: space-between !important;
    }

    .right-side{
      margin-left: 0 !important;
    }

    .right-side, .left-side{
      width: 130px !important;
    }
  }
</style>

<footer>
  <div class="form-width" class:short={true}>
    <div class="left-side">
      <img src="img/logo.png" alt="logo.png" />
      <br />
      <div>{_("event_calendar_info")}</div>
      <a href="./" class="underline">{_("user_agreement")}</a>
    </div>
    <!-- <div class="center">
      <div class="hrefs">
        <a href="./">Главная</a>
        <a href="./">Каталог событий</a>
        <a href="./">Личный кабинет</a>
      </div>
      <a href="./" class="underline">Политика конфиденциальности</a>
    </div> -->
    <div class="right-side">
      <h1>{_("contacts")}</h1>
      <div class="mail">events@calendar.com</div>
      <!-- <div class="info">
        Туристическая справочная информация
        <br />
        <a href="./">скачать pdf</a>
      </div> -->
    </div>
  </div>
</footer>
