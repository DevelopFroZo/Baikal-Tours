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
    min-height: 320px;
    position: relative;
    overflow: hidden;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    background: linear-gradient(
      89.11deg,
      rgba(255, 255, 255, 0.46) 0.42%,
      rgba(255, 255, 255, 0) 99.59%
    );
    border-radius: 10px;

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
      width: 50%;
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

      & > a {
        text-align: center;
        color: white;
        font-size: $LowBig_Font_Size;
        width: 200px;
        padding: 15px 0;
        border-radius: 100px;
        border: 2px solid white;
        margin-top: 15px;
        opacity: 0;
      }
    }

    &:hover {
      & * {
        color: white;
      }

      & > div {
        background: rgba(247, 159, 39, 0.5);
        width: 100%;

        & > a {
          opacity: 1;
        }
      }
    }
  }
</style>

<div class="similar-block" href="/compilation">
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
    <a href={`/action?id=${favorite.id}`}>{_('detailed')}</a>
  </div>
</div>
