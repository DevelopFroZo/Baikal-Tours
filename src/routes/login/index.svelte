<script>
  import StartLogin from "./_start_login.svelte";
  import ForgotPassword from "./_forgot_password.svelte";
  let forgot = false;
</script>

<style lang="scss">
    @import "./styles/inter.scss";
</style>

<svelte:head>
  <title>Регистрация</title>
</svelte:head>

<div class="body">
  {#if !forgot}
    <StartLogin on:forgotPassword={() => (forgot = true)} />
  {:else}
    <ForgotPassword />
  {/if}
</div>
