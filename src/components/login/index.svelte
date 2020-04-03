<script>
  import { createEventDispatcher } from "svelte";
  import StartLogin from "./start_login.svelte";
  import ForgotPassword from "./forgot_password.svelte";
  import { parseUrlByPage } from "/helpers/parsers.js";

  export let _, fetcher, page;

  let loginPage;

  $: {
    loginPage = page.query.window;
  }

  const dispatch = createEventDispatcher();

  async function login(e) {
    let data = e.detail;

    let result = await fetcher.post("/api/signin", data);

    if (result.ok)
      document.location.href =
        page.query.redirect === undefined ? page.path : parseUrlByPage(page, ["window"], {});
    else alert(result.message);
  }
</script>

<style lang="scss">
  @import "./styles/inter.scss";
</style>

{#if loginPage === 'login'}
  <StartLogin on:forgotPassword on:login={login} on:register {_} {page}/>
{:else if loginPage === 'forgot-password'}
  <ForgotPassword on:login {_} {page}/>
{/if}
