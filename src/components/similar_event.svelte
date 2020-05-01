<script>
  import { parseDateForCards } from "/helpers/parsers.js";
  import Image from "/components/imageCenter.svelte";

  export let _, favorite;

  let dates = parseDateForCards(favorite.date_starts, favorite.date_ends, _)
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .similar-block {
    width: 580px;
    height: 320px;
    position: relative;
    overflow: hidden;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    background: linear-gradient(
      89.11deg,
      rgba(255, 255, 255, 0.46) 0.42%,
      rgba(255, 255, 255, 0) 99.59%
    );
    border-radius: 10px;
    display: block;

    & * {
      transition: 0.3s;
    }

    & > img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 100%;
      z-index: -1;
    }

    & > div {
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 1;
      color: #34353f;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.6);
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      border-radius: 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      & > h4 {
        font-size: 24px;
        font-family: $Playfair;
        width: 260px;
      }

      & > ul {
        margin-top: 15px;
        
        & > li{
          font-size: $LowBig_Font_Size;
        }
      }
    }
  }

  @media only screen and (max-width: 768px){
    .similar-block{
      width: 100%;
      height: 165px;
    }

    h4{
      font-size: $LowBig_Font_Size !important;
    }

    li{
      font-size: $LowMedium_Font_Size;
    }
  }
</style>

<a class="similar-block" href={`/event?id=${favorite.id}`}>
  {#if favorite.image_url !== null}
    <Image src={favorite.image_url} alt={favorite.name}/>
  {/if}
  <div>
    <h4>{favorite.name}</h4>
    <ul class="dates">
      {#each dates as date}
        <li>{date}</li>
      {/each}
    </ul>
  </div>
</a>
