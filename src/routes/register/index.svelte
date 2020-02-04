<script context="module">
  export function preload(page, session){
    let locale = session.locale;

    return { locale }
  }
</script>

<script>
  import StartRegister from "./_start_register.svelte";
  import Fetcher from "/helpers/fetcher.js";
  import i18n from "/helpers/i18n/index.js";

  export let locale;

  const fetcher = new Fetcher();
  const _ = i18n( locale );

  async function register(e) {
    let data = e.detail;

    let result = await fetcher.post("/api/signup?action=start", data);

    if (result.ok) {
      // localStorage.setItem('email', data.email)
      // document.location.href = "./register/confirm_password";

      document.location.href = "./login";
    } else {
      alert(result.message);
    }
  }
</script>

<style lang="scss">
  @import "./styles/inter.scss";
</style>

<svelte:head>
  <title>{_("registration")}</title>
</svelte:head>

<div class="body">
  <StartRegister on:register={register} _={_}/>
</div>
