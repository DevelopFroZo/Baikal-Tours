<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let locale = session.locale;
    let id = page.query.id;
    let tourData = {
      booking_url: "",
      location_id: null,
      name: "",
      price: null,
      rating: null,
      image_url: null
    };
    let locations = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.locations;

    if (id !== undefined) {
      tourData = (await fetcher.get(`/api/hotels/${id}`, {
        credentials: "same-origin"
      })).data;
    }

    if (tourData !== undefined)
      return {
        locale,
        id,
        tourData,
        ...tourData,
        locations
      };
    else this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import * as edit from "/helpers/edit.js";
  import Loading from "/components/adminLoadingWindow.svelte";
  import { validateNewData } from "/helpers/edit.js";

  export let locale,
    id,
    tourData,
    booking_url,
    location_id,
    name,
    price,
    rating,
    image_url,
    locations;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  let newData = {},
    save;
  
  //Название отеля
  $: newData = validateNewData(name, tourData.name, "name", newData);

  //Страница отеля на booking
  $: newData = validateNewData(booking_url, tourData.booking_url, "bookingUrl", newData);

  //Цена отеля
  $: newData = validateNewData(price, tourData.price, "price", newData);

  //Рейтинг отеля
  $: newData = validateNewData(rating, tourData.rating, "rating", newData);

  //Локация отеля из справочника
  $: newData = validateNewData(location_id, tourData.location_id, "locationId", newData);

  async function saveData(){
      let result;

      for(let key of Object.keys(newData))
        if(newData[key] === "" || newData[key] === undefined)
            newData[key] = null;

      if(newData.name === null){
          alert(_("required_field_message").replace(/{field}/g, _("hotel_name")));
          return null;
      }

      if(id === undefined){
          //Создание события
      }
      else
          result = await fetcher.put(`/api/hotels/${id}`, {...newData});
      
      document.location.href = "./admin/hotels";

  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .image {
    width: 350px;
    height: 200px;
    margin: 20px auto 0;
    position: relative;

    & > img {
      max-width: 100%;
      max-height: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .edit-line {
    margin-top: 20px;
    display: flex;

    & > *:not(:first-child) {
      margin-left: 50px;
    }

    & input,
    select {
      width: 250px;
    }
  }

  input,
  select {
    border: 1px solid $Gray;
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  label{
      margin-top: 20px;
      display: block;
  }

  .delete-image{
    position: absolute;
    top: 0;
    right: 0;

    & > img{
      width: 20px;
    }
  }
</style>

<AdminPage {_} {locale} {fetcher} page={4}>
  <div class="line">
    <h1>{id === undefined ? _('creating_hotel') : _('editing_hotel')}</h1>
    <button class="green-button" on:click={() => save = saveData()}>{_('hotel_save')}</button>
  </div>
  <div class="edit-block">
    <label for="name">
      <h3>{_('hotel_name')}</h3>
      <input type="text" name="name" bind:value={name} />
    </label>
    <label for="booking_url">
      <h3>{_('hotel_url')}</h3>
      <input type="text" name="booking_url" bind:value={booking_url} />
    </label>
    {#if image_url !== null}
      <div class="image">
        <button class="delete-image"> <img src="/img/cross.svg" alt="delete" /> </button>
        <img src={image_url} alt="hotel image" />
      </div>
    {/if}
    <div class="edit-line">
      <label for="price">
        <h3>{_('hotel_price')}</h3>
        <input type="number" name="price" bind:value={price} />
      </label>
      <label for="rating">
        <h3>{_('hotel_rating')}</h3>
        <input type="number" name="rating" bind:value={rating} />
      </label>
      <label for="location">
        <h3>{_('hotel_location')}</h3>
        <select name="location" bind:value={location_id}>
          <option value={null} />
          {#each locations as location}
            <option value={location.id}>{location.name}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>
</AdminPage>

<Loading promice={save} message={_("saving_hotel")} />