<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    let locale = session.locale;

    const fetcher = new Fetcher(this.fetch);

    let result_user = await fetcher.get(`/api/users/${session.userId}`, {
      credentials: "same-origin"
    });

    if (result_user.ok) {
      result_user = result_user.data;

      return { locale, result_user };
    }

    this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let locale, result_user;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  console.log(result_user);

  async function changeRole(){
    let result = await fetcher.put(`/api/users/${result_user.id}`, {
        role: result_user.role,
    })

    console.log(result)
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .user-block {
    margin-top: 15px;
    background: white;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 15px;

    & > span{
        display: block;
    }

    & > span:not(:first-child){
        margin-top: 15px;
    }
  }

  select{
      background: $Gray;
  }
</style>

<AdminPage {_} {locale} {fetcher} page={1}>
  <h1>{_('user_info')}</h1>
  <div class="user-block">
    <select name="userStatus" bind:value={result_user.role} on:change={changeRole}>
        <option value="admin">{_("admin")}</option>
        <option value="user">{_("user")}</option>
    </select>
    <span><b>{_('name')}:</b> {result_user.name}</span>
    <span><b>{_('surname')}:</b> {result_user.surname}</span>
    <span><b>{_('phone')}:</b> {result_user.phone}</span>
    <span><b>email</b> {result_user.email}</span>
  </div>
</AdminPage>
