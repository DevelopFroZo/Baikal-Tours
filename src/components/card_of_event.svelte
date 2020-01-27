<script>
  import { parseDate, parsePrice } from "../helpers/parsers.js";
  
  export let name = "",
    date_ends = "",
    date_starts = "",
    image_url = "",
    price_min = "",
    price_max = "",
    subjects = "",
    locations = "",
    id = "";

  let dates = [],
    second_price;

  for (let i = 0; i < date_starts.length; i++) {
    if (date_starts[i] !== date_ends[i]) {
      if (date_starts[i] === null) {
        let end = parseDate(new Date(date_ends[i]));
        dates.push("по " + end);
      } else if (date_ends[i] === null) {
        let start = parseDate(new Date(date_starts[i]));
        dates.push("с " + start);
      } else {
        let start = parseDate(new Date(date_starts[i]));
        let end = parseDate(new Date(date_ends[i]));
        dates.push("с " + start + " по " + end);
      }
    }
    else{
      dates.push(parseDate(new Date(date_starts[i])))
    }
  }

  second_price = parsePrice(price_min, price_max);

</script>

<style lang="scss">
  @import "./styles/global";

  .card {
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    width: 235px;
    padding: 16px 12px 10px;
    box-sizing: border-box;
    background-color: $Light_Gray;

    &:hover {
      cursor: pointer;
    }
  }

  h1 {
    font-size: $Big_Font_Size;
    padding-left: 5px;
  }

  .line {
    padding-left: 5px;
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-style: italic;

    & > div {
      margin-left: 7px;
      font-size: $Mini_Font_Size;
      //   text-overflow: ellipsis;
      //   white-space: nowrap;
      //   overflow: hidden;
    }
  }

  .image {
    height: 120px;
    overflow: hidden;
    position: relative;
    border-radius: 5px;

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
    margin-top: 7px;

    & > .price {
      position: absolute;
      top: 10px;
      left: -12px;
      padding: 5px 16px;
      border-radius: 0px 5px 5px 0px;
      background: white;
      box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
      font-size: $Micro_Font_Size;
    }
  }

  .category {
    text-transform: uppercase;
  }
</style>

<div
  class="card"
  on:click={() => {
    document.location.href = './action?id=' + id;
  }}>
  <h1>{name}</h1>
  <div class="line">
    <img src="img/date.png" alt="date" />
    <div>{dates.join('; ')}</div>
  </div>
  <div class="image-and-price">
    <div class="image">
      <img src={image_url === null ? "img/logo.png" : image_url} alt="image of event" />
    </div>
    <div class="price">{second_price}</div>
  </div>
  <div class="line category">
    <img src="img/category.png" alt="category" />
    <div>{subjects.join('; ')}</div>
  </div>
  <div class="line">
    <img src="img/place.png" alt="kategory" />
    <div>{locations.join('; ')}</div>
  </div>
</div>
