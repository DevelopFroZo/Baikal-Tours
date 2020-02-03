<script>
  import StartRegister from "./_start_register.svelte";
  import Fetcher from "/helpers/fetcher.js";

  const fetcher = new Fetcher();

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
  <title>Регистрация</title>
</svelte:head>

<div class="body">
  <StartRegister on:register={register} />
</div>
