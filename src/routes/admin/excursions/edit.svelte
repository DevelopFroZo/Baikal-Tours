<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let id = page.query.id;
    let locale = session.locale;
    let excursion_data = {
      name: "",
      site: "",
      dateStart: "",
      dateEnd: "",
      locationIds: [],
      image: {},
      price: null
    };

    let locations = (await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    })).data.locations;

    if (id !== undefined) {
      // получение данных об экскурсии
    }

    return { locale, id, excursion_data, ...excursion_data, locations };
  }
</script>

<script>
  import AdminPage from "../_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import * as edit from "/helpers/edit.js";

  export let locale,
    id,
    excursion_data,
    name,
    site,
    dateStart,
    dateEnd,
    locationIds,
    price,
    image,
    locations;

  const _ = i18n(locale);
  const fetcher = new Fetcher();

  let newData = {},
    editData = {},
    deleteData = {},
    uploadImg,
    newImage = Object.keys(image).length === 0,
    options = [{ isVisible: false, option: null, btn: null }],
    locationsNames = "";

  //Имя
  $: {
    let data = edit.validateNewtranslateData(
      edit.setTextTranslation(name, locale, id),
      excursion_data.name,
      "name",
      {}
    );

    if (id === undefined && data.name !== undefined) newData.name = data.name;
    else if (data.name !== undefined) editData.name = data.name;
    else {
      delete editData.name;
      delete newData.name;
      editData = editData;
      newData = newData;
    }
  }

  //Страница
  $: {
    let data = edit.validateNewData(site, excursion_data.site, "site", {});

    if (id === undefined && data.site !== undefined) newData.site = data.site;
    else if (data.site !== undefined) editData.site = data.site;
    else {
      delete editData.site;
      delete newData.site;
      editData = editData;
      newData = newData;
    }
  }

  //Цена
  $: {
    let data = edit.validateNewData(price, excursion_data.price, "price", {});

    if (id === undefined && data.price !== undefined)
      newData.price = data.price;
    else if (data.price !== undefined) editData.price = data.price;
    else {
      delete editData.price;
      delete newData.price;
      editData = editData;
      newData = newData;
    }
  }

  //Дата начала
  $: {
    let data = edit.validateNewData(
      dateStart,
      excursion_data.dateStart,
      "dateStart",
      {}
    );

    if (id === undefined && data.dateStart !== undefined)
      newData.dateStart = data.dateStart;
    else if (data.dateStart !== undefined) editData.dateStart = data.dateStart;
    else {
      delete editData.dateStart;
      delete newData.dateStart;
      editData = editData;
      newData = newData;
    }
  }

  //Дата окончания
  $: {
    let data = edit.validateNewData(
      dateEnd,
      excursion_data.dateEnd,
      "dateEnd",
      {}
    );

    if (id === undefined && data.dateEnd !== undefined)
      newData.dateEnd = data.dateEnd;
    else if (data.dateEnd !== undefined) editData.dateEnd = data.dateEnd;
    else {
      delete editData.dateEnd;
      delete newData.dateEnd;
      editData = editData;
      newData = newData;
    }
  }

  //Локации
  $: {
    if (locationIds === null) {
      locationIds = [];
    }
    locationsNames = edit.getNamesById(locations, locationIds);

    let data = edit.validateEditData(
      edit.formatIdsArrays(locationIds, excursion_data.locationIds),
      "locationIds",
      {}
    );

    if (Object.keys(data).indexOf("locationIds") !== -1 && id === undefined)
      newData.locationIds = data.locationIds.create;
    else if (
      Object.keys(data).indexOf("locationIds") !== -1 &&
      id !== undefined
    )
      editData.locationIds = data.locationIds.edit;
    else {
      delete editData.locationIds;
      delete newData.locationIds;
      editData = editData;
      newData = newData;
    }

    if (
      Object.keys(data).indexOf("locationIds") !== -1 &&
      data.locationIds.delete !== undefined
    )
      deleteData.locationIds = data.locationIds.delete;
  }

  async function changeImage() {
    let img = uploadImg.files;

    if (img.length !== 0) {
      let fileFormat = img[0].name.split(".").pop();
      if (fileFormat !== "jpg" && fileFormat !== "jpeg" && fileFormat !== "png")
        alert(_("images_types_message").replace(/{img}/g, img.name));
      else if (img[0].size / 1024 / 1024 <= 1) {
        image.image_url = img[0];
        newImage = true;
      } else alert(_("image_not_load").replace(/{img}/g, img[0].name));
    }

    if (id !== undefined && image !== null) {
      let result = (await fetcher.post(
        `api/compiliations/${id}/image`,
        {
          image: image.image_url
        },
        { bodyType: "formData" }
      )).data;

      image.id = result;
    }
  }

  async function deleteImg() {
    // if (id !== undefined)
    //   await fetcher.delete(`api/compiliations/${id}/image`);

    image = {};
  }

  async function saveExcursion() {
    let result;

    let requiredFields = [
      {
        field: name,
        name: "excursion_name"
      },
      {
        field: site,
        name: "excursion_site"
      },
      {
        field: dateStart,
        name: "date_start"
      },
      {
        field: dateEnd,
        name: "date_end"
      },
      {
        field: locationIds,
        name: "locations"
      }
    ];

    for (let field of requiredFields)
      if (field.field.length === 0 || field.field === null) {
        alert(_("required_field_message").replace(/{field}/g, _(field.name)));
        return null;
      }

    if (Object.keys(image).length === 0) {
      alert(
        _("required_field_message").replace(/{field}/g, _("excursion_image"))
      );
      return null;
    }

    if (id === undefined) {
      id = (await fetcher.post(`/api/excursions`, newData)).data;

      if (newImage) {
        result = await fetcher.post(
          `/api/excursions/${id}/image`,
          { image: image.image_url },
          { bodyType: "formData" }
        );
      }
    }

    document.location.href = `/admin/excursions`;
  }

  function hideAll(e) {
    for (let i = 0; i < options.length; i++) {
      e = e || event;
      let target = e.target || e.srcElement;
      const its_menu =
        target == options[i].option || options[i].option.contains(target);
      const its_btnMenu = target == options[i].btn;
      if (!its_menu && !its_btnMenu) options[i].isVisible = false;
    }
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .edit-block > *:not(:first-child) {
    display: block;
    margin-top: 20px;
  }

  input:not([type="checkbox"]) {
    margin-top: 8px;
    width: 100%;
    padding: 3px;
    border: 1px solid $Gray;
    box-sizing: border-box;
    height: 24px;
  }

  .img {
    width: 300px;
    height: 200px;
    margin: auto;

    & > img {
      margin-top: 20px;
      max-width: 100%;
      max-height: calc(100% - 30px);
    }

    & > button {
      position: absolute;
      top: 0px;
      right: 0px;
      font-size: 20px;
      z-index: 2;
      color: black;
    }
  }

  .line-data,
  .line {
    display: flex !important;
    align-items: flex-start;
    justify-content: space-between;
  }

  .line {
    margin-top: 35px;
  }
</style>

<svelte:window on:click={hideAll} />

<AdminPage {fetcher} {locale} {_} page={3}>
  <div class="line">
    <h2>
      {id === undefined ? _('creating_excursion') : _('editing_excursion')}
    </h2>
    <button class="green-button" on:click={saveExcursion}>
      {_('excursion_save')}
    </button>
  </div>

  <div class="edit-block">
    <label for="name">
      <h3>{_('excursion_name')}</h3>
      <input type="text" bind:value={name} />
    </label>
    <label for="site">
      <h3>{_('excursion_site')}</h3>
      <input type="text" name="site" bind:value={site} />
    </label>
    <div class="img-block">
      <h3>{_('excursion_image')}</h3>
      {#if Object.keys(image).length !== 0}
        <div class="img">
          <button on:click={() => deleteImg()}>×</button>
          <img
            src={newImage ? URL.createObjectURL(image.image_url) : image_url}
            alt="excursion image" />
        </div>
      {:else}
        <button class="upload-image-block">
          {_('upload_images')}
          <input
            type="file"
            class="upload-image"
            accept=".jpg, .jpeg, .png"
            bind:this={uploadImg}
            on:change={changeImage}
            name="uploadImg" />
        </button>
      {/if}
    </div>
    <div class="line-data">
      <label for="price">
        <h4>{_('price')}</h4>
        <input type="number" name="price" bind:value={price} />
      </label>
      <label for="dateStart">
        <h4>{_('date_start')}</h4>
        <input type="date" name="dateStart" bind:value={dateStart} />
      </label>
      <label for="dateEnd">
        <h4>{_('date_end')}</h4>
        <input type="date" name="dateEnd" bind:value={dateEnd} />
      </label>
      <div>
        <label for="locations">
          <h4>{_('locations')}</h4>
        </label>

        <div class="select-block">
          <button
            class="select"
            bind:this={options[0].btn}
            on:click={() => {
              options[0].isVisible = true;
            }}>
            {locationsNames.join('; ')}
          </button>
          <div
            class="option"
            class:option-visible={options[0].isVisible}
            bind:this={options[0].option}>
            {#each locations as location}
              <div
                on:click={() => (locationIds = edit.parseDataToIds(locationIds, location.id))}>
                <label>{location.name}</label>
                <input
                  type="checkbox"
                  checked={locationIds.indexOf(location.id) !== -1} />
              </div>
            {/each}
          </div>
        </div>
      </div>

    </div>
  </div>
</AdminPage>
