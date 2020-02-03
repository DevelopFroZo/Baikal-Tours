<script>
  import { onMount } from "svelte";
  import Fetcher from "/helpers/fetcher.js";
  import BreadCrumbs from "/components/breadcrumbs.svelte";

  const fetcher = new Fetcher();
  
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
    <BreadCrumbs path = {[{name: "Каталог событий", url: "./"}, {name: "регистрация", url: "./register"}, {name: "подтверждение пароля", url: "./register/confirm_password"}]} white={true} />
    <div class="in-block">
      <h1>Регистрация</h1>

      <div class="input-block">
        <label>
          Мы выслали Вам на почтовый ящик письмо Введите полученный пароль
        </label>
        <br />
        <input type="text" bind:value={password} />
      </div>
      <button
        class="blue-button"
        disabled={password === '' ? 'disabled' : ''}
        on:click={confirm}>
        Завершить регистрацию
      </button>
    </div>
    <a href="./">Вернуться на главную</a>
  </div>
</div>
