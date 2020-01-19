<script>
  import StartRegister from "./_start_register.svelte";
  import { response } from "../../helpers/response.js";

  async function register(e) {
    let data = e.detail;

    let register_response = await response("post", "/api/signup?action=start", data);
    let result = await register_response.json();

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
