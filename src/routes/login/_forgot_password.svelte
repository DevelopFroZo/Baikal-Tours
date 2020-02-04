<script>
  import { createEventDispatcher } from "svelte";

  export let _;

  const dispatch = createEventDispatcher();
  let email = "";

  function login() {
    dispatch("login");
  }

</script>

<style lang="scss">
  @import "./styles/inter";
</style>

<div class="register-block">
  <div class="in-block">
    <h1>{_("forgor_password")}</h1>

    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input name="email" id="email" type="text" bind:value={email} />
    </div>

    <button
      id="login"
      class="blue-button"
      disabled={email === '' ? 'disabled' : ''}>
      {_("get_new_password")}
    </button>

    <button class="blue-text forgot-password" on:click={login}>
      {_("return_login_page")}
    </button>
  </div>

  <a href="./">{_("return_to_home")}</a>
</div>
