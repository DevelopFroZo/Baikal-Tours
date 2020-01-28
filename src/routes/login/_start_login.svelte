<script>
  import { createEventDispatcher } from "svelte";
  import BreadCrumbs from "../../components/breadcrumbs.svelte";

  let email = "",
    password = "",
    disabledLogin = "disabled";
  const dispatch = createEventDispatcher();

  function forgotPassword() {
    dispatch("forgotPassword");
  }

  function login() {
    dispatch("login", {
      phoneOrEmail: email,
      password: password
    });
  }

  $: if (email !== "" && password !== ""){
    disabledLogin = "";
  } 
  else disabledLogin = "disabled";
</script>

<style lang="scss">
  @import "./styles/inter.scss";
</style>

<div class="register-block">
  <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}, {name: "вход", url: "./login"}]} white={true}/>
  <div class="in-block">
    <h1>Вход</h1>

    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input name="email" id="email" type="text" bind:value={email} />
    </div>

    <div class="input-block">
      <label for="password">Пароль</label>
      <br />
      <input
        name="password"
        id="password"
        type="password"
        bind:value={password} />
    </div>

    <button id="login" class="blue-button" on:click={login} disabled={disabledLogin}>
      Войти
    </button>

    <button class="blue-text forgot-password" on:click={forgotPassword}>
      Забыли пароль?
    </button>

    <div class="inter">
      Еще не зарегистрированны?
      <a href="./register" class="blue-text">Регистрация</a>
    </div>
  </div>

  <a href="./">Вернуться на главную</a>
</div>
