<script context = "module">
  export async function preload(page, session) {
    var actionId = page.query.id;
    let response = await this.fetch("/api/actions/" + actionId);
    let result_action = await response.json();

    return { result_action };
  }
</script>

<script>
  import Header from "../components/header.svelte";
  import Footer from "../components/footer.svelte";
  import Fetcher from "./_helpers/fetcher.js";
  import { onMount } from "svelte";
  import { parseDateToDateAndDay } from "../helpers/parsers.js";

  export let result_action;

  const fetcher = new Fetcher();
  let response,
    data = result_action.data,
    resp,
    galaryReady = false,
    mounted = false;

  console.log(data);

  let dates = [];

  for (let i = 0; i < data.dates.length; i++) {
    if (data.dates[i].date_start === null)
      dates.push(parseDateToDateAndDay(data.dates[i].date_end));
    else if (data.dates[i].date_end === null)
      dates.push(parseDateToDateAndDay(data.dates[i].date_start));
    else
      dates.push(
        parseDateToDateAndDay(data.dates[i].date_start) +
          " - " +
          parseDateToDateAndDay(data.dates[i].date_end)
      );
  }

  onMount(() => {
    if (data.images.length > 0) {
      var elem = document.querySelector(".main-carousel");
      var flkty = new Flickity(elem, {
        percentPosition: false,
        imagesLoaded: true
      });
    }
  });
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 45px auto 15px;
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
    flex: 0.33;
  }

  .right-side {
    flex: 0.9;
    white-space: pre-wrap;
    padding-left: 45px;
  }

  .line {
    display: flex;
    align-items: flex-start;

    & > .info {
      white-space: pre-wrap;
    }

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
    padding: 54px 95px 30px;
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
  }

  ul {
    list-style-type: none;
  }

  .carousel-cell {
    & > img {
      height: 250px;
    }
  }

  .flickity-button {
    height: 20px;
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

<Header />
<div class="form-width">
  <h1>{data.name}</h1>
  <p class="italic-bold">{data.tagline}</p>
  <p class="italic">{data.short_description}</p>

  {#if data.images.length > 0}
    <div class="main-carousel">
      {#each data.images as img}
        <div class="carousel-cell">
          <img src={img} alt="img" />
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
            {#each dates as date}
              <li>{date}</li>
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
              <li>{location.name}</li>
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
          <br />
          {data.email}
        </div>
      </div>
      <div class="line">
        <div class="info-image">
          <img src="img/price.png" alt="price" />
        </div>
        <div class="info">
          Цена: {data.price === 0 ? 'бесплатно' : data.price}
        </div>
      </div>
      {#if data.vk_link !== null || data.instagram_link !== null || data.facebook_link !== null || data.twitter_link !== null}
        <div class="line">
          <div class="info-image">
            <img src="img/pages.png" alt="pages" />
          </div>
          <div class="info">
            <ul>
              {#if data.vk_link !== null}
                <li>
                  <a href={data.vk_link}>Группа "ВКонтакте"</a>
                </li>
              {/if}
              {#if data.instagram_link !== null}
                <li>
                  <a href={data.instagram_link}>Инстаграм</a>
                </li>
              {/if}
              {#if data.facebook_link !== null}
                <li>
                  <a href={data.facebook_link}>Фейсбук</a>
                </li>
              {/if}
              {#if data.twitter_link !== null}
                <li>
                  <a href={data.twitter_link}>Твиттер</a>
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
          Трансфер:
          <ul>
            {#each data.transfers as transfer}
              <li>{transfer.name}</li>
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
              <li>{subjects.name}</li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    <div class="right-side">{data.full_description}</div>
  </div>

  <div class="register-form">
    <div class="input-block">
      <label for="name">Имя и фамилия</label>
      <br />
      <input type="text" name="name" />
    </div>
    <div class="input-block">
      <label for="phone">Телефон</label>
      <br />
      <input type="text" name="phone" />
    </div>
    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input type="text" name="email" />
    </div>
    <button class="register-button">Зарегистрироваться</button>
  </div>
</div>
<Footer />
