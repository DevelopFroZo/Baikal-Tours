<script>
  export let width, height;
</script>

<style lang="scss">
  .selection-block {
    border-radius: 7px;
    overflow: hidden;
    box-shadow: inset 0px 50px 77px -13px rgba(0, 0, 0, 0.75);
    position: relative;
  }

  p {
    color: white;
    position: absolute;
    top: 10px;
    left: 10px;
    width: calc(100% / 2);
    z-index: 0;
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
  href="/">
  <p>Культурные события Иркутской области</p>
  <img src="/img/test.png" alt="selection image" />
</a>
