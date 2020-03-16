<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let users = (await fetcher.get("/api/users", {
      credentials: "same-origin"
    })).data;

    let locale = session.locale;

    return { users, locale };
  }
</script>

<script>
  import AdminPage from "./_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";

  export let users, locale;

  const _ = i18n(locale);
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  h1 {
    margin-top: 35px;
    margin-bottom: 25px;
    font-size: $Big_Font_Size;
  }

  table {
    background: white;
    border-collapse: collapse;
    border: 1px solid $Gray;
    margin-top: 25px;
    width: 100%;
    text-align: center;

    & > tr:first-child {
      font-weight: bold;
    }
  }

  td {
    border: 1px solid $Gray;
    padding: 5px;
  }
</style>

<svelte:head>
  <title>Пользователи</title>
</svelte:head>

<AdminPage page={1}>
  <div>
    <h1>Пользователи - {users.length}</h1>

    <input type="text" placeholder="поиск" class="search-input" />

    <table>
      <tr>
        <td />
        <td>Имя</td>
        <td>Фамилия</td>
        <td>Телефон</td>
        <td>E-mail</td>
        <td>Роль</td>
      </tr>
      {#each users as user}
        <tr>
          <td>
            <a href="./">
              <img src="/img/info.png" alt="info" />
            </a>
          </td>
          <td>{user.name}</td>
          <td>{user.surname}</td>
          <td>{user.phone}</td>
          <td>{user.email}</td>
          <td>{_(user.role)}</td>
        </tr>
      {/each}
    </table>
  </div>
</AdminPage>