<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let email = "";

  function login() {
    dispatch("login");
  }

  $: console.log(email === "");
</script>

<style lang="scss">
  @import "./styles/inter";
</style>

<div class="register-block">
  <div class="in-block">
    <h1>Забыли пароль?</h1>

    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input name="email" id="email" type="text" bind:value={email} />
    </div>

    <button
      id="login"
      class="blue-button"
      disabled={email === '' ? 'disabled' : ''}>
      Получить новый пароль
    </button>

    <button class="blue-text forgot-password" on:click={login}>
      Вернуться на страницу входа
    </button>
  </div>

  <a href="./">Вернуться на главную</a>
</div>
