<script context = "module">
  export async function preload(page, session) {
    let actionId = page.query.id;
    let response = await this.fetch("/api/actions/" + actionId, {
      credentials: "same-origin"
    });
    let result_action = await response.json();
    let locale = session.locale;

    return { result_action, actionId, locale };
  }
</script>

<script>
  import Fetcher from "/helpers/fetcher.js";
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { onMount } from "svelte";
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import { parseDateToDateAndDay, parsePrice } from "/helpers/parsers.js";
  import { validateMail, validatePhone } from "/helpers/validators.js";
  import {contactsToString, dateToString } from "/helpers/converters.js";
  import i18n from "/helpers/i18n/index.js";

  export let result_action, actionId, locale;

  //console.log(result_action)

  const fetcher = new Fetcher();
  let response,
    data = result_action.data,
    resp,
    galaryReady = false,
    mounted = false,
    second_price,
    userName = "",
    userPhone = "",
    userMail = "",
    disabled = "disabled",
    contactData = contactsToString(data.contact_faces, data.emails, data.phones);

  const _ = i18n( locale );

  onMount(() => {
    if (data.images.length > 0) {
      var elem = document.querySelector(".main-carousel");
      var flkty = new Flickity(elem, {
        percentPosition: false,
        imagesLoaded: true
      });
    }
  });

  $: if (userName !== "" && userPhone !== "" && validateMail(userMail))
    disabled = "";
  else disabled = "disabled";

  second_price = parsePrice(data.price_min, data.price_max, _);

  async function subscribeUser(){
    let subscribeStatus = await fetcher.post("/api/actions/subscribe/" + actionId, {
      name: userName,
      phone: userPhone,
      email: userMail
    });

    if (subscribeStatus.ok) alert("Вы успешно подписались на событие");
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

  .info-block {
    display: flex;
    align-items: flex-start;
    margin-top: 57px;
  }

  .left-side {
    font-style: italic;
    flex: 0.4;
  }

  .right-side {
    flex: 0.9;
    white-space: pre-wrap;
    padding-left: 45px;
  }

  .line {
    display: flex;
    align-items: flex-start;

    & > .info-image {
      margin-right: 15px;
      min-width: 20px;
    }

    &:not(:first-child) {
      margin-top: 17px;
    }
  }

  .register-form {
    margin: 68px auto 42px;
    width: 500px;
    padding: 54px 47px 30px;
    background: #f1f1f1;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    box-sizing: border-box;
  }

  label {
    font-weight: bold;
  }

  input {
    background: #ffffff99;
    border: 0.5px solid #00000033;
    box-sizing: border-box;
    box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    width: 100%;
    margin-top: 6px;
    height: 20px;
  }

  .input-block:not(:first-child) {
    margin-top: 16px;
  }

  .register-button {
    display: block;
    margin: 29px auto 0;
    background: #85da5d;
    box-shadow: inset 0px 0px 7px rgba(0, 0, 0, 0.25);
    border-radius: 15px;
    padding: 15px 9px;
    color: white;
    font-size: $Big_Font_Size;
    transition: 0.3s;
    min-width: 200px;

    &:disabled{
      opacity: 0.3;
    }
  }

  ul {
    list-style-type: none;
  }

  .main-carousel {
    margin-top: 20px;
  }

  .carousel-cell {
    & > img {
      height: 250px;
      max-width: 840px;
    }
  }

  .flickity-button {
    height: 20px;
  }

  .contact-ul{
    margin-top: 10px;

    & > li{
      margin-top: 5px;
    }
  }

  @media only screen and (max-width: 768px) {
    h1{
      font-size: $Big_Font_Size;
    }

    .info-block{
      flex-direction: column-reverse;
    }

    .right-side{
      padding: 0;
    }

    .left-side{
      margin-top: 30px;
    }

    .register-form{
      width: 100%;
      padding: 30px 50px;
    }
  }
</style>

<svelte:head>
  <title>{data.title === null ? data.name : data.title}</title>
  <script src="./js/flickity.min.js">

  </script>
  <link
    rel="stylesheet"
    href="https://unpkg.com/flickity@2/dist/flickity.min.css" />
</svelte:head>

<Header locale={locale}/>
<BreadCrumbs path = {[{name: _("event_catalog"), url: "./"}, {name: data.name, url: "./action?id=" + actionId}]} />
<div class="form-width">
  <h1>{data.name}</h1>
  <p class="italic-bold">{data.tagline}</p>
  <p class="italic">{data.short_description}</p>

  {#if data.images.length > 0}
    <div class="main-carousel">
      {#each data.images as img}
        <div class="carousel-cell">
          <img src={img.image_url} alt="img" />
        </div>
      {/each}
    </div>
  {/if}

  <div class="info-block">
    <div class="left-side">
      <div class="line">
        <div class="info-image">
          <img src="img/date.png" alt="date" />
        </div>
        <div class="info">
          <ul>
            {#each data.dates as date}
              <li>{dateToString(date, _)}</li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="line">
        <div class="info-image">
          <img src="img/place.png" alt="place" />
        </div>
        <div class="info">
          <ul>
            {#each data.locations as location}
              <li>
                {location.name + (location.address === null ? '' : ', ' + location.address)}
              </li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="line">
        <div class="info-image">
          <img src="img/org.png" alt="organisation" />
        </div>
        <div class="info">
          {data.organizer_name}
          {#if contactData.length > 0}
            <ul class = "contact-ul">
              {#each contactData as contact}
                  <li>{contact}</li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
      <div class="line">
        <div class="info-image">
          <img src="img/price.png" alt="price" />
        </div>
        <div class="info">{_("price")}: {second_price}</div>
      </div>
      {#if data.vk_link !== null || data.instagram_link !== null || data.facebook_link !== null || data.twitter_link !== null || data.websites !== null}
        <div class="line">
          <div class="info-image">
            <img src="img/pages.png" alt="pages" />
          </div>
          <div class="info">
            <ul>
              {#if data.websites !== null}
                <li>
                  <a href={data.websites[0]} target="_blank">
                    {_("official_site")}
                  </a>
                </li>
              {/if}
              {#if data.vk_link !== null}
                <li>
                  <a href={data.vk_link} target="_blank">{_("VK_group")}</a>
                </li>
              {/if}
              {#if data.instagram_link !== null}
                <li>
                  <a href={data.instagram_link} target="_blank">{_("instagram")}</a>
                </li>
              {/if}
              {#if data.facebook_link !== null}
                <li>
                  <a href={data.facebook_link} target="_blank">{_("facebook")}</a>
                </li>
              {/if}
              {#if data.twitter_link !== null}
                <li>
                  <a href={data.twitter_link} target="_blank">{_("twitter")}</a>
                </li>
              {/if}
            </ul>
          </div>
        </div>
      {/if}
      <div class="line">
        <div class="info-image">
          <img src="img/transfer.png" alt="transfer" />
        </div>
        <div class="info">
          {_("transfer")}
          <ul>
            {#each data.transfers as transfer}
              <li>{transfer}</li>
            {/each}
          </ul>
        </div>
      </div>
      <div class="line">
        <div class="info-image">
          <img src="img/birk.png" alt="date" />
        </div>
        <div class="info">
          <ul>
            {#each data.subjects as subjects}
              <li>{subjects}</li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    <div class="right-side">{data.full_description}</div>
  </div>

  <div class="register-form">
    <div class="input-block">
      <label for="name">{_("full_name")}</label>
      <br />
      <input type="text" name="name" bind:value={userName} />
    </div>
    <div class="input-block">
      <label for="phone">{_("phone")}</label>
      <br />
      <input
        type="text"
        name="phone"
        bind:value={userPhone}
        on:keydown={validatePhone} />
    </div>
    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input type="text" name="email" bind:value={userMail} />
    </div>
    <button class="register-button" {disabled} on:click={subscribeUser}>{_("register")}</button>
  </div>
</div>
<Footer locale={locale}/>