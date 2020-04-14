<script>
  import i18n from "/helpers/i18n/index.js";

  export let locale;

  const _ = i18n( locale );
</script>

<style lang="scss">
  @import "./styles/global.scss";

  * {
    color: #34353F;
  }

  footer {
    border: solid #E5E5E5;
    border-width: 1px 0 0 0;
    padding: 50px 0;
    box-sizing: border-box;

    & > .form-width {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      justify-content: center;

      & > div {
        min-width: 275px;
        max-width: 275px;
      }

      & > .left-side {
        text-align: right;
        font-size: $Big_Font_Size;
      }

      & > .center {
        font-size: $Big_Font_Size;
        margin: 0 165px;
      }

      & > .right-side {
        font-size: $Big_Font_Size;
        min-width: 350px;
        max-width: 350px;
      }
    }
  }

  .left-side > div {
    margin-top: 10px;
  }

  .underline {
    text-decoration: underline;
    margin-top: 45px;
    display: block;
    font-size: $Big_Font_Size;
    color: #34353F !important;
  }

  .hrefs > a:not(:first-child) {
    display: block;
    margin-top: 10px;
  }

  h6 {
    font-size: $Big_Font_Size;
    font-weight: normal;
  }

  .mail {
    margin-top: 10px;
  }

  .info {
    margin-top: 15px;

    & > a {
      display: inline-block;
      padding: 15px 25px;
      border-radius: 10px;
      background: $Light_Gray;
      font-weight: bold;
      text-decoration: underline;
      margin-top: 15px;
    }
  }

  @media only screen and (max-width: 768px) {
    *{
      font-size: $LowMedium_Font_Size !important;
    }

    .form-width{
      padding: 0 10px !important;
      flex-direction: column;

      & > div{
        margin: 0;
        width: 100%;
        text-align: left;
        min-width: auto;
        max-width: auto;
      }
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
    <div class="center">
      <div class="hrefs">
        <a href="./">{_("main")}</a>
        <a href="./actions">{_("event_catalog")}</a>
        <a href="./profile">{_("personal_account")}</a>
      </div>
      <a href="./" class="underline">{_("privacy_policy")}</a>
    </div>
    <div class="right-side">
      <h6>{_("contacts")}</h6>
      <div class="mail">events@calendar.com</div>
      <div class="info">
        {_("tourist_information")}
        <br />
        <a href="./">{_("download_pdf")}</a>
      </div>
    </div>
  </div>
</footer>
