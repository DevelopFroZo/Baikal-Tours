<script>
  import StartRegister from "./_start_register.svelte";
  import ConfirmPassword from "./_confirm_password.svelte";

  let registerStatus = true;
</script>

<svelte:head>
  <title>Регистрация</title>
</svelte:head>

{#if registerStatus}
  <StartRegister on:register={() => registerStatus = false}/>
{:else}
  <ConfirmPassword />
{/if}
