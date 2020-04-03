<script>
  export let width, height;
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .selection-block {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: inset 0px -75px 100px -13px rgba(0, 0, 0, 1);
    position: relative;
  }

  p {
    color: white;
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 0;
    font-size: 24px;
    font-family: $Gilroy;
  }

  img{
      position: absolute;
      min-width: 100%;
      min-height: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: -1;
  }
</style>

<a
  class="selection-block"
  style="width: {width}px; height: {height}px;"
  href="/compilation">
  <p>Культурные события Иркутской области</p>
  <img src="/img/test.png" alt="selection image" />
</a>
