<script>
  import { createEventDispatcher } from "svelte";
  import { validatePhone, validateMail } from "../../helpers/validators";

  const dispatch = createEventDispatcher();
  let confirm = false;
  let disableRegister = "disabled",
    name = "",
    surname = "",
    phone = "",
    email = "";

  $: if (name !== "" && surname !== "" && phone !== "" && validateMail(email)) {
    disableRegister = confirm === false ? "disabled" : "";
  } else disableRegister = "disabled";

  function register() {
    dispatch("register");
  }
  
</script>

<style lang="scss">
  @import "./styles/inter";
</style>

<svelte:window
  on:keydown={e => {
    if (e.key === 'Enter' && disableRegister === '') register();
  }} />

<div class="register-block">
  <div class="in-block">
    <h1>Регистрация</h1>

    <div class="input-block">
      <label for="name">Имя</label>
      <br />
      <input name="name" id="name" type="text" bind:value={name} />
    </div>

    <div class="input-block">
      <label for="surname">Фамилия</label>
      <br />
      <input name="surname" id="surname" type="text" bind:value={surname} />
    </div>

    <div class="input-block">
      <label for="phone">Телефон</label>
      <br />
      <input
        name="phone"
        id="phone"
        type="text"
        bind:value={phone}
        on:keydown={validatePhone} />
    </div>

    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input name="email" id="email" type="text" bind:value={email} />
    </div>

    <div class="success-block">
      <div class="checkbox-block">
        <input type="checkbox" name="success" bind:checked={confirm} />
        <div>✔</div>
      </div>
      <div class="success-text">
        Я принимаю условия
        <a href="./" class="blue-text">Пользовательского соглашения</a>
      </div>
    </div>

    <button
      id="register"
      class="blue-button"
      on:click={register}
      disabled={disableRegister}>
      Зарегистрироваться
    </button>

    <div class="inter">
      Уже зарегистрированы?
      <a href="./login" class="blue-text">Войти</a>
    </div>
  </div>

  <a href="./">Вернуться на главную</a>
</div>
