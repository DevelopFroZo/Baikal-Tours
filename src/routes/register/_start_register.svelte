<script>
  import { createEventDispatcher } from "svelte";
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { validatePhone, validateMail } from "/helpers/validators";

  export let _;

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
    dispatch("register", {
      name: name,
      surname: surname,
      phone: phone,
      email: email
    });
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
  <!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}, {name: "регистрация", url: "./register"}]} white={true}/> -->
  <div class="in-block">
    <h1>{_("registration")}</h1>

    <div class="input-block">
      <label for="name">{_("name")}</label>
      <br />
      <input name="name" id="name" type="text" bind:value={name} />
    </div>

    <div class="input-block">
      <label for="surname">{_("surname")}</label>
      <br />
      <input name="surname" id="surname" type="text" bind:value={surname} />
    </div>

    <div class="input-block">
      <label for="phone">{_("phone")}</label>
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
        {_("accept")}
        <a href="./" class="blue-text">{_("of_user_agreement")}</a>
      </div>
    </div>

    <button
      id="register"
      class="blue-button"
      on:click={register}
      disabled={disableRegister}>
      {_("register")}
    </button>

    <div class="inter">
      {_("already_registered")}
      <a href="./login" class="blue-text">{_("enter")}</a>
    </div>
  </div>

  <a href="./">{_("return_to_home")}</a>
</div>
