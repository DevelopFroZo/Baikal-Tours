<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import { parseDate } from "/helpers/parsers.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let actionId = page.query.id;
    let locale = session.locale;

    let result_action = await fetcher.get(`/api/actions/${actionId}`, {
      credentials: "same-origin"
    });

    if (result_action.ok){
      result_action = result_action.data;

      let firstSimilarDate = new Date(result_action.dates[0].date_start);
      firstSimilarDate.setDate(firstSimilarDate.getDate() + 1);
      firstSimilarDate = parseDate(firstSimilarDate);

      let similar_events = (await fetcher.get("/api/actions/", {
        credentials: "same-origin",
        query: {
          filter: "",
          dateStart: firstSimilarDate,
          subjects: [result_action.subjects[0].id],
          count: 2
        }
      })).actions;
      return { result_action, actionId, locale, similar_events };
    } 

    this.error(404, "page not found");
  }
</script>

<script>
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { onMount } from "svelte";
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import { parsePrice } from "/helpers/parsers.js";
  import { validateMail, validatePhone } from "/helpers/validators.js";
  import { contactsToString, dateToString } from "/helpers/converters.js";
  import i18n from "/helpers/i18n/index.js";
  import { stores } from "@sapper/app";
  import SimilarEvent from "/components/similar_event.svelte";
  import * as animateScroll from "svelte-scrollto";
  import Carousel from "/components/carousel.svelte";
  import Image from "/components/imageCenter.svelte";
  import BannerBlock from "/components/bannerBlock.svelte";
  import { slide } from "svelte/transition";

  export let result_action, actionId, locale, similar_events;

  const fetcher = new Fetcher();
  const { session } = stores();
  const _ = i18n(locale);

  let response,
    resp,
    second_price,
    userName = "",
    surname = "",
    userPhone = "",
    userMail = "",
    disabled = "disabled",
    actionsParams,
    start = false,
    vkHref,
    twitterHref = "",
    facebookHref = "",
    initEditor = false,
    registerBlock,
    transfers,
    total;

  for(let ticket of result_action.buyable)
    ticket.count = 0;

  $: {
    total = 0;

    for(let ticket of result_action.buyable)
      total += ticket.count * ticket.price;
  }

  $: {
    result_action;
    changeAllData();
  }

  $: if (userName !== "" && userPhone !== "" && validateMail(userMail))
    disabled = "";
  else disabled = "disabled";

  function changeAllData(){
    transfers = [];
    for(let transfer of result_action.transfers)
      transfers.push(transfer.name);

    second_price = parsePrice(result_action.price_min, result_action.price_max, _);

    if(start){
      setShare();
      startEditor();
    }
    
  }

  onMount(() => {
    actionsParams = localStorage.getItem("actionsParams");
    if (actionsParams === null) actionsParams = "./actions";

    start = true;
    if(initEditor)
      startEditor();

    setShare();
  });

  function setShare(){
    vkHref = VK.Share.button(false, {
      type: "custom",
      text: '<img src="/img/vk-grey.svg"/>'
    });

    twitterHref = encodeURI(result_action.name + "\n\n" + document.location.href);
    facebookHref = document.location.href;
  }
  
  async function subscribeUser() {
    let subscribeStatus = await fetcher.post(
      "/api/actions/subscribe/" + actionId,
      {
        name: userName,
        phone: userPhone,
        email: userMail
      }
    );

    if (subscribeStatus.ok) alert("Вы успешно подписались на событие");
  }

  function startEditor(){
    var editorText = new Quill("#description-block",{
      readOnly: true
    })
    
    editorText.setContents(editorText.clipboard.convert(result_action.full_description.replace(/\n/g, "</br>")))
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 15px auto 15px;
    min-height: calc(100vh - 175px - 60px);
    font-size: $Medium_Font_Size;
  }

  h1 {
    font-weight: bold;
    font-size: $UltraBig_Font_Size;
  }

  .italic-bold {
    font-weight: bold;
    font-style: italic;
    font-size: $LowBig_Font_Size;
    margin-top: 32px;
  }

  .italic {
    margin-top: 20px;
    font-style: italic;
  }

  #description-block {
    margin-top: 35px;
  }

  .register-center{
    display: flex;
    justify-content: center;
  }

  .register-form {
    margin-top: 100px;
    background: #F5F7FA;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 20px;
    box-sizing: border-box;
    display: inline-block;
    position: relative;

    & > hr{
      border-color: #E7E7E7;
      margin: 0;
    }

    & > .register-info-blocks {
      display: inline-flex;
      padding: 85px 50px 30px;

      & > .inputs-block {
        width: 340px;
        padding-top: 70px;

        & > .input-block:not(:first-child) {
          margin-top: 30px;
        }

        & > .input-block{
          position: relative;

          input {
            background: white;
            box-sizing: border-box;
            box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
            border-radius: 100px;
            width: 100%;
            padding: 15px 50px 15px 20px; 
            box-sizing: border-box;
            width: 100%;
            font-size: $Big_Font_Size;
          }

          & > .img-block{
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            border-radius: 100px;
            background: $Orange_Gradient;
            box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.45);

            & > img{
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              height: 15px;
            }
          }
        }
      }

      & > .register-categoty-block {
        padding-left: 20px;
        margin-left: 20px;
        width: 360px;
        box-sizing: border-box;

        & > h2 {
          margin: 0 0 38px 0;
          font-size: 24px;
          font-family: $Playfair;
          text-align: center;
        }

        & .ticket-block {
          display: flex;
          justify-content: space-between;
          align-items: center;

          & > *{
            font-size: 24px;
          }

          &:not(:first-child){
            margin-top: 25px;
          }

          & .ticket-price {
            color: $Blue;
          }

          & > .counter {
            display: flex;
            align-items: center;

            & > button {
              width: 30px;
              height: 30px;
              border-radius: 100px;
              font-size: $Big_Font_Size;

              &:first-child{
                background: linear-gradient(193.13deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
              }

              &:last-child{
                background: $Orange_Gradient;
                box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
              }
            }

            & > *:not(:first-child) {
              margin-left: 20px;
            }
          }
        }
      }
    }
  }

  label {
    font-weight: bold;
  }

  .register-button {
    display: block;
    background: $Blue_Gradient;
    box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    border-radius: 100px;
    padding: 15px 50px;
    color: white;
    font-size: $LowBig_Font_Size;
    transition: 0.3s;

    &:disabled {
      opacity: 0.3;
    }
  }

  ul {
    list-style-type: none;
  }

  .main-carousel {
    margin-top: 90px;
  }

  .carousel-cell {
    height: 350px;
    width: 500px !important;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .contact-ul {
    margin-top: 10px;

    & > li {
      margin-top: 5px;
    }
  }

  .main-block {
    min-height: 650px;
    position: relative;
    background: linear-gradient(126.58deg, rgba(255, 255, 255, 0.6) 50.56%, rgba(255, 255, 255, 0) 58.16%);
    overflow: hidden;

    & > .form-width {
      padding-top: 235px;
      padding-right: 40%;
      box-sizing: border-box;

      & > h1 {
        font-size: 36px;
        font-family: $Playfair;
        margin-top: 20px;
        color: #34353F;
      }

      & > button{
        margin-top: 40px;
      }
    }

    & > :global(img) {
      z-index: -1;
    }
  }

  h2 {
    margin: 20px 0 25px;
  }

  .total-price {
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #4D5062;

    & > span{
      color: $Blue;
      font-size: 26px;
    }
  }

  ul.italic > li:not(:first-child) {
    margin-top: 15px;
  }

  .partners-block{
    margin-top: 100px;

    & > h3{
      font-family: $Playfair;
      margin: 0;
      font-size: $UltraBig_Font_Size;
      color: #34353F;
    }
  }

  .partners-carousel {
    margin-top: 40px;

    & :global(.flickity-viewport){
      overflow: visible;
    }

    & .partner-block {
      text-align: center;
      width: 280px;
      height: 180px;
      background: white;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      position: relative;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 80%;
        max-height: 80%;
      }

      &:not(:first-child){
        margin-left: 25px;
      }
    }
  }

  .contacts-and-place {
    display: flex;
    margin-top: 45px;
    justify-content: space-between;

    & > .contacts-block {
      padding-left: 20px;
      box-sizing: border-box;
      width: calc(100% - 800px - 50px);
      padding: 0;

      & h2 {
        font-family: $Playfair;
        margin: 0;
        margin-top: -10px;
        color: #34353F;
        font-size: $UltraBig_Font_Size;
      }

      & li {
        margin: 0 !important;
      }
    }

    & > .map-block {

      & > .map {
        width: 800px;
        height: 350px;
        background: $Gray;
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
        border-radius: 10px;
        overflow: hidden;
        position: relative;

        & h3{
          position: absolute;
          top: 30px;
          left: 0;
          background: linear-gradient(182.54deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
          box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
          border-radius: 0px 10px 10px 0px;
          padding: 15px 20px;
          max-width: 425px;
          z-index: 2;
          font-size: $Big_Font_Size;
          font-family: $Playfair;
        }
      }
    }
  }

  .share {
    display: flex;
    align-items: center;
    font-family: $Playfair;
    font-size: $Big_Font_Size;
    margin-top: 35px;
    font-weight: bold;
    
    & :global(img) {
      margin-left: 20px;
      height: 20px;
    }

    & :global(img:first-child){
      margin-left: 30px;
    }
  }

  .banners-block {
    margin-top: 100px;

    & > .banners-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      & > h2 {
        font-size: $UltraBig_Font_Size;
        color: #34353F;
        font-family: $Playfair;
        margin: 0;
      }

      & > a{
        font-size: $Big_Font_Size;
        color: #34353F;
        text-decoration: underline;
      }
    }

    & > .banners {
      display: grid;
      grid-template-columns: repeat(3, auto);
      justify-content: space-between;
      margin-top: 40px;
    }
  }

  hr {
    border-top: 1px solid black;
    margin: 50px 0 30px;
  }

  .auto-height {
    min-height: auto !important;
  }

  .similar-events-block {
    margin-top: 100px;
    margin-bottom: 100px;

    & > h2 {
      margin: 0;
      font-size: $UltraBig_Font_Size;
      font-family: $Playfair;
    }

    & > .similar-events {
      margin-top: 45px;
      display: grid;
      grid-template-columns: repeat(2, auto);
      justify-content: space-between;
    }
  }

  .footer-banners {
    background: $Light_Gray;
  }

  .form-width.banners-block {
    text-align: left;
    margin: auto;
    padding: 25px 0 20px;

    & .banners {
      & > div {
        text-align: left;
        font-style: italic;
        font-size: $LowBig_Font_Size;
      }
    }
  }

  .little-margin {
    margin: 25px 0 0 0;
  }

  :global(.ql-editor){
    padding: 0 !important;
  }

  .subjects-block{
    display: flex;
    align-items: center;

    & > li{
      display: flex;
      align-items: center;
      color: rgba(52, 53, 63, 0.7);
      font-size: $Big_Font_Size;
    }

    & .point{
      width: 7px;
      height: 7px;
      border-radius: 10px;
      border: 1px solid rgba(52, 53, 63, 0.7);
      box-sizing: border-box;
      margin: 0 15px;
    }
  }

  .locations-block{
    margin-top: 20px;

    & li{
      color: rgba(52, 53, 63, 0.7);
      font-weight: bold;
      font-size: $Big_Font_Size;

      &:not(:first-child){
        margin-top: 10px;
      }
    }
  }

  .short-description{
    width: 65%;
    font-size: 24px;
    font-weight: bold;
    margin-top: 50px;
  }

  #description-block{
    width: 800px;
    margin: 140px auto 0;
    font-size: 20px;
  }

  .contacts-block{
    background: #F5F5F5;
    padding: 100px 0;
    margin-top: 100px;

    & > .form-width{
      min-height: auto;
    }
  }

  .line {
    display: flex;
    align-items: flex-start;
    margin-top: 30px;

    & > .img-block {
      margin-right: 15px;
      min-width: 30px;
      max-width: 30px;
      height: 30px;
      background: linear-gradient(315deg, #F8A822 26.87%, #FCD41F 91.87%);
      position: relative;
      border-radius: 100px;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 15px;
      }

      &.vk{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.facebook{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.twitter{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.instagram{
        background: linear-gradient(315deg, #D33D93 26.87%, #FFCA52 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }
    }

    & li{
      font-size: $Big_Font_Size;
      color: #34353F;
      width: 300px;

      & > a{
        color: #348EE0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 300px;
        display: block;
      }
    }

    &.contacts-flex{
      align-items: center;
    }
  }

  .final-price-block{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 30px 50px 60px;

    & > *{
      width: 340px;
    }

    & > button{
      margin-top: 30px;
    }
  }

  .only-inputs{
    padding-top: 0px !important;
  }

  @media only screen and (max-width: 768px) {
    h1 {
      font-size: $Big_Font_Size;
    }

    .info-block {
      flex-direction: column-reverse;
    }

    #description-block {
      padding: 0;
    }

    .left-side {
      margin-top: 30px;
    }

    .register-form {
      width: 100%;
      padding: 30px 50px;
    }
  }
</style>

<svelte:head>
  <title>{result_action.title === null ? result_action.name : result_action.title}</title>

  <script
    type="text/javascript"
    src="https://vk.com/js/api/share.js?95"
    charset="windows-1251"></script>

  <script src="//cdn.quilljs.com/1.3.6/quill.js" on:load={() => {
    initEditor = true;
    if(start)
      startEditor()
  }}></script>
  <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
</svelte:head>

<Header {locale} />
<!-- <BreadCrumbs
  path={[{ name: _('event_catalog'), url: actionsParams }, { name: result_action.name, url: './action?id=' + actionId }]} /> -->
<div
  class="main-block">
  {#if result_action.images.length > 0}
    <Image
      src={result_action.images.filter(el => el.is_main)[0].image_url}
      alt={result_action.name} />
  {/if}
  <div class="form-width">
    {#if result_action.subjects.length > 0}
      <ul class="subjects-block">
        {#each result_action.subjects as subjects, i}
          <li>{subjects.name}
            {#if result_action.subjects.length !== i + 1}
              <div class="point" />
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
    <h1>{result_action.name}</h1>
    <div class="locations-block">
      {#if result_action.locations.length > 0}
        <ul>
          {#each result_action.locations as location}
            <li>
              {location.name + (location.address === null ? '' : ', ' + location.address)}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    {#if $session.isLogged}
      <button class="register-button" on:click={() => {
        animateScroll.scrollTo({offset: registerBlock.offsetTop - 150, duration: 1500})
      }}>{_("register")}</button>
    {/if}
  </div>

</div>
<div class="form-width">
  <!-- <p class="italic-bold">{result_action.tagline}</p> -->
  <p class="short-description">{result_action.short_description}</p>

  {#if result_action.images.length > 0}
    <div class="main-carousel">
      <Carousel data={{slidesPerView: 'auto', preloadImages: "false", centeredSlides: true, spaceBetween: 25, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}}
      carouselData={result_action.images}>
        {#each result_action.images as img}
          <div class="carousel-cell swiper-slide">
            <Image src={img.image_url} alt={"img"}/>
          </div>
        {/each}       
      </Carousel>
    </div>
  {/if}

  <div id="description-block"></div>

  <!-- <ul class="italic">
    <li>{_('organizer')}: {result_action.organizer_name}</li>
    <li>
      {_('how_to_get')}:
      {transfers.join("; ")}
    </li>
  </ul> -->

  {#if result_action.partners.length > 0}
    <div class="partners-block">
      <h3>{_('action_partners')}</h3>

      <div class="partners-carousel">
        <Carousel data={{slidesPerView: 'auto',spaceBetween: 25, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}}
        carouselData={result_action.partners}>
          {#each result_action.partners as partner}
            <div class="partner-block swiper-slide">
              <img
                src={partner.image_url}
                alt={partner.name === null ? 'partner' : partner.name} />
            </div>
          {/each}
        </Carousel>
        
      </div>
    </div>
  {/if}
</div>

<div class="contacts-block">
  <div class="form-width contacts-and-place">
    <div class="contacts-block">
      <div class="contacts">
        <h2>{_('contacts')}</h2>

          {#if result_action.emails !== null}
          <div class="line" class:contacts-flex={result_action.emails.length > 0}>
            <div class="img-block">
              <img src="/img/mail.svg" alt="email">
            </div>
            <ul> 
              {#each result_action.emails as email}
                <li>
                  {email}
                </li>
              {/each}
            </ul>
          </div>
          {/if}

          {#if result_action.phones !== null}
          <div class="line" class:contacts-flex={result_action.phones.length > 0}>
            <div class="img-block">
              <img src="/img/phone-call.svg" alt="phone">
            </div>
            <ul> 
              {#each result_action.phones as phone}
                <li>
                  {phone}
                </li>
              {/each}
            </ul>
          </div>
          {/if}

          {#if result_action.websites !== null}
          <div class="line contacts-flex">
            <div class="img-block">
              <img src="/img/internet.svg" alt="site">
            </div>
            <ul>
              <li>
                <a href={result_action.websites[0]} target="_blank">
                  {result_action.websites[0]}
                </a>
              </li>
            </ul>
          </div>
          {/if}

          {#if result_action.vk_link !== null}
            <div class="line contacts-flex">
              <div class="img-block vk">
                <img src="/img/vk-white.svg" alt="vk">
              </div>
              <ul>
                <li>
                  <a href={result_action.vk_link} target="_blank">{result_action.vk_link}</a>
                </li>
              </ul>
            </div>
          {/if}

          {#if result_action.instagram_link !== null}
            <div class="line contacts-flex">
              <div class="img-block instagram">
                <img src="/img/insta-white.svg" alt="instagram">
              </div>
              <ul>
                <li>
                  <a href={result_action.instagram_link} target="_blank">{result_action.instagram_link}</a>
                </li>
              </ul>
            </div>
          {/if}

          {#if result_action.facebook_link !== null}
            <div class="line contacts-flex">
              <div class="img-block facebook">
                <img src="/img/facebook-white.svg" alt="facebook">
              </div>
              <ul>
                <li>
                  <a href={result_action.facebook_link} target="_blank">{result_action.facebook_link}</a>
                </li>
              </ul>
            </div>
          {/if}

          {#if result_action.twitter_link !== null}
            <div class="line contacts-flex">
              <div class="img-block twitter">
                <img src="/img/twitter.svg" alt="twitter">
              </div>
              <ul>
                <li>
                  <a href={result_action.twitter_link} target="_blank">{result_action.twitter_link}</a>
                </li>
              </ul>
            </div>
          {/if}
      </div>
    </div>
    <div class="map-block">
      <div class="map">
        <div class="location-block">
          <h3>{_('venue')}: 
          {#each result_action.locations as location}
            <span>
              {location.name + (location.address === null ? '' : ', ' + location.address)}
            </span>
          {/each}
          </h3>
        </div>
      </div>
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
    </div>
  </div>
</div>

<div class="form-width" bind:this={registerBlock}>
  {#if $session.isLogged}
    <div class="register-center">
      <div class="register-form">
        <div class="register-info-blocks">
          <div class="inputs-block" class:only-inputs={result_action.buyable.length === 0}>
            <div class="input-block">
              <input type="text" bind:value={userName} placeholder={_("name")}/>
              <div class="img-block">
                <img src="/img/user-black.svg" alt="user">
              </div>
            </div>
            <div class="input-block">
              <input type="text" bind:value={userName} placeholder={_("surname")}/>
              <div class="img-block">
                <img src="/img/user-black.svg" alt="user">
              </div>
            </div>
            <div class="input-block">
              <input
                type="text"
                bind:value={userPhone}
                on:keydown={validatePhone} 
                placeholder={_("phone")}/>
              <div class="img-block">
                <img src="/img/phone-call.svg" alt="phone">
              </div>
            </div>
            <div class="input-block">
              <input type="text" bind:value={userMail} placeholder="e-mail"/>
              <div class="img-block">
                <img src="/img/mail.svg" alt="e-mail">
              </div>
            </div>
          </div>
          
          {#if result_action.buyable.filter(el => el.type === "ticket").length > 0}
          <div class="register-categoty-block">
            <h2>{_('ticket_categories')}</h2>
            <div class="tickets-block">
              {#each result_action.buyable.filter(el => el.type === "ticket") as ticket}
                <div class="ticket-block">
                  <div>
                    <div>{ticket.name}</div>
                    <div class="ticket-price">{ticket.price} {_('rub')}</div>
                  </div>
                  <div class="counter">
                    <button on:click={() => ticket.count = ticket.count - 1 < 0 ? 0 : ticket.count - 1 }>-</button>
                    <div class="couter-value">{ticket.count}</div>
                    <button on:click={() => ticket.count++}>+</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          {/if}

          {#if result_action.buyable.filter(el => el.type === "addition").length > 0}
          <div class="register-categoty-block">
            <h2>{_('additionally')}</h2>
            <div class="tickets-block">
              {#each result_action.buyable.filter(el => el.type === "addition") as ticket}
                <div class="ticket-block">
                  <div>
                    <div>{ticket.name}</div>
                    <div class="ticket-price">{ticket.price} {_('rub')}</div>
                  </div>
                  <div class="counter">
                    <button on:click={() => ticket.count = ticket.count - 1 < 0 ? 0 : ticket.count - 1}>-</button>
                    <div class="couter-value">{ticket.count}</div>
                    <button on:click={() => ticket.count++}>+</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          {/if}
        </div>
        <hr />
        <div class="final-price-block">
          {#if total > 0}
            <div class="total-price" transition:slide>{_("total")}<span>{total} {_('rub')}</span></div>
          {/if}
          <button class="register-button" on:click={subscribeUser}>
            {total === 0 ? _('register') : _("buy_tickets")}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div class="banners-block">
    <div class="banners-info">
      <h2>{_('hotels_nearby')}</h2>
      <a href="/" target="_blank">{_('more_hotels')}</a>
    </div>
    <div class="banners">
      {#each [1,2,3] as bn}
        <div class="banner-block">
          <img src="/img/test.png" alt="hotel" />
          <div class="banner-info">
            <h4>Гостиница Виктория</h4>
            <span class="price">от 1500 {_("rub")}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  {#if result_action.excursions.length > 0}
    <div class="banners-block">
      <div class="banners-info">
        <h2>{_('excursions')}</h2>
        <a href="https://fanatbaikala.ru/excursions" target="_blank">{_('more_excursions')}</a>
      </div>
      <div class="banners">
        {#each result_action.excursions as excursion}
          <BannerBlock {...excursion} {_} />
        {/each}
      </div>
    </div>
  {/if}

  {#if result_action.tours.length > 0}
  <div class="banners-block">
    <div class="banners-info">
      <h2>{_('tours')}</h2>
      <a href="https://fanatbaikala.ru/tours" target="_blank">{_('more_excursions')}</a>
    </div>
    <div class="banners">
      {#each result_action.tours as tour}
        <BannerBlock {...tour} {_} />
      {/each}
    </div>
  </div>
  {/if}

  <div class="similar-events-block">
    <h2>{_('similar_events')}</h2>
    <div class="similar-events">
      {#each similar_events as favorite}
        <SimilarEvent {_} {favorite}/>
      {/each}
    </div>
  </div>
</div>

<!-- <div class="footer-banners">
  <div class="form-width auto-height banners-block">
    <div class="banners">
      <div>
        <div class="img-block">
          <img src="/img/test.png" alt="hotel" />
        </div>
        Знакомство с Иркутском
      </div>
    </div>
  </div>
</div> -->

<Footer {locale} />
