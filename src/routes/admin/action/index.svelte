<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let actionId = page.query.id;
    let locale = session.locale;

    let result_action = await fetcher.get("/api/actions/" + actionId, {
      query: {
        getSubscribers: ""
      },
      credentials: "same-origin"
    });

    if (result_action.ok) {
      result_action = result_action.data;
      return { result_action, actionId, locale };
    }

    this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { parsePrice } from "/helpers/parsers.js";
  import { contactsToString, dateToString } from "/helpers/converters.js";
  import { onMount } from "svelte";

  export let result_action, actionId, locale;

  const _ = i18n(locale),
    fetcher = new Fetcher();

  let contactData = contactsToString(
      result_action.contact_faces,
      result_action.emails,
      result_action.phones
    ),
    second_price = parsePrice(
      result_action.price_min,
      result_action.price_max,
      _
    ),
    adminActinonParams = "/admin",
    initEditor = false,
    start = false;

  async function changeStatus() {
    await fetcher.put("/api/actions/" + actionId, {
      status: result_action.status
    });
  }

  onMount(() => {
    if (localStorage.getItem("adminActionParams") !== undefined)
      adminActinonParams = localStorage.getItem("adminActionParams");

    start = true;
    if(initEditor)
      startEditor()
  });

  function startEditor(){
    var editorText = new Quill("#description-block",{
      readOnly: true
    })
    
    editorText.setContents(editorText.clipboard.convert(result_action.full_description.replace(/\n/g, "</br>")))
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  pre {
    white-space: pre-wrap;
  }

  .event-block {
    margin-top: 15px;
    background: white;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 15px;
  }

  .event-edit {
    & > select,
    a {
      background: $Medium_Gray;
      border: 1px solid black;
      font-weight: bold;
      padding: 3px 6px;
      height: 26px;
    }

    & > a {
      margin-left: 15px;
    }
  }

  h1 {
    font-size: 20px;
    margin-top: 25px;
  }

  .description-block {
    margin-top: 20px;
  }

  h2 {
    font-size: $Big_Font_Size;
    margin-top: 35px;
  }

  .info-block {
    display: flex;
    margin-top: 30px;

    & > div {
      flex: 0.5;
    }
  }

  .left-side {
    padding-right: 20px;
  }

  .line {
    display: flex;
    align-items: flex-start;

    & > .info-image {
      margin-right: 15px;
      min-width: 20px;

      & > img {
        max-width: 16px;
      }
    }

    &:not(:first-child) {
      margin-top: 17px;
    }
  }

  .payment-block {
    margin-top: 15px;
    display: flex;

    & > div {
      padding: 10px 20px;
      color: white;

      &:not(:first-child) {
        margin-left: 25px;
      }
    }

    & > .gray {
      background: $Dark_Gray;
    }

    & > .blue {
      background: $Light_Blue;
    }

    & > .green {
      background: $Green;
    }
  }

  table {
    width: 100%;
    border: 1px solid $Gray;
    border-spacing: 0px;

    & > tr {
      & > td {
        border: solid $Gray;
        padding: 5px 10px;
        text-align: center;
      }
    }

    & > tr:first-child {
      & > td {
        font-weight: bold;
      }
    }

    & > tr:not(:last-child) {
      & > td:not(:last-child) {
        border-width: 0 1px 1px 0;
      }
      & > td:last-child {
        border-width: 0 0 1px 0;
      }
    }

    & > tr:last-child {
      & > td:not(:last-child) {
        border-width: 0 1px 0 0;
      }
      & > td:last-child {
        border: none;
      }
    }
  }

  :global(.ql-editor){
    padding: 0 !important;
  }
</style>

<svelte:head>
  <title>
    {result_action.title === null ? _('event_page') : result_action.title}
  </title>

  <script src="//cdn.quilljs.com/1.3.6/quill.js" on:load={() => {
    initEditor = true;
    if(start)
      startEditor()
  }}></script>
  <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
</svelte:head>

<AdminPage page={0} {fetcher} {locale} {_}>
  <a href={adminActinonParams} class="back-page">{_('back_to_actions_page')}</a>
  <div class="event-block">
    <div class="event-edit">
      <select bind:value={result_action.status} on:change={changeStatus}>
        <option value="active">{_('active')}</option>
        <option value="hidden">{_('hidden')}</option>
        <option value="archive">{_('archive')}</option>
      </select>
      <a href={`/admin/action/edit?id=${actionId}`}>{_('edit')}</a>
    </div>
    <h1>{result_action.name}</h1>
    <div id="description-block"></div>
    <h2>{_('event_photos')}</h2>
    {#if result_action.images.length > 0}
      <div class="images-block">
        {#each result_action.images as image}
          <div class="img-block">
            <div class="img">
              <img
                src={image.image_url}
                class:imp={image.is_main}
                alt="image" />
            </div>
            {#if image.is_main}
              <div class="imp-text">{_('main')}</div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}{_('no_images')}{/if}
    <div class="info-block">
      <div class="left-side">

        <div class="line">
          <div class="info-image">
            <img src="img/date.png" alt="date" />
          </div>
          <div class="info">
            {#if result_action.dates.length > 0}
              <ul>
                {#each result_action.dates as date}
                  <li>{dateToString(date, _)}</li>
                {/each}
              </ul>
            {:else}{_('no_data')}{/if}
          </div>
        </div>

        <div class="line">
          <div class="info-image">
            <img src="img/place.png" alt="place" />
          </div>
          <div class="info">
            {#if result_action.locations.length > 0}
              <ul>
                {#each result_action.locations as location}
                  <li>
                    {location.name + (location.address === null ? '' : ', ' + location.address)}
                  </li>
                {/each}
              </ul>
            {:else}{_('no_data')}{/if}
          </div>
        </div>

        <div class="line">
          <div class="info-image">
            <img src="img/org.png" alt="organisation" />
          </div>
          <div class="info">
            {result_action.organizer_name}
            {#if contactData.length > 0}
              <ul class="contact-ul">
                {#each contactData as contact}
                  <li>{contact}</li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>

        <div class="line">
          <div class="info-image">
            <img src="img/transfer.png" alt="transfer" />
          </div>
          <div class="info">
            {#if result_action.transfers.length > 0}
              <ul>
                {#each result_action.transfers as transfer}
                  <li>{transfer.name}</li>
                {/each}
              </ul>
            {:else}{_('no_data')}{/if}
          </div>
        </div>

      </div>
      <div class="right-side">

        <div class="line">
          <div class="info-image">
            <img src="img/price.png" alt="price" />
          </div>
          <div class="info">{_('price')}: {second_price}</div>
        </div>
        <div class="line">
          <div class="info-image">
            <img src="img/pages.png" alt="pages" />
          </div>
          <div class="info">
            {#if result_action.vk_link !== null || result_action.instagram_link !== null || result_action.facebook_link !== null || result_action.twitter_link !== null || result_action.websites !== null}
              <ul>
                {#if result_action.websites !== null}
                  <li>
                    <a href={result_action.websites[0]} target="_blank">
                      {_('official_site')}
                    </a>
                  </li>
                {/if}
                {#if result_action.vk_link !== null}
                  <li>
                    <a href={result_action.vk_link} target="_blank">
                      {_('VK_group')}
                    </a>
                  </li>
                {/if}
                {#if result_action.instagram_link !== null}
                  <li>
                    <a href={result_action.instagram_link} target="_blank">
                      {_('instagram')}
                    </a>
                  </li>
                {/if}
                {#if result_action.facebook_link !== null}
                  <li>
                    <a href={result_action.facebook_link} target="_blank">
                      {_('facebook')}
                    </a>
                  </li>
                {/if}
                {#if result_action.twitter_link !== null}
                  <li>
                    <a href={result_action.twitter_link} target="_blank">
                      {_('twitter')}
                    </a>
                  </li>
                {/if}
              </ul>
            {:else}{_('no_data')}{/if}
          </div>
        </div>

        <div class="line">
          <div class="info-image">
            <img src="img/birk.png" alt="date" />
          </div>
          <div class="info">
            {#if result_action.subjects.length > 0}
              <ul>
                {#each result_action.subjects as subjects}
                  <li>{subjects.name}</li>
                {/each}
              </ul>
            {:else}{_('no_data')}{/if}
          </div>
        </div>

      </div>
    </div>
    <h2>{_('participations_options')}</h2>
    <div class="payment-block">
      {#if result_action.price_min == 0 && result_action.price_max === 0}
        <div class="gray">{_('free2')}</div>
      {/if}
      {#if result_action.organizer_payment !== null && result_action.organizer_payment !== ''}
        <div class="blue">{_('pay_via_organizer')}</div>
      {/if}
      {#if result_action.site_payment}
        <div class="green">{_('pay_in_site')}</div>
      {/if}
    </div>

    <h2>{_('action_partners')}</h2>
    {#if result_action.partners.length > 0}
      <div class="images-block">
        {#each result_action.partners as partner}
          <div class="img-block">
            <div class="img">
              <img src={partner.image_url} alt="image" />
            </div>
            {#if partner.name !== null}
              <div class="imp-text">{partner.name}</div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}{_('no_data')}{/if}

    <h2>{_('list_of_registered_users')}</h2>
    {#if result_action.subscribers.length !== 0}
      <table>
        <tr>
          <td>*</td>
          <td>{_('name')}</td>
          <td>{_('surname')}</td>
          <td>{_('phone')}</td>
          <td>E-mail</td>
          <td>{_('role').toLowerCase()}</td>
        </tr>
        {#each result_action.subscribers as subscriber}
          <tr>
            <td>*</td>
            <td>{subscriber.name}</td>
            <td>{subscriber.surname}</td>
            <td>{subscriber.phone}</td>
            <td>{subscriber.email}</td>
            <td>
              {#if subscriber.is_admin}{_('admin')}{:else}{_('user')}{/if}
            </td>
          </tr>
        {/each}
      </table>
    {:else}{_('no_registered_users')}{/if}
  </div>
</AdminPage>
