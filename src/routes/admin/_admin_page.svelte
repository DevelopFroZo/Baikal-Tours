<script>
  import HrefMenu from "./_href_menu.svelte";

  export let page;
</script>

<style lang="scss">
  @import "./styles/admin.scss";
</style>

<div class="admin-block">
  <div class="form-width">
    <HrefMenu {page} />
    <div class="admin-page">
      <slot />
    </div>
  </div>
</div>
