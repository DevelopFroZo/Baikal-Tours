<script>
  export let page, fetcher, locale, _;

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
  @import "./styles/global.scss";

  .category-block {
    background: $Light_Black;
    width: 120px;
    height: 610px;
    position: relative;
  }

  h1 {
    font-size: $Big_Font_Size;
    color: white;
    margin: 22px auto 0 auto;
    width: 93px;
  }

  .category-href {
    width: 100%;
    text-align: center;
    display: block;
    color: $Gray;
    background: transparent;
    padding: 7px 0;
    font-size: $Medium_Font_Size;

    &:not(:first-child) {
      margin-top: 10px;
    }
  }

  .active-page {
    background: $Gray;
    color: $Light_Black;
    font-weight: bold;
  }

  .bottom {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;

    & > .language {
      text-transform: uppercase;
      font-weight: bold;
      border: 1px solid $Light_Black;
      // background-image: url("../img/language.png");
      // background-repeat: no-repeat;
      // background-position: right 0.7em top 50%, 0 0;
      //width: 45px;
      -moz-appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      margin-bottom: 10px;
      color: white;

      &::-ms-expand {
        display: none;
      }

      & > option {
        background: $Light_Black;
        color: white;
      }
    }
  }
</style>

<div class="category-block">
  <h1>{_("event_calendar")}</h1>
  <a class="category-href" class:active-page={page === 0} href="./admin">
    {_("actions")}
  </a>
  <a class="category-href" class:active-page={page === 1} href="./admin/users">
    {_("users")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 2}
    href="./admin/directory">
    {_("handbooks")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 3}
    href="./admin/excursions">
    {_("excursions_and_tours")}
  </a>
  <a class="category-href" class:active-page={page === 4} href="./admin/hotels">
    {_("hotels")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 5}
    href="./admin/banners">
    {_("banners")}
  </a>
  <a
    class="category-href"
    class:active-page={page === 6}
    href="./admin/compiliations">
    {_("selections")}
  </a>
  <div class="bottom">
    <select
      bind:value={secondLanguage}
      on:change={changeLanguage}
      class="language">
      {#each languages as lang}
        <option value={lang.lang}>{lang.lang}</option>
      {/each}
    </select>
    <a href="/" class="exit">
      <img src="/img/exit.png" alt="exit" />
    </a>
  </div>

</div>
