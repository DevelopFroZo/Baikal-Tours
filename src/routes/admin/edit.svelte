<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import { setDataToCK } from "/helpers/edit.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    const locale = session.locale;

    let actionId = page.query.id,
      actionData = {
        price_min: 0,
        price_max: 0,
        organizer_id: null,
        site_payment: false,
        organizer_payment: null,
        emails: null,
        phones: null,
        websites: null,
        vk_link: null,
        facebook_link: null,
        instagram_link: null,
        twitter_link: null,
        status: "hidden",
        is_favorite: false,
        organizer_email: null,
        organizer_phone: null,
        title: "",
        name: "",
        tagline: "",
        short_description: "",
        full_description: "",
        organizer_name: "",
        contact_faces: null,
        images: [],
        dates: null,
        locations: null,
        transfers: null,
        subjects: null,
        companions: null,
        partners: []
      };

    let result_filters = await fetcher.get("/api/dataForFilters", {
      credentials: "same-origin"
    });

    let result_users = await fetcher.get("/api/users", {
      credentials: "same-origin"
    });

    result_filters = result_filters.data;
    result_users = result_users.data;

    if (actionId !== undefined) {
      actionData = await fetcher.get("/api/actions/" + actionId, {
        credentials: "same-origin"
      });
      
      if(actionData.ok)
        actionData.data.dates = setDataToCK(actionData.data.dates);
    }

    if(actionId === undefined || actionData.ok){
      if(actionId !== undefined) actionData = actionData.data;
      return {
        ...actionData,
        actionData,
        actionId,
        result_filters,
        result_users,
        locale
      };
    }
      

    this.error(404, "page not found");
  }
</script>

