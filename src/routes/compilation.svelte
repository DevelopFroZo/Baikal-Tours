<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    let locale = session.locale;

    return { locale };
  }
</script>

<script>
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { onMount } from "svelte";

  export let locale;

  const _ = i18n(locale);

  let vkHref = "",
    facebookHref = "",
    twitterHref = "",
    start = false,
    isVkLoad = false;

  onMount(() => {
    start = true;
    if(isVkLoad)
      startVk();
    
    twitterHref = encodeURI("compilation" + "\n\n" + document.location.href);
    facebookHref = document.location.href;
  });

  function vkLoad(){
    isVkLoad = true;
    if(start)
      startVk()
  }

  function startVk(){
    vkHref = VK.Share.button(false, {
      type: "custom",
      text: '<img src="/img/vk.png"/>'
    });
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .main-block {
    height: 350px;
    position: relative;
    overflow: hidden;
    margin-top: 10px;
    -webkit-box-shadow: inset 0px -75px 174px -13px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: inset 0px -75px 174px -13px rgba(0, 0, 0, 0.75);
    box-shadow: inset 0px -75px 174px -13px rgba(0, 0, 0, 0.75);

    & > img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      filter: brightness(80%);
      min-width: 100%;
      min-height: 100%;
      z-index: -1;
      display: block;
    }
  }

  h1 {
    color: white;
    font-size: $MaxBig_Font_Size;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }

  .share {
    display: flex;
    align-items: center;

    & > a:first-child {
      margin-left: 20px;
    }

    & > :global(a:not(:first-child)) {
      margin-left: 5px;
    }
  }

  .line {
    display: flex;
    margin: 25px 0 30px;
    justify-content: space-between;
    align-items: center;
  }

  .main-date {
    display: flex;
    align-items: center;

    & > img {
      margin-right: 10px;
    }
  }

  h2 {
    font-size: 24px;
    margin: 0;
  }

  .description {
    font-size: $Big_Font_Size;
    margin-top: 20px;
    white-space: pre-wrap;
  }

  .events-block {
    margin: 45px 0;

    & > .event-block:nth-child(2n){
        & > .img-block{
            order: 1;
        }

        & > .event-info{
            order: 0;
            padding: 0 40px 70px 0;
        }
    }

    & > .event-block {
      display: flex;
      min-height: 500px;

      & > div {
        width: 50%;
      }

      & > .img-block {
        position: relative;
        overflow: hidden;

        & > img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          min-width: 100%;
          min-height: 100%;
        }
      }

      & > .event-info {
        padding: 0 0 70px 40px;
        box-sizing: border-box;
        position: relative;

        & > *:not(a) {
          margin-top: 20px;
        }

        & > ul {
          font-size: $Medium_Font_Size;
        }

        .price {
          display: block;
        }

        & > .action-description {
          // white-space: pre-wrap;
        }

        & > a {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: $Dark_Blue;
          box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25);
          border-radius: 24px;
          color: white;
          padding: 15px 45px;
          font-size: $Big_Font_Size;
        }
      }
    }
  }
</style>

<svelte:head>
  <title>Подборка</title>

  <script
    type="text/javascript"
    src="https://vk.com/js/api/share.js?95"
    charset="windows-1251" on:load={vkLoad}>

  </script>
</svelte:head>

<Header {locale} />

<div class="main-block">
  <img src="/img/test.png" alt="test" />
  <h1 class="form-width">Культурные события Иркутской области</h1>
</div>

<div class="form-width">
  <div class="line">
    <div class="share">
      <i>{_('share')}</i>
      <a
        class="twitter-share-button"
        href="https://twitter.com/intent/tweet?text={twitterHref}"
        target="_blank">
        <img src="/img/twitter.png" alt="twitter" />
      </a>
      <a
        href="https://www.facebook.com/sharer/sharer.php?u={facebookHref}"
        target="_blank">
        <img src="/img/facebook.png" alt="twitter" />
      </a>
      {@html vkHref}
    </div>
    <div class="main-date">
      <img src="/img/date.png" alt="date" />
      20.20.2020
    </div>
  </div>
  <h2>
    В 2020 году Иркутскую область ждёт множество интересных событий. Каждый
    месяц будут открываться новые выставки и фестивали.
  </h2>
  <div class="description">
    Красочный, веселый и вкусный, фестиваль «Московская Масленица» пройдет с 21
    февраля по 1 марта. Десять дней на площадках по всему городу взрослых и
    детей будут ждать сотни развлечений. Проникнуться атмосферой старинного
    праздника помогут знатоки истории — реконструкторы.
  </div>

  <div class="events-block">
    <div class="event-block">
      <div class="img-block">
        <img src="img/test.png" alt="test" />
      </div>
      <div class="event-info">
        <h2>Название</h2>
        <ul>
          <li>Место проведения</li>
          <li>Дата проведения</li>
        </ul>
        <b class="price">Стоимость</b>
        <div class="action-description">
          Место дислокации – легендарный остров Ольхон. Его ледяные пещеры и
          гроты привлекают туристов со всего мира! От путешествия по льду вокруг
          острова захватывает дух. На Ольхоне более 300 дней в году – солнечных,
          а это значит, что и зимой тучи здесь редкость. Сияние солнца,
          чудо-творения природы изо льда и скал – сокуй, чистый свежий воздух.
          Все, что нужно измученному промозглой зимней серостью организму.
        </div>
        <a href="/">{_("detailed")}</a>
      </div>
    </div>

  </div>
</div>
<Footer {locale} />
