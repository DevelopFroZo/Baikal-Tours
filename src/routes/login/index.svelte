<script>
    import StartLogin from "./_start_login.svelte";
    import ForgotPassword from "./_forgot_password.svelte";
    let forgot = false;

</script>

<svelte:head>
  <title>Регистрация</title>
</svelte:head>

{#if !forgot}
    <StartLogin on:forgotPassword={() => forgot = true}/>
{:else}
    <ForgotPassword />
{/if}