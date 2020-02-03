<script context = "module">
  import StartLogin from "./_start_login.svelte";
  import ForgotPassword from "./_forgot_password.svelte";
  import Fetcher from "/helpers/fetcher.js";
  
  const fetcher = new Fetcher();

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
  <title>Регистрация</title>
</svelte:head>

<div class="body">
  {#if !forgot}
    <StartLogin on:forgotPassword={() => (forgot = true)} on:login={login} />
  {:else}
    <ForgotPassword on:login={() => {forgot = false}}/>
  {/if}
</div>
