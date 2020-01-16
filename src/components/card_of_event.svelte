<script>
    export let name = "", date = "", img = "", price = "", category = "", place = "";
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
  }

  h1{
      font-size: $Big_Font_Size;
      padding-left: 5px;
  }

  .line{
      padding-left: 5px;
      display: flex;
      align-items: center;
      margin-top: 8px;

      & > div{
          margin-left: 7px;
          font-size: $Micro_Font_Size;
      }
  }

  .image{
      height: 120px;
      overflow: hidden;
      position: relative;
      border-radius: 5px;

      & > img{
          width: 100%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }
  }

  .image-and-price{
      position: relative;
      margin-top: 7px;

      & > .price{
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
</style>

<div class="card">
    <h1>{name}</h1>
    <div class="line">
        <img src = "img/date.png" alt = "date">
        <div>{date}</div>
    </div>
    <div class = "image-and-price">
        <div class = "image">
            <img src = {img} alt = "image of event">
        </div>
        <div class = "price">{price}</div>
    </div>
    <div class="line">
        <img src = "img/category.png" alt = "category">
        <div>{category}</div>
    </div>
    <div class="line">
        <img src = "img/place.png" alt = "kategory">
        <div>{place}</div>
    </div>
</div>