<script>
  import AdminPage from "./_admin_page.svelte";
  import i18n from "/helpers/i18n/index.js";
  import { parseDate } from "/helpers/parsers.js";
  import * as edit from "/helpers/edit.js";

  export let actionId,
    result_filters,
    result_users,
    actionData,
    price_min = 0,
    price_max = 0,
    organizer_id = null,
    site_payment = false,
    organizer_payment = null,
    emails = null,
    phones = null,
    websites = null,
    vk_link = null,
    facebook_link = null,
    instagram_link = null,
    twitter_link = null,
    status = "hidden",
    is_favorite = false,
    organizer_email = null,
    organizer_phone = null,
    title = "",
    name = "",
    tagline = "",
    short_description = "",
    full_description = "",
    organizer_name = "",
    contact_faces = null,
    images = [],
    dates = null,
    locations = null,
    transfers = null,
    subjects = null,
    companions = null,
    partners = [],
    locale;

  const fetcher = new Fetcher();
  const _ = i18n(locale);

  emails = edit.cloneArray(actionData.emails);
  phones = edit.cloneArray(actionData.phones);
  websites = edit.cloneArray(actionData.websites);
  contact_faces = edit.cloneArray(actionData.contact_faces);
  images = edit.cloneArray(actionData.images);
  dates = edit.cloneArray(actionData.dates);
  locations = edit.cloneArray(actionData.locations);
  transfers = edit.cloneArray(actionData.transfers);
  subjects = edit.cloneArray(actionData.subjects);
  companions = edit.cloneArray(actionData.companions);

  subjects = edit.getIds(subjects);
  transfers = edit.getIds(transfers);
  companions = edit.getIds(companions);

  if (locations !== null) {
    for (let location of locations) {
      delete location.name;
      location.oldLocationId = location.id;
    }
  }

  let price = "",
    freePrice = price_min === 0 && price_max === 0,
    transfersNames = [],
    subjectsNames = [],
    companionsNames = [],
    participation,
    uploadImg,
    uploadPartners,
    newImages = [],
    newPartners = [],
    mainImg = null,
    newData = {},
    newPartnerName = "";

  if (organizer_payment !== null) participation = "organizer";
  else if (site_payment === true) participation = "site";
  else if (price_min === 0 && price_max === 0) participation = "free";

  if (price_min === 0 && price_max === 0) price = "";
  else if (price_min === 0 && price_max !== 0) price = price_max;
  else if (price_min !== 0 && price_max === 0) price = price_min;
  else if (price_min !== null && price_max !== null)
    price = price_min + "-" + price_max;

  if (dates !== null) {
    let d = dates;
    for (let date of d) {
      if (date.dateStart !== null)
        date.dateStart = parseDate(new Date(date.dateStart));
      if (date.dateEnd !== null)
        date.dateEnd = parseDate(new Date(date.dateEnd));
    }
    dates = d;
  }

  $: console.log(newData);

  //Title
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(title, locale, actionId),
      actionData.title,
      "title",
      newData
    );
  }

  //Tagline
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(tagline, locale, actionId),
      actionData.tagline,
      "tagline",
      newData
    );
  }

  //Короткое описание события
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(short_description, locale, actionId),
      actionData.short_description,
      "short_description",
      newData
    );
  }

  //Название события
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(name, locale, actionId),
      actionData.name,
      "name",
      newData
    );
  }

  //Описание события
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(full_description, locale, actionId),
      actionData.full_description,
      "full_description",
      newData
    );
  }

  //Даты
  $: {
    if (dates !== null && dates.length === 0) dates = null;

    if (dates === null) {
      dates = [];
      addDate();
    }

    newData = edit.validateEditData(
      edit.formatDates(dates, actionData),
      "dates",
      newData
    );
  }

  //Локации
  $: {
    if (locations !== null && locations.length === 0) locations = null;

    if (locations === null) {
      locations = [];
      addLocation();
    }

    newData = edit.validateEditData(
      edit.formatLocations(locations, actionData),
      "locations",
      newData
    );
  }

  //Цена
  $: {
    if (!freePrice) {
      let allPrice = price
        .split("")
        .filter(el => el !== " ")
        .join("")
        .split("-");

      price_min = allPrice[0] === "" ? 0 : Number(allPrice[0]);
      price_max =
        allPrice[1] === "" || allPrice[1] === undefined
          ? 0
          : Number(allPrice[1]);
    } else {
      price_min = 0;
      price_max = 0;

      price = "";
    }

    newData = edit.validateNewData(
      price_min,
      actionData.price_min,
      "price_min",
      newData
    );
    newData = edit.validateNewData(
      price_max,
      actionData.price_max,
      "price_max",
      newData
    );
  }

  //Тематики
  $: {
    if (subjects === null) {
      subjects = [];
    }

    subjectsNames = edit.getNamesById(result_filters.subjects, subjects);

    newData = edit.validateEditData(
      edit.formatIdsArrays(subjects, actionData.subjects),
      "subjects",
      newData
    );
  }

  //Трансферы
  $: {
    if (transfers === null) {
      transfers = [];
    }

    transfersNames = edit.getNamesById(result_filters.transfers, transfers);

    newData = edit.validateEditData(
      edit.formatIdsArrays(transfers, actionData.transfers),
      "transfers",
      newData
    );
  }

  //Компаньены
  $: {
    if (companions === null) {
      companions = [];
    }

    companionsNames = edit.getNamesById(result_filters.companions, companions);

    newData = edit.validateEditData(
      edit.formatIdsArrays(companions, actionData.companions),
      "companions",
      newData
    );
  }

  //Организатор
  $: {
    newData = edit.validateNewtranslateData(
      edit.setTextTranslation(organizer_name, locale, actionId),
      actionData.organizer_name,
      "organizer_name",
      newData
    );
  }

  //Организатор из пользователей
  $: {
    newData = edit.validateNewData(
      organizer_id,
      actionData.organizer_id,
      "organizer_id",
      newData
    );
  }

  //Контактные лица
  $: {
    if (contact_faces !== null && contact_faces.length === 0)
      contact_faces = null;

    if (contact_faces === null) contact_faces = [""];

    let fContact_faces = [];

    for (let i = 0; i < contact_faces.length; i++)
      fContact_faces.push(contact_faces[i]);

    fContact_faces = edit.setTextTranslation(fContact_faces, locale, actionId);

    newData = edit.validateEditArray(
      fContact_faces,
      actionData.contact_faces,
      "contact_faces",
      newData
    );
  }

  //Телефоны
  $: {
    if (phones !== null && phones.length === 0) phones = null;
    if (phones === null) phones = [""];

    newData = edit.validateEditArray(
      phones,
      actionData.phones,
      "phones",
      newData
    );
  }

  //Электронные почты
  $: {
    if (emails !== null && emails.length === 0) emails = null;
    if (emails === null) emails = [""];

    newData = edit.validateEditArray(
      emails,
      actionData.emails,
      "emails",
      newData
    );
  }

  //Сайты
  $: {
    if (websites !== null && websites.length === 0) websites = null;
    if (websites === null) websites = [""];

    newData = edit.validateEditArray(
      websites,
      actionData.websites,
      "websites",
      newData
    );
  }

  //Вконтакте
  $: {
    if (vk_link === "") vk_link = null;

    newData = edit.validateNewData(
      vk_link,
      actionData.vk_link,
      "vk_link",
      newData
    );
  }

  //Фейсбук
  $: {
    if (facebook_link === "") facebook_link = null;

    newData = edit.validateNewData(
      facebook_link,
      actionData.facebook_link,
      "facebook_link",
      newData
    );
  }

  //Инстаграм
  $: {
    if (instagram_link === "") instagram_link = null;

    newData = edit.validateNewData(
      instagram_link,
      actionData.instagram_link,
      "instagram_link",
      newData
    );
  }

  //Твиттер
  $: {
    if (twitter_link === "") twitter_link = null;

    newData = edit.validateNewData(
      twitter_link,
      actionData.twitter_link,
      "twitter_link",
      newData
    );
  }

  //Вариант участия
  $: {
    if (participation === "free") {
      price_min = 0;
      price_max = 0;

      freePrice = true;
      organizer_payment = null;
      site_payment = false;
    } else if (participation === "organizer") {
      organizer_payment = actionData.organizer_payment;
      freePrice = false;
      site_payment = false;
    } else if (participation === "site") {
      site_payment = true;
      freePrice = false;
      organizer_payment = null;
    }
  }

  //Оплата через организатора
  $: {
    newData = edit.validateNewData(
      organizer_payment,
      actionData.organizer_payment,
      "organizer_payment",
      newData
    );
  }

  //Оплата на сайте
  $: {
    newData = edit.validateNewData(
      site_payment,
      actionData.site_payment,
      "site_payment",
      newData
    );
  }

  let options = [];

  for (let i = 0; i < 3; i++)
    options.push({
      isVisible: false,
      option: null,
      btn: null
    });

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

  function addDate() {
    dates.push({
      dateStart: null,
      dateEnd: null,
      timeStart: null,
      timeEnd: null,
      days: null
    });

    dates = dates;
  }

  function addLocation() {
    locations.push({
      id: null,
      address: null,
      oldLocationId: null
    });

    locations = locations;
  }

  async function changeImages() {
    let newSecondImages = [],
      result;
    for (let img of uploadImg.files) {
      let fileFormat = img.name.split(".").pop();
      if (fileFormat !== "jpg" && fileFormat !== "jpeg" && fileFormat !== "png")
        alert(_("images_types_message").replace(/{img}/g, img.name));
      else if (img.size / 1024 / 1024 <= 1) {
        newSecondImages.push(img);
      } else alert(_("image_not_load").replace(/{img}/g, img.name));
    }

    if (actionId !== undefined && newSecondImages.length !== 0) {
      result = (await fetcher.post(
        "/api/actionImages",
        {
          actionId: Number(actionId),
          images: newSecondImages
        },
        { bodyType: "formData" }
      )).data;
    }

    for (let i = 0; i < newSecondImages.length; i++) {
      newImages.push({
        src: newSecondImages[i],
        id: actionId === undefined ? null : result[i]
      });
    }
    newImages = newImages;
  }

  async function changeActiveImg(main_img, id) {
    mainImg = null;

    for (let img of images)
      if (img.is_main === true) {
        img.is_main = false;
        break;
      }

    images[main_img].is_main = true;
    let saveImage = await fetcher.put(`/api/actionImages/${id}`, {
      isMain: true
    });
  }

  async function changeNewActiveImg(main_img, id) {
    for (let i = 0; i < images.length; i++)
      if (images[i].is_main) {
        images[i].is_main = false;
        break;
      }

    mainImg = main_img;
    if (actionId !== undefined) {
      let saveImage = await fetcher.put(`/api/actionImages/${id}`, {
        isMain: true
      });
    }
  }

  async function deleteImg(delete_img, id) {
    if (images[delete_img].is_main && images.length > 1) {
      if (delete_img !== 0) images[delete_img - 1].is_main = true;
      else images[delete_img + 1].is_main = true;
    } else if (
      images[delete_img].is_main &&
      images.length === 1 &&
      newImages.length !== 0
    )
      mainImg = 0;

    images.splice(delete_img, 1);
    images = images;

    await fetcher.delete(`/api/actionImages/${id}`);
  }

  async function deleteNewImg(delete_img, id) {
    if (
      (delete_img === 0 && newImages.length === 1) ||
      (delete_img === 0 && mainImg === delete_img && images.length !== 0)
    ) {
      mainImg = null;
      if (images.length !== 0) images[images.length - 1].is_main = true;
    } else if (newImages.length > 1 && delete_img === mainImg)
      if (delete_img !== 0) mainImg = delete_img - 1;
      else mainImg = delete_img;
    else if (delete_img < mainImg) mainImg--;

    newImages.splice(delete_img, 1);
    newImages = newImages;

    if (actionId !== undefined) await fetcher.delete(`/api/actionImages/${id}`);
  }

  async function saveAction() {
    let result;

    let requiredFields = [
      {
        field: title,
        name: "title"
      },
      {
        field: tagline,
        name: "tagline"
      },
      {
        field: short_description,
        name: "short_event_description"
      },
      {
        field: name,
        name: "event_name"
      },
      {
        field: full_description,
        name: "event_description"
      },
      {
        field: organizer_name,
        name: "organizer"
      }
    ];

    for (let field of requiredFields)
      if (field.field === "" || field.field === null) {
        alert(_("required_field_message").replace(/{field}/g, _(field.name)));
        return null;
      }

    if (participation === "organizer" && organizer_payment === "") {
      alert(_("required_payment_message"));
      return null;
    }

    if (actionId === undefined) {
      actionId = Number((await fetcher.post("/api/actions")).data);
      if (newImages.length !== 0) {
        let fileImages = [];
        for (let img of newImages) fileImages.push(img.src);

        result = (await fetcher.post(
          "/api/actionImages",
          {
            actionId: actionId,
            images: fileImages
          },
          { bodyType: "formData" }
        )).data;
        if (mainImg !== null) {
          let saveImage = await fetcher.put(`/api/actionImages/${actionId}`, {
            id: result[mainImg],
            is_main: true
          });
        }
      }
      if (newPartners.length !== 0) {
        for (let partner of newPartners) {
          result = await fetcher.post(
            `/api/actionPartners`,
            {
              actionId: actionId,
              name: partner.name,
              image: partner.image_url
            },
            { bodyType: "formData" }
          );
        }
      }
    }

    result = await fetcher.put(`/api/actions/${actionId}`, newData);

    document.location.href = `/admin/action?id=${actionId}`;
  }

  async function changePartners() {
    let img = uploadPartners.files,
      newPartner = {},
      result;
    if (img.length !== 0) {
      let fileFormat = img[0].name.split(".").pop();
      if (fileFormat !== "jpg" && fileFormat !== "jpeg" && fileFormat !== "png")
        alert(_("images_types_message").replace(/{img}/g, img.name));
      else if (img[0].size / 1024 / 1024 <= 1) {
        newPartner = {
          image_url: img[0],
          name: newPartnerName
        };
      } else alert(_("image_not_load").replace(/{img}/g, img[0].name));
    }

    if (actionId !== undefined && Object.keys(newPartner).length !== 0) {
      result = (await fetcher.post(
        `/api/actionPartners`,
        {
          actionId: Number(actionId),
          name: newPartner.name,
          image: newPartner.image_url
        },
        { bodyType: "formData" }
      )).data;

      newPartner.id = result;
    }

    newPartners.push(newPartner);
    newPartners = newPartners;

    newPartnerName = "";
  }

  async function renamePartner(id, name) {
    if (actionId !== undefined)
      await fetcher.put(`/api/actionPartners/${id}`, { name });
  }

  async function deletePartner(partnerId) {
    if (actionId !== undefined)
      await fetcher.delete(`/api/actionPartners/${partnerId}`);
  }
