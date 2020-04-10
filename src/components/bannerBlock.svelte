<script>
    import Image from "/components/imageCenter.svelte";

    export let image_url, name, site, price, isWork = false, _;
</script>

<style lang="scss">
    @import "./styles/colors.scss";

  .banner-block {
    position: relative;
    width: 390px;
    height: 250px;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(
      180deg,
      rgba(59, 57, 74, 0) 61.98%,
      #3b394a 100%
    );

    & > :global(img) {
      z-index: -1;
    }

    & > .banner-info {
      position: absolute;
      bottom: 20px;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 25px;
      z-index: 1;
      width: 100%;
      box-sizing: border-box;

      & > * {
        max-width: 50%;
        font-size: 24px;
      }

      & > h4 {
        color: white;
        font-weight: normal;
      }

      & > .price {
        color: $Orange;
      }
    }
  }

  .isWork{
      pointer-events: none;
  }
</style>

<a class="banner-block" href={`https://${site}`} target="_blank" class:isWork>
  <Image src={image_url} alt={name} />
  <div class="banner-info">
    <h4>{name}</h4>
    <span class="price">{price}{_('rub')}</span>
  </div>
</a>