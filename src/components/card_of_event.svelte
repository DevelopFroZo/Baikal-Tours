<script>
  import { parseDateForCards, parsePrice } from "/helpers/parsers.js";
  import i18n from "/helpers/i18n/index.js";

  export let name,
    date_ends,
    date_starts,
    image_url,
    price_min,
    price_max,
    subjects,
    locations,
    id,
    locale,
    companions,
    saveURL = true;

  const _ = i18n(locale);

  let dates = parseDateForCards(date_starts, date_ends, _);
  let second_price = parsePrice(price_min, price_max, _);
</script>

<style lang="scss">
  @import "./styles/global";

  .card {
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
    width: 380px;
    padding: 40px 0;
    box-sizing: border-box;
    background-color: white;

    &:hover {
      cursor: pointer;
    }

    & > *:not(.image-and-price) {
      padding: 0 40px;
    }
  }

  h4 {
    font-size: 24px;
    font-family: $Playfair;
    color: #4d5062;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .line {
    display: flex;
    align-items: center;
    margin-top: 20px;

    & > div:not(.img) {
      margin-left: 30px;
      font-size: $Mini_Font_Size;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      font-size: $LowBig_Font_Size;
      font-family: $Gilroy;
      color: #434343;
    }

    .img {
      background: $Orange_Gradient;
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.45);
      min-width: 40px;
      max-width: 40px;
      height: 40px;
      position: relative;
      border-radius: 100px;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 20px;
      }
    }
  }

  .image {
    height: 230px;
    overflow: hidden;
    position: relative;
    border-radius: 10px;

    & > img {
      width: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .image-and-price {
    position: relative;
    margin-top: 30px;
    padding: 0 10px;

    & > .price {
      position: absolute;
      top: 30px;
      left: 0px;
      padding: 5px 16px;
      border-radius: 0px 10px 10px 0px;
      background: linear-gradient(185.86deg, #ffffff 24.24%, #efefef 90.54%);
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.15);
      font-size: 20px;
      color: #434343;
    }
  }

  .date-block {
    margin-top: 10px;
    font-size: $LowBig_Font_Size;
    color: #434343;
  }

  @media only screen and (max-width: 768px) {
    .card {
      width: 100%;
    }

    .image {
      height: 200px;
    }
  }
</style>

<div
  class="card"
  on:click={() => {
    if (saveURL) localStorage.setItem('actionsParams', document.location.href);
    document.location.href = './action?id=' + id;
  }}>
  <h4>{name}</h4>
  {#if dates.length !== 0}
    <div class="date-block">{dates.join('; ')}</div>
  {/if}
  <div class="image-and-price">
    <div class="image">
      <img
        src={image_url === null ? 'img/logo.png' : image_url}
        alt="image of event" />
    </div>
    <div class="price">{second_price}</div>
  </div>
  {#if subjects.length !== 0 && subjects[0] !== null}
    <div class="line">
      <div class="img">
        <img src="img/star.svg" alt="category" />
      </div>
      <div>{subjects.join('; ')}</div>
    </div>
  {/if}
  {#if locations.length !== 0 && locations[0] !== null}
    <div class="line">
      <div class="img">
        <img src="img/placeholder.svg" alt="kategory" />
      </div>
      <div>{locations.join('; ')}</div>
    </div>
  {/if}
</div>