</script>

<style lang="scss">
  @import "./styles/admin.scss";

  .title-h1 {
    font-size: 18px;
  }

  .save {
    margin-left: 18px;
    padding: 10px 15px;
    color: white;
    font-size: 18px;
    background: $Green;
    border-radius: 5px;
  }

  .line-center {
    display: flex;
    align-items: center;
  }

  .edit-block {
    background: white;
    margin-top: 10px;
    padding: 10px 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  }

  label {
    margin-top: 10px;
    font-weight: bold;
    display: block;
  }

  input[type="text"],
  textarea,
  input[type="date"],
  input[type="time"],
  select {
    margin-top: 8px;
    width: 100%;
    padding: 3px;
    border: 1px solid $Gray;
    box-sizing: border-box;
    height: 24px;
  }

  textarea {
    resize: none;
    min-height: 200px;
  }

  .img > button {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 2;
    font-size: 30px;
  }

  .block-name {
    font-size: $Big_Font_Size;
    margin-bottom: 15px;
    font-weight: bold;
  }

  .upload-image-block {
    box-shadow: inset 0px 0px 6px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    padding: 5px;
    font-weight: bold;
    margin-top: 25px;
    position: relative;
    & > input[type="file"] {
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .dates-block {
    margin-top: 35px;
  }

  .date-block {
    display: flex;
    align-items: flex-end;
    margin-top: 15px;

    & > div {
      width: auto;

      & > input {
        width: 100px;
      }
    }

    & > .days-block {
      width: auto;
    }

    & > div:not(:first-child) {
      margin-left: 25px;
    }
  }

  .dates-line {
    display: flex;

    & > div {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    & > div:not(:first-child) {
      margin-left: 5px;
    }
  }

  .add-date {
    background: $Light_Gray;
    border-radius: 5px;
    box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 5px;
    margin-left: 25px;
  }

  .locations-block {
    margin-top: 35px;
  }

  .location-block {
    display: flex;
    align-items: flex-end;
    margin-top: 15px;

    & > .location-select {
      width: auto;

      & > select {
        width: 165px;
      }
    }

    & > .location-name {
      width: auto;
      margin-left: 7px;

      & > input {
        width: 525px;
      }
    }

    & > button:not(.delete) {
      margin-left: 15px;
      width: 24px;
      height: 24px;
    }

    & > .delete {
      height: 30px;
      margin-left: 15px;
    }
  }

  .others-block {
    margin-top: 35px;
    display: flex;

    & > div:not(:first-child) {
      margin-left: 50px;
    }

    & select {
      width: 165px;
    }

    & > .price-block {
      & > div {
        display: flex;
        align-items: flex-end;

        & > input[type="text"] {
          width: 122px;
        }

        & > div {
          font-weight: bold;
          margin-bottom: 3px;
          margin-left: 5px;
        }
      }

      & > .free-block {
        display: flex;
        align-items: center;
        margin-top: 10px;

        & > label {
          margin: 0 0 0 5px;
          font-weight: normal;
        }
      }
    }
  }

  .organisators-block {
    display: flex;
    justify-content: space-between;
    margin-top: 35px;

    & > div {
      width: 45%;

      & select,
      input {
        width: 100%;
      }
    }
  }

  .contacts-block {
    display: flex;
    margin-top: 35px;

    & label {
      font-weight: normal;
      font-size: $LowMedium_Font_Size;
      margin: 0 5px 0 0;
      width: 70px;
    }

    & .block-name {
      font-size: $Medium_Font_Size;
      font-weight: bold;
      margin-bottom: 10px;
    }

    & input {
      width: 170px;
      margin-top: 0;
    }

    & > .contacts-block-info {
      & > div {
        display: flex;
        align-items: flex-start;

        & > div {
          & > div {
            display: flex;
            align-items: center;

            & > button {
              margin-left: 10px;
            }

            & > .delete {
              margin-left: 5px;
              font-size: 25px;
              width: 25px;
            }
          }
        }
      }
    }

    & > .messengers-block-info {
      margin-left: 50px;

      & > div {
        display: flex;
        align-items: center;
      }
    }

    & > div {
      & > div:not(:first-child) {
        margin-top: 10px;
      }
    }
  }

  .pay-block {
    margin-top: 35px;

    & label {
      font-size: $Medium_Font_Size;
      margin: 0;
      font-weight: normal;
    }

    & > div {
      display: flex;
      align-items: center;

      & > *:not(:first-child) {
        margin-left: 10px;
      }

      & > input[type="text"] {
        width: 320px;
      }
    }

    & > div:not(:first-child) {
      margin-top: 10px;
    }
  }

  .partner {
    display: grid;
    grid-template-columns: repeat(4, 150px);
    justify-content: space-between;
    grid-row-gap: 20px;
    margin-top: 15px;
  }

  .partners-block {
    margin-top: 35px;
  }

  .empty {
    position: relative;
    width: 150px;
    height: 100px;
    background: $Gray;

    & > div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 100%;
      width: 36px;
      height: 36px;

      & > div {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: $Gray;
        font-size: 50px;
      }
    }

    & > input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
  }

  .hotels-block,
  .tours-block {
    margin-top: 35px;

    & > .hotels,
    .tours {
      display: flex;
      justify-content: space-between;
    }
  }

  .select {
    border: 1px solid $Gray;
    margin-top: 8px;
    width: 165px;
    white-space: nowrap;
    overflow: hidden;
    padding-right: 20px;
    text-overflow: ellipsis;
  }

  .option {
    top: 35px;

    & label {
      margin: 0;
      font-weight: normal;
    }
  }

  .hide-label {
    height: 0;
    overflow: hidden;
    margin: 0;
  }

  .delete {
    font-size: 30px;
    height: 30px;
    width: 20px;
  }
</style>

<svelte:head>
  <title>
    {actionId === undefined ? 'Создание события' : 'Редактирование события'}
  </title>
</svelte:head>

<svelte:window on:click={hideAll} />

<AdminPage page={0} {fetcher} {locale} {_}>
  <div class="line-center">
    <h2 class="title-h1">
      {#if actionId === undefined}
        {_('creating_event')}
      {:else}{_('editing_event')}{/if}
    </h2>
    <button class="save" on:click={saveAction}>{_('save')}</button>
  </div>
  <div class="edit-block">
    <label for="title">Title</label>
    <input type="text" name="title" bind:value={title} />

    <label for="tagline">Tagline</label>
    <input type="text" name="tagline" bind:value={tagline} />

    <label for="short-description">{_('short_event_description')}</label>
    <input
      type="text"
      name="short-description"
      bind:value={short_description} />

    <label for="name">{_('event_name')}</label>
    <input type="text" name="name" bind:value={name} />

    <label for="description">{_('event_description')}</label>
    <textarea name="description" bind:value={full_description} />

    <label>{_('event_photos')}</label>
    <div class="images-block">

      {#each images as img, i}
        <div class="img-block">
          <div class="img" class:imp={img.is_main}>
            <button on:click={() => deleteImg(i, img.id)}>×</button>
            <img
              src={img.image_url}
              alt="image"
              on:click={() => changeActiveImg(i, img.id)} />
          </div>
          {#if img.is_main}
            <div class="imp-text">{_('main')}</div>
          {/if}
        </div>
      {/each}

      {#each newImages as img, i}
        <div class="img-block">
          <div class="img" class:imp={i === mainImg}>
            <button on:click={() => deleteNewImg(i, img.id)}>×</button>
            <img
              src={URL.createObjectURL(img.src)}
              alt="image"
              on:click={() => changeNewActiveImg(i, img.id)} />
          </div>
          {#if i === mainImg}
            <div class="imp-text">{_('main')}</div>
          {/if}
        </div>
      {/each}

    </div>
    <button class="upload-image-block">
      {_('upload_images')}
      <input
        type="file"
        class="upload-image"
        accept=".jpg, .jpeg, .png"
        multiple
        bind:this={uploadImg}
        on:change={changeImages}
        name="uploadImg" />
    </button>

    <div class="dates-block">
      {#each dates as date, i}
        <div class="date-block">
          <div>
            <label for="dateStart" class:hide-label={i !== 0}>
              {_('date_start')}
            </label>
            <input type="date" name="dateStart" bind:value={date.dateStart} />
          </div>

          <div>
            <label for="timeStart" class:hide-label={i !== 0}>
              {_('time_start')}
            </label>
            <input type="time" name="timeStart" bind:value={date.timeStart} />
          </div>

          <div class="days-block">
            <label class:hide-label={i !== 0}>{_('periodicity')}</label>
            <div class="dates-line">
              <div>
                {_('monday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(0) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 0))} />
              </div>
              <div>
                {_('tuesday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(1) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 1))} />
              </div>
              <div>
                {_('wednesday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(2) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 2))} />
              </div>
              <div>
                {_('thursday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(3) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 3))} />
              </div>
              <div>
                {_('friday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(4) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 4))} />
              </div>
              <div>
                {_('saturday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(5) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 5))} />
              </div>
              <div>
                {_('sunday.short')}
                <input
                  type="checkbox"
                  checked={date.days !== null && date.days.indexOf(6) !== -1}
                  on:change={() => (date.days = edit.parseDataToIds(date.days, 6))} />
              </div>
            </div>
          </div>

          <div>
            <label for="dateEnd" class:hide-label={i !== 0}>
              {_('date_end')}
            </label>
            <input type="date" name="dateEnd" bind:value={date.dateEnd} />
          </div>

          <div>
            <label for="timeEnd" class:hide-label={i !== 0}>
              {_('time_end')}
            </label>
            <input type="time" name="timeEnd" bind:value={date.timeEnd} />
          </div>

          <button
            class="delete"
            on:click={() => {
              dates.splice(i, 1);
              dates = dates;
            }}>
            ×
          </button>

          {#if i === dates.length - 1}
            <button class="add-date" on:click={addDate}>
              +{_('add_date')}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="locations-block">
      {#each locations as location, i}
        <div class="location-block">
          <div class="location-select">
            <label for="location" class:hide-label={i !== 0}>
              {_('location')}
            </label>
            <select name="location" bind:value={location.id}>
              <option value={null} />
              {#each result_filters.locations as locationName}
                <option value={locationName.id}>{locationName.name}</option>
              {/each}
            </select>
          </div>

          <div class="location-name">
            <label for="location-name" class:hide-label={i !== 0}>
              {_('venue')}
            </label>
            <input type="text" bind:value={location.address} />
          </div>

          <button>
            <img src="/img/place.png" alt="place" />
          </button>

          <button
            class="delete"
            on:click={() => {
              locations.splice(i, 1);
              locations = locations;
            }}>
            ×
          </button>

          {#if i === locations.length - 1}
            <button on:click={addLocation}>+</button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="others-block">

      <div class="price-block">
        <label for="price">{_('cost')}</label>
        <div>
          <input
            type="text"
            name="price"
            bind:value={price}
            disabled={freePrice} />
          <div>₽</div>
        </div>
        <div class="free-block">
          <input
            type="checkbox"
            name="free"
            checked={freePrice}
            on:change={() => (freePrice = !freePrice)} />
          <label for="free">{_('free').toLowerCase()}</label>
        </div>
      </div>

      <div>
        <label for="subjects">{_('subjects')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[0].btn}
            on:click={() => {
              options[0].isVisible = true;
            }}>
            {subjectsNames.join('; ')}
          </button>
          <div
            class="option"
            class:option-visible={options[0].isVisible}
            bind:this={options[0].option}>
            {#each result_filters.subjects as subject}
              <div
                on:click={() => (subjects = edit.parseDataToIds(subjects, subject.id))}>
                <label>{subject.name}</label>
                <input
                  type="checkbox"
                  checked={subjects.indexOf(subject.id) !== -1} />
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div>
        <label for="transfer">{_('transfer')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[1].btn}
            on:click={() => {
              options[1].isVisible = true;
            }}>
            {transfersNames.join('; ')}
          </button>
          <div
            class="option"
            class:option-visible={options[1].isVisible}
            bind:this={options[1].option}>
            {#each result_filters.transfers as transfer}
              <div
                on:click={() => (transfers = edit.parseDataToIds(transfers, transfer.id))}>
                <label>{transfer.name}</label>
                <input
                  type="checkbox"
                  checked={transfers.indexOf(transfer.id) !== -1} />
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div>
        <label for="companions">{_('who_can_i_go_with')}</label>
        <div class="select-block">
          <button
            class="select"
            bind:this={options[2].btn}
            on:click={() => {
              options[2].isVisible = true;
            }}>
            {companionsNames.join('; ')}
          </button>
          <div
            class="option"
            class:option-visible={options[2].isVisible}
            bind:this={options[2].option}>
            {#each result_filters.companions as companion}
              <div
                on:click={() => (companions = edit.parseDataToIds(companions, companion.id))}>
                <label>{companion.name}</label>
                <input
                  type="checkbox"
                  checked={companions.indexOf(companion.id) !== -1} />
              </div>
            {/each}
          </div>
        </div>
      </div>

    </div>

    <div class="organisators-block">

      <div>
        <label for="organisator">{_('organizer')}</label>
        <input type="text" name="organisator" bind:value={organizer_name} />
      </div>

      <div>
        <label for="organisator-user">{_('organizer_from_user')}</label>
        <select name="organisation-user" bind:value={organizer_id}>
          <option value={null} />
          {#each result_users as user}
            <option value={user.id}>{user.name} {user.surname}</option>
          {/each}
        </select>
      </div>

    </div>

    <div class="contacts-block">

      <div class="contacts-block-info">
        <div class="block-name">{_('contacts')}</div>

        <div>
          <label for="contact_face">{_('contact_face')}</label>
          <div>
            {#each contact_faces as contact_face, i}
              <div>
                <input
                  type="text"
                  name="contact_face"
                  bind:value={contact_face} />
                <button
                  class="delete"
                  on:click={() => {
                    contact_faces.splice(i, 1);
                    contact_faces = contact_faces;
                  }}>
                  ×
                </button>
                {#if i === contact_faces.length - 1}
                  <button
                    on:click={() => {
                      contact_faces.push('');
                      contact_faces = contact_faces;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>

        </div>

        <div>
          <label for="phone">{_('phone')}</label>
          <div>
            {#each phones as phone, i}
              <div>
                <input type="text" name="phone" bind:value={phone} />
                <button
                  class="delete"
                  on:click={() => {
                    phones.splice(i, 1);
                    phones = phones;
                  }}>
                  ×
                </button>
                {#if i === phones.length - 1}
                  <button
                    on:click={() => {
                      phones.push('');
                      phones = phones;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>

        </div>

        <div>
          <label for="email">E-mail</label>
          <div>
            {#each emails as email, i}
              <div>
                <input type="text" name="email" bind:value={email} />
                <button
                  class="delete"
                  on:click={() => {
                    emails.splice(i, 1);
                    emails = emails;
                  }}>
                  ×
                </button>
                {#if i === emails.length - 1}
                  <button
                    on:click={() => {
                      emails.push('');
                      emails = emails;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <div>
          <label for="site">{_('site')}</label>
          <div>
            {#each websites as website, i}
              <div>
                <input type="text" name="site" bind:value={website} />
                <button
                  class="delete"
                  on:click={() => {
                    websites.splice(i, 1);
                    websites = websites;
                  }}>
                  ×
                </button>
                {#if i === websites.length - 1}
                  <button
                    on:click={() => {
                      websites.push('');
                      websites = websites;
                    }}>
                    +
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="messengers-block-info">
        <div class="block-name">{_('messangers')}</div>

        <div>
          <label for="vk">{_('VK')}</label>
          <input type="text" name="vk" bind:value={vk_link} />
        </div>

        <div>
          <label for="fb">{_('facebook')}</label>
          <input type="text" name="fb" bind:value={facebook_link} />
        </div>

        <div>
          <label for="in">{_('instagram')}</label>
          <input type="text" name="in" bind:value={instagram_link} />
        </div>

        <div>
          <label for="tw">{_('twitter')}</label>
          <input type="text" name="tw" bind:value={twitter_link} />
        </div>
      </div>

    </div>

    <div class="pay-block">

      <div class="block-name">{_('participations_options')}</div>

      <div>
        <input
          type="radio"
          name="participation"
          bind:group={participation}
          value={'free'} />
        <label for="participation">{_('free2')}</label>
      </div>

      <div>
        <input
          type="radio"
          name="participation"
          bind:group={participation}
          value={'organizer'} />
        <label for="participation">{_('pay_via_organizer')}</label>
        <input
          type="text"
          placeholder={_('organizer_site_href')}
          bind:value={organizer_payment}
          disabled={participation !== 'organizer'} />
      </div>

      <div>
        <input
          type="radio"
          name="participation"
          bind:group={participation}
          value={'site'} />
        <label for="participation">{_('pay_in_site')}</label>
      </div>

    </div>

    <div class="partners-block">

      <div class="block-name">{_('action_partners')}</div>

      <div class="partner">

        {#each partners as partner, i}
          <div class="img-block">
            <div class="img">
              <button
                on:click={() => {
                  partners.splice(i, 1);
                  partners = partners;
                  deletePartner(partner.id);
                }}>
                ×
              </button>
              <img src={partner.image_url} alt="image" />
            </div>
            <input
              type="text"
              bind:value={partner.name}
              placeholder={_('partner_name')}
              on:blur={() => renamePartner(partner.id, partner.name)} />
          </div>
        {/each}

        {#each newPartners as partner, i}
          <div class="img-block">
            <div class="img">
              <button
                on:click={() => {
                  newPartners.splice(i, 1);
                  newPartners = newPartners;
                  deletePartner(partner.id);
                }}>
                ×
              </button>
              <img src={URL.createObjectURL(partner.image_url)} alt="image" />
            </div>
            <input
              type="text"
              bind:value={partner.name}
              placeholder={_('partner_name')}
              on:blur={() => renamePartner(partner.id, partner.name)} />
          </div>
        {/each}

        <div>
          <button class="empty">
            <div>
              <div>+</div>
            </div>
            <input
              type="file"
              class="upload-image"
              accept=".jpg, .jpeg, .png"
              bind:this={uploadPartners}
              on:change={changePartners}
              name="uploadImg" />
          </button>
          <input
            type="text"
            placeholder={_('partner_name')}
            bind:value={newPartnerName} />
        </div>

      </div>

    </div>

    <div class="hotels-block">

      <div class="block-name">{_('hotels_nearby')}</div>

      <div class="hotels">
        {#each [0, 0, 0, 0] as bl}
          <button class="empty">
            <div>
              <div>+</div>
            </div>
          </button>
        {/each}
      </div>

    </div>

    <div class="tours-block">

      <div class="block-name">{_('excursions_and_tours_nearby')}</div>

      <div class="tours">
        {#each [0, 0, 0, 0] as bl}
          <button class="empty">
            <div>
              <div>+</div>
            </div>
          </button>
        {/each}
      </div>

    </div>

  </div>
</AdminPage>
