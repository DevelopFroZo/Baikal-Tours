<script>
  import i18n from "/helpers/i18n/index.js";

  export let locale;

  const _ = i18n(locale);
</script>

<style lang="scss">
  @import "./styles/global.scss";

  * {
    color: #34353f;
  }

  footer {
    border: solid #e5e5e5;
    border-width: 1px 0 0 0;
    padding: 50px 0;
    box-sizing: border-box;

    & > .form-width {
      box-sizing: border-box;
      display: grid;
      justify-content: space-between;
      justify-items: start;
      grid-row-gap: 15px;
      grid-template-areas:
        "left-block center-block right-block"
        "assign policy download";

      & > div {
        font-size: $Big_Font_Size;
      }
    }
  }

  .left-side {
    text-align: right;
    justify-self: end;
    grid-area: left-block;

    & > p {
      font-size: $Medium_Font_Size;
      color: rgba(52, 53, 63, 0.7);
      width: 205px;
    }
  }

  .center{
    grid-area: center-block;
  }

  .right-side{
    grid-area: right-block;
  }

  .assign{
    grid-area: assign;
  }

  .policy{
    grid-area: policy;
  }

  .download{
    grid-area: download;
  }

  .logo-images {
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: 15px;
    align-items: center;
    justify-content: end;
    margin-top: 10px;
  }

  .underline {
    text-decoration: underline;
    display: block;
    font-size: $Big_Font_Size;
    color: #34353f !important;
    align-self: center;
  }

  .hrefs > a:not(:first-child) {
    display: block;
    margin-top: 20px;
  }

  h6, h5 {
    font-size: $LowBig_Font_Size;
    font-weight: normal;
    color: #4d5062;
  }

  .mail {
    margin-top: 20px;
  }

  .info {
    margin-top: 35px;
  }

  .download {
    display: inline-block;
    padding: 15px 25px;
    border-radius: 10px;
    background: $Light_Gray;
    font-weight: bold;
    text-decoration: underline;
  }

  h6{
    font-size: $Big_Font_Size;
  }

  @media only screen and (max-width: 768px) {
    .form-width {
      padding: 0 10px !important;
      grid-row-gap: 10px;
      grid-template-areas: "left-block left-block"
                           "center-block right-block"
                           "assign download"
                           "policy download" !important;
      grid-template-columns: 150px 150px;

      & > div{
        font-size: $LowMedium_Font_Size;
      }
    }

    .left-side{
      justify-self: center;
      text-align: center;

      & > p{
        font-size: $LowMedium_Font_Size;
        margin-top: 10px;
      }
    }

    .logo-images{
      justify-content: center;
    }

    .underline{
      font-size: $Mini_Font_Size;
    }

    .download{
      padding: 12px 25px;
      font-size: $Medium_Font_Size;
    }

    .info{
      margin-top: 20px;
    }

    .mail{
      margin-top: 10px;
    }

    h6{
      font-size: $LowMedium_Font_Size;
    }
  }
</style>

<footer>
  <div class="form-width">
    <div class="left-side">
      <h5>{_('event_calendar').toUpperCase()}</h5>
      <div class="logo-images">
        <img src="/img/ot.png" alt="from" />
        <img src="img/logo.png" alt="logo.png" />
      </div>
      <p>{_('event_calendar_info')}</p>
    </div>
    <div class="center">
      <div class="hrefs">
        <a href="./">{_('main')}</a>
        <a href="./events">{_('event_catalog')}</a>
        <a href="./profile">{_('personal_account')}</a>
      </div>
    </div>
    <div class="right-side">
      <h6>{_('contacts')}</h6>
      <div class="mail">events@calendar.com</div>
      <div class="info">
        {_('tourist_information')}
        <br />
      </div>
    </div>
    <a href="./" class="underline assign">{_('user_agreement')}</a>
    <a href="./" class="underline policy">{_('privacy_policy')}</a>
    <a href="./" class="download">{_('download_pdf')}</a>
  </div>
</footer>
