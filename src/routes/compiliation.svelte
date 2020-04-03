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
      text: '<img src="/img/vk-grey.svg"/>'
    });
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .main-block {
    height: 700px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(137.19deg, rgba(255, 255, 255, 0.6) 52.07%, rgba(255, 255, 255, 0));
    background-blend-mode: lighten, normal;

    & > img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 100%;
      z-index: -1;
      display: block;
    }
  }

  h1 {
    color: black;
    font-size: $MaxBig_Font_Size;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    font-family: $Playfair;
    padding-right: 45%;
    box-sizing: border-box;
  }

  .share {
    display: flex;
    align-items: center;
    font-family: $Playfair;
    font-size: $Big_Font_Size;
    font-weight: bold;
    
    & :global(img) {
      margin-left: 20px;
      height: 20px;
    }

    & :global(img:first-child){
      margin-left: 30px;
    }
  }

  .line {
    display: flex;
    margin-top: 100px;
    justify-content: space-between;
    align-items: center;
  }

  .main-date {
    display: flex;
    align-items: center;
    font-size: $LowBig_Font_Size;

    & > .mini-image-block {
      margin-right: 30px;
      width: 30px;
      height: 30px;
      background: $Orange_Gradient;
      border-radius: 100px;
      position: relative;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.45);

      & > img{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
      }
    }
  }

  h2 {
    font-size: 36px;
    margin-top: 75px;
    width: 75%;
    font-family: $Playfair;
  }

  .description {
    font-size: 20px;
    margin-top: 30px;
    white-space: pre-wrap;
    width: 75%;
  }

  .events-block {
    margin-bottom: 115px;
    & > .event-block:nth-child(2n){
        & > .img-block{
            order: 1;
        }

        & > .event-info{
            order: 0;
        }
    }

    & > .event-block {
      display: flex;
      margin-top: 100px;
      justify-content: space-between;

      & > .img-block {
        position: relative;
        overflow: hidden;
        height: 570px;
        width: 570px;

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
        box-sizing: border-box;
        position: relative;
        padding-bottom: 60px;
        width: 570px;

        & > *:not(a) {
          margin-top: 25px;
          color: #434343;
        }

        & > ul {
          font-size: $Big_Font_Size;
          margin-top: 15px;

          & > li:not(:first-child){
            margin-top: 5px;
          }
        }

        .price {
          display: block;
          font-size: 20px;
          color: $Blue;
        }

        & > h3{
          font-size: 36px;
          margin: 0;
          font-family: $Playfair;
        }

        & > .action-description {
          white-space: pre-wrap;
        }

        & > a {
          position: absolute;
          bottom: 0;
          left: 0;
          background: $Blue_Gradient;
          box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          color: white;
          padding: 15px 0;
          width: 250px;
          font-size: $Big_Font_Size;
          text-transform: uppercase;
          text-align: center;
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
      {_('share')}
      <a
        class="twitter-share-button"
        href="https://twitter.com/intent/tweet?text={twitterHref}"
        target="_blank">
        <img src="/img/twitter-grey.svg" alt="twitter" />
      </a>
      <a
        href="https://www.facebook.com/sharer/sharer.php?u={facebookHref}"
        target="_blank">
        <img src="/img/facebook-grey.svg" alt="facebook" />
      </a>
      {@html vkHref}
    </div>
    <div class="main-date">
      <div class="mini-image-block">
        <img src="/img/star.svg" alt="star" />
      </div>
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
        <h3>Название</h3>
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

    <div class="event-block">
      <div class="img-block">
        <img src="img/test.png" alt="test" />
      </div>
      <div class="event-info">
        <h3>Название</h3>
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
