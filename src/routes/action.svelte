<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let actionId = page.query.id;
    let locale = session.locale;

    let result_action = await fetcher.get(`/api/actions/${actionId}`, {
      credentials: "same-origin"
    });

    if (result_action.ok) return { result_action, actionId, locale };

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

  export let result_action, actionId, locale;

  const fetcher = new Fetcher();
  const { session } = stores();

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
    contactData = contactsToString(
      data.contact_faces,
      data.emails,
      data.phones
    ),
    actionsParams,
    start = false,
    vkHref,
    twitterHref = "",
    facebookHref = "";

  let transfers = [];
  for(let transfer of data.transfers)
    transfers.push(transfer.name);

  const _ = i18n(locale);

  onMount(() => {
    if (data.images.length > 0) {
      var elem = document.querySelector(".main-carousel");
      var flkty = new Flickity(elem, {
        percentPosition: false,
        imagesLoaded: true
      });
    }
    actionsParams = localStorage.getItem("actionsParams");
    if (actionsParams === null) actionsParams = "./actions";
    start = true;

    vkHref = VK.Share.button(false, {
      type: "custom",
      text: '<img src="/img/vk.png"/>'
    });

    VK.init({
      apiId:
        "7f77ea337f77ea337f77ea33457f07802d77f777f77ea33210313055622a45877ebf0b0",
      onlyWidgets: true
    });
    VK.Widgets.Comments("vk_comments", { limit: 10, attach: "*" });

    twitterHref = encodeURI(data.name + "\n\n" + document.location.href);
    facebookHref = document.location.href;
  });

  $: if (userName !== "" && userPhone !== "" && validateMail(userMail))
    disabled = "";
  else disabled = "disabled";

  second_price = parsePrice(data.price_min, data.price_max, _);

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

  .description-block {
    white-space: pre-wrap;
    margin-top: 35px;
  }

  .line {
    display: flex;
    align-items: flex-start;

    & > .info-image {
      margin-right: 15px;
      min-width: 20px;

      & > img {
        max-width: 16px;
      }
    }

    &:not(:first-child) {
      margin-top: 17px;
    }
  }

  .register-form {
    margin: 55px auto 40px auto;
    padding: 30px 20px 15px;
    background: #f1f1f1;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    box-sizing: border-box;
    display: inline-block;
    position: relative;

    & > .register-info-blocks {
      display: inline-flex;

      & > .inputs-block {
        width: 275px;
        padding-top: 25px;

        & > .input-block:not(:first-child) {
          margin-top: 16px;
        }
      }

      & > .register-categoty-block {
        border: solid $Gray;
        border-width: 0 0 0 1px;
        margin-left: 15px;
        padding-left: 15px;

        & > h2 {
          margin: 0;
          font-size: $LowBig_Font_Size;
        }

        & > .ticket-block {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 200px;
          font-weight: bold;

          & .ticket-price {
            color: $Dark_Gray;
            margin-top: 5px;
          }

          & > .counter {
            display: flex;
            align-items: center;

            & > button {
              width: 17px;
              height: 17px;
              background: white;
              border-radius: 2px;
              border: 1px solid $Gray;
            }

            & > *:not(:first-child) {
              margin-left: 5px;
            }
          }
        }
      }
    }
  }

  label {
    font-weight: bold;
  }

  input {
    background: #ffffff99;
    border: 0.5px solid #00000033;
    box-sizing: border-box;
    box-shadow: inset 0px 0px 2px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    width: 100%;
    margin-top: 6px;
    height: 25px;
    padding-left: 10px;
    box-sizing: border-box;
  }

  .register-button {
    display: block;
    margin: 29px auto 0;
    background: #85da5d;
    box-shadow: inset 0px 0px 7px rgba(0, 0, 0, 0.25);
    border-radius: 100px;
    padding: 15px 9px;
    color: white;
    font-size: $Big_Font_Size;
    transition: 0.3s;
    min-width: 200px;

    &:disabled {
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

  .contact-ul {
    margin-top: 10px;

    & > li {
      margin-top: 5px;
    }
  }

  .main-block {
    min-height: 385px;
    position: relative;
    -webkit-box-shadow: inset 0px -75px 174px -13px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: inset 0px -75px 174px -13px rgba(0, 0, 0, 0.75);
    box-shadow: inset 0px -75px 174px -13px rgba(0, 0, 0, 0.75);
    overflow: hidden;

    & > .form-width {
      padding: 100px 20px 35px;
      display: flex;
      align-items: flex-end;
      min-height: 345px;
      max-height: 345px;

      & > h1 {
        color: white;
        font-size: $UltraBig_Font_Size;
        width: 75%;
      }

      & > div {
        background: white;
        border-radius: 14px;
        box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
        padding: 25px 30px 15px;
        width: 20%;
        font-style: italic;
      }
    }

    & > img {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
      min-width: 100%;
      min-height: 100%;
      z-index: -1;
      filter: brightness(80%);
    }
  }

  .main-block-without-image {
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    & > .form-width {
      padding: 30px 0;

      & > h1 {
        color: black;
      }
    }
  }

  h2 {
    margin: 20px 0 25px;
  }

  .inline-center {
    display: flex;
    justify-content: center;
  }

  .total-price {
    position: absolute;
    right: 30px;
    bottom: 30px;
    font-size: $Big_Font_Size;
    font-weight: bold;
  }

  ul.italic > li:not(:first-child) {
    margin-top: 15px;
  }

  .partners-block {
    display: grid;
    grid-template-columns: repeat(3, 200px);
    justify-content: space-between;
    grid-row-gap: 20px;
    margin-top: 20px;

    & > .partner-block {
      text-align: center;
      width: 200px;

      & > img {
        max-width: 100%;
        max-height: 200px;
        margin-bottom: 10px;
      }
    }
  }

  .contacts-and-place {
    display: flex;
    margin-top: 45px;
    justify-content: space-between;

    & > .contacts-block {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-left: 20px;
      box-sizing: border-box;
      width: calc(100% - 640px);

      & > .contacts {
        width: 155px;
      }

      & h2 {
        margin-bottom: 25px;
      }

      & li {
        margin: 0 !important;
      }

      & > .share {
        display: flex;
        align-items: center;

        & > a:first-child {
          margin-left: 20px;
        }

        & > :global(a:not(:first-child)) {
          margin-left: 5px;
        }
      }
    }

    & > .map-block {
      & > h2 {
        margin-bottom: 10px;
      }

      & > .map {
        width: 640px;
        height: 330px;
        background: $Gray;
      }
    }
  }

  .banners-block {
    margin-top: 35px;

    & > .banners-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      & > h2 {
        font-size: $Big_Font_Size;
        margin: 0;
      }
    }

    & > .banners {
      display: grid;
      grid-template-columns: repeat(4, 200px);
      justify-content: space-between;
      padding-top: 20px;

      & > div {
        width: 200px;
        text-align: center;

        & > .img-block {
          position: relative;
          height: 100px;
          overflow: hidden;
          margin-bottom: 10px;

          & > img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 100%;
            min-height: 100%;
          }
        }
      }
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
    margin: 30px auto 0;
    width: 600px;

    & > h2 {
      margin: 0;
      font-size: 24px;
    }

    & > .similar-events {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(2, 280px);
      justify-content: space-between;

      & > .similar-event {
        width: 280px;

        & > .img-block {
          position: relative;
          height: 150px;
          overflow: hidden;
          margin-bottom: 10px;

          & > img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 100%;
            min-height: 100%;
          }
        }
      }
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

  @media only screen and (max-width: 768px) {
    h1 {
      font-size: $Big_Font_Size;
    }

    .info-block {
      flex-direction: column-reverse;
    }

    .description-block {
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
  <title>{data.title === null ? data.name : data.title}</title>
  <script src="./js/flickity.min.js">

  </script>
  <script
    type="text/javascript"
    src="https://vk.com/js/api/share.js?95"
    charset="windows-1251">

  </script>
  <script type="text/javascript" src="https://vk.com/js/api/openapi.js?167">

  </script>
  <link
    rel="stylesheet"
    href="https://unpkg.com/flickity@2/dist/flickity.min.css" />
</svelte:head>

<Header {locale} />
<BreadCrumbs
  path={[{ name: _('event_catalog'), url: actionsParams }, { name: data.name, url: './action?id=' + actionId }]} />
<div
  class="main-block"
  class:main-block-without-image={data.images.length === 0}>
  {#if data.images.length > 0}
    <img
      src={data.images.filter(el => el.is_main)[0].image_url}
      alt={data.name} />
  {/if}
  <div class="form-width">
    <h1>{data.name}</h1>
    <div class="main-info-block">

      {#if data.dates.length > 0}
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
      {/if}

      {#if data.locations.length > 0}
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
      {/if}

      {#if data.subjects.length > 0}
        <div class="line">
          <div class="info-image">
            <img src="img/birk.png" alt="date" />
          </div>
          <div class="info">
            <ul>
              {#each data.subjects as subjects}
                <li>{subjects.name}</li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}

      <div class="line">
        <div class="info-image">
          <img src="img/price.png" alt="price" />
        </div>
        <div class="info">{_('price')}: {second_price}</div>
      </div>

      <button class="register-button">{_("register")}</button>
    </div>
  </div>

</div>
<div class="form-width">
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

  <div class="description-block">{data.full_description}</div>

  <ul class="italic">
    <li>{_('organizer')}: {data.organizer_name}</li>
    <li>
      {_('how_to_get')}:
      {transfers.join("; ")}
    </li>
  </ul>

  {#if data.partners.length > 0}
    <h2 class="italic-bold">{_('action_partners')}</h2>

    <div class="partners-block">
      {#each data.partners as partner}
        <div class="partner-block">
          <img
            src={partner.image_url}
            alt={partner.name === null ? 'partner' : partner.name} />
          {#if partner.name !== null}{partner.name}{/if}
        </div>
      {/each}
    </div>
  {/if}

  <div class="contacts-and-place">
    <div class="contacts-block">
      <div class="contacts">
        <h2 class="italic-bold">{_('contacts')}</h2>
        <ul class="italic">
          {#if contactData.length > 0}
            {#each contactData as contact}
              <li>{contact}</li>
            {/each}
          {/if}
          {#if data.websites !== null}
            <li>
              <a href={data.websites[0]} target="_blank">
                {_('official_site')}
              </a>
            </li>
          {/if}
          {#if data.vk_link !== null}
            <li>
              <a href={data.vk_link} target="_blank">{_('VK_group')}</a>
            </li>
          {/if}
          {#if data.instagram_link !== null}
            <li>
              <a href={data.instagram_link} target="_blank">{_('instagram')}</a>
            </li>
          {/if}
          {#if data.facebook_link !== null}
            <li>
              <a href={data.facebook_link} target="_blank">{_('facebook')}</a>
            </li>
          {/if}
          {#if data.twitter_link !== null}
            <li>
              <a href={data.twitter_link} target="_blank">{_('twitter')}</a>
            </li>
          {/if}
        </ul>
      </div>
      <div class="share italic">
        {_('share')}
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
    </div>
    <div class="map-block">
      <h2 class="italic-bold">{_('venue')}</h2>
      <div class="map" />
    </div>
  </div>

  {#if $session.isLogged}
    <div class="inline-center">
      <div class="register-form">
        <div class="register-info-blocks">

          <div class="inputs-block">
            <div class="input-block">
              <label for="name">{_('full_name')}</label>
              <br />
              <input type="text" name="name" bind:value={userName} />
            </div>
            <div class="input-block">
              <label for="phone">{_('phone')}</label>
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
          </div>

          <div class="register-categoty-block">
            <h2>{_('ticket_categories')}</h2>
            <div class="ticket-block">
              <div>
                <div>Взрослый</div>
                <div class="ticket-price">1000 {_('rub')}</div>
              </div>
              <div class="counter">
                <button>-</button>
                <div class="couter-value">1</div>
                <button>+</button>
              </div>
            </div>
          </div>

          <div class="register-categoty-block">
            <h2>{_('additionally')}</h2>
            <div class="ticket-block">
              <div>
                <div>Питание</div>
                <div class="ticket-price">100 {_('rub')}</div>
              </div>
              <div class="counter">
                <button>-</button>
                <div class="couter-value">1</div>
                <button>+</button>
              </div>
            </div>
          </div>

        </div>
        <button class="register-button" {disabled} on:click={subscribeUser}>
          {_('register')}
        </button>
        <div class="total-price">3250 {_('rub')}</div>
      </div>
    </div>
  {/if}

  <!-- <div id="vk_comments" /> -->

  <div class="banners-block">
    <div class="banners-info">
      <h2>{_('hotels_nearby')}</h2>
      <a href="/" target="_blank">
        <i>{_('more_hotels')}</i>
      </a>
    </div>
    <div class="banners">
      <div>
        <div class="img-block">
          <img src="/img/test.png" alt="hotel" />
        </div>
        Гостиница Ангара
      </div>
    </div>
  </div>

  <div class="banners-block">
    <div class="banners-info">
      <h2>{_('excursions')}</h2>
      <a href="https://fanatbaikala.ru/excursions" target="_blank">
        <i>{_('more_excursions')}</i>
      </a>
    </div>
    <div class="banners">
      <div>
        <div class="img-block">
          <img src="/img/test.png" alt="hotel" />
        </div>
        Знакомство с Иркутском
      </div>
    </div>
  </div>
</div>

<hr />

<div class="similar-events-block">
  <h2 class="italic-bold">{_('similar_events')}</h2>
  <div class="similar-events">
    <div class="similar-event">
      <div class="img-block">
        <img src="img/test.png" alt="similar-action" />
      </div>
      <i>Фестиваль еды и музыки</i>
    </div>
    <div class="similar-event">
      <div class="img-block">
        <img src="img/test.png" alt="similar-action" />
      </div>
      <i>Фестиваль еды и музыки</i>
    </div>
  </div>
</div>

<hr class="little-margin" />

<div class="footer-banners">
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
</div>

<Footer {locale} />
