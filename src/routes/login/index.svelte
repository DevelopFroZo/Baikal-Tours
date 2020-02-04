<script context="module">
  export function preload(page, session){
    let locale = session.locale;

    return { locale }
  }
</script>

<script>
  import StartLogin from "./_start_login.svelte";
  import ForgotPassword from "./_forgot_password.svelte";
  import Fetcher from "/helpers/fetcher.js";
  import i18n from "/helpers/i18n/index.js";
  
  export let locale;

  const fetcher = new Fetcher();
  const _ = i18n( locale );

  let forgot = false;

  async function login(e){
    let data = e.detail;

    let result = await fetcher.post('/api/signin', data)
    
    if(result.ok){
      document.location.href = "./";
    }
    else{
      alert(result.message)
    }
  }
</script>

<style lang="scss">
    @import "./styles/inter.scss";
</style>

<svelte:head>
  <title>{_("authorize")}</title>
</svelte:head>

<div class="body">
  {#if !forgot}
    <StartLogin on:forgotPassword={() => (forgot = true)} on:login={login} _={_}/>
  {:else}
    <ForgotPassword on:login={() => {forgot = false}} _={_}/>
  {/if}
</div>
