<script>
  export let page;
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

  .exit{
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

<div class="category-block">
  <h1>Календарь событий</h1>
  <a class="category-href" class:active-page={page === 0} href="./admin">
    События
  </a>
  <a class="category-href" class:active-page={page === 1} href="./admin/users">
    Пользователи
  </a>
  <a
    class="category-href"
    class:active-page={page === 2}
    href="./admin/directory">
    Справочники
  </a>
  <a
    class="category-href"
    class:active-page={page === 3}
    href="./admin/excursions">
    Экскурсии
    <br />
    и туры
  </a>
  <a class="category-href" class:active-page={page === 4} href="./admin/hotels">
    Отели
  </a>
  <a
    class="category-href"
    class:active-page={page === 5}
    href="./admin/banners">
    Баннеры
  </a>
  <a
    class="category-href"
    class:active-page={page === 6}
    href="./admin/collections">
    Подборки
  </a>
  <a
    class="category-href"
    class:active-page={page === 7}
    href="./admin/options">
    Настройки
  </a>
  <a href="/" class="exit">
    <img src="/img/exit.png" alt="exit" />
  </a>
</div>
