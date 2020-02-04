<script>
  import { createEventDispatcher } from "svelte";
  import BreadCrumbs from "/components/breadcrumbs.svelte";

  export let _;

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
  <!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}, {name: "вход", url: "./login"}]} white={true}/> -->
  <div class="in-block">
    <h1>{_("authorize")}</h1>

    <div class="input-block">
      <label for="email">Email</label>
      <br />
      <input name="email" id="email" type="text" bind:value={email} />
    </div>

    <div class="input-block">
      <label for="password">{_("password")}</label>
      <br />
      <input
        name="password"
        id="password"
        type="password"
        bind:value={password} />
    </div>

    <button id="login" class="blue-button" on:click={login} disabled={disabledLogin}>
      {_("enter")}
    </button>

    <button class="blue-text forgot-password" on:click={forgotPassword}>
      {_("forgot_password")}
    </button>

    <div class="inter">
      {_("not_registered")}
      <a href="./register" class="blue-text">{_("registration")}</a>
    </div>
  </div>

  <a href="./">{_("return_to_home")}</a>
</div>
