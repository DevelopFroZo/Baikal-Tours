<script context="module">
  export function preload(page, session){
    let locale = session.locale;

    return { locale }
  }
</script>

<script>
  import { onMount } from "svelte";
  import Fetcher from "/helpers/fetcher.js";
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let locale;

  const fetcher = new Fetcher();
  const _ = i18n( locale );
  
  let password = "",
    email;

  async function confirm() {
    let data = {
      phoneOrEmail: email,
      password: password
    };

    let result = await fetcher.post("/api/signup?action=confirm", data);

    if (result.ok) {
      document.location.href = "./";
    } else {
      alert(result.message);
    }
  }

  onMount(() => {
    email = localStorage.getItem("email");
  });
</script>

<style lang="scss">
  @import "./styles/inter";
</style>

<div class="body">
  <div class="register-block">
    <!-- <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}, {name: "регистрация", url: "./register"}, {name: "подтверждение пароля", url: "./register/confirm_password"}]} white={true} /> -->
    <div class="in-block">
      <h1>{_("registration")}</h1>

      <div class="input-block">
        <label>
          {_("sent_mail_message")}
        </label>
        <br />
        <input type="text" bind:value={password} />
      </div>
      <button
        class="blue-button"
        disabled={password === '' ? 'disabled' : ''}
        on:click={confirm}>
        {_("complete_registration")}
      </button>
    </div>
    <a href="./">{_("return_to_home")}</a>
  </div>
</div>
