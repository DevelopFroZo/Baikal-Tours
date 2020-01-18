<script>
  import StartRegister from "./_start_register.svelte";
  import ConfirmPassword from "./_confirm_password.svelte";
  import {response} from "../../helpers/response.js";

  let registerStatus = true;

  async function register(e){
    let data = e.detail;

    let register_response = await response('/api/signup?action=start', data);
    let result = await register_response.json();
    
    if(result.ok){
      document.location.href = "./login";
    }
    else{
      alert(result.message)
    }
  }
</script>

<svelte:head>
  <title>Регистрация</title>
</svelte:head>

<style lang="scss">
  @import "./styles/inter.scss";

</style>

<div class="body">
  {#if registerStatus}
    <StartRegister on:register={register} />
  {:else}
    <ConfirmPassword />
  {/if}
</div>
