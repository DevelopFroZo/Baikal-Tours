<script>
  import StartRegister from "./_start_register.svelte";
  import ConfirmPassword from "./_confirm_password.svelte";

  let registerStatus = true;
</script>

<svelte:head>
  <title>Регистрация</title>
</svelte:head>

<style lang="scss">
  @import "./styles/inter.scss";

</style>

<div class="body">
  {#if registerStatus}
    <StartRegister on:register={() => (registerStatus = false)} />
  {:else}
    <ConfirmPassword />
  {/if}
</div>
