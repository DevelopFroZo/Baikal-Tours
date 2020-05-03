<script context="module">
  import Fetcher from "/helpers/fetcher.js";
  import { parseDate } from "/helpers/parsers.js";
  import { isMobile } from "/helpers/validators.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);
    let actionId = page.query.id;
    let locale = session.locale;
    let userId = session.userId;

    let result_action = await fetcher.get(`/api/actions/${actionId}`, {
      credentials: "same-origin"
    });

    if (result_action.ok){
      result_action = result_action.data;

      let firstSimilarDate = new Date(result_action.dates[0].date_start);
      firstSimilarDate.setDate(firstSimilarDate.getDate() + 1);
      firstSimilarDate = parseDate(firstSimilarDate);

      let similar_events = (await fetcher.get("/api/actions/", {
        credentials: "same-origin",
        query: {
          filter: "",
          dateStart: firstSimilarDate,
          subjects: [result_action.subjects[0].id],
          count: 2
        }
      })).actions;

      let mobile = isMobile(session["user-agent"]);

      return { result_action, actionId, userId, locale, similar_events, mobile};
    } 

    this.error(404, "page not found");
  }
</script>

<script>
  import BreadCrumbs from "/components/breadcrumbs.svelte";
  import { onMount } from "svelte";
  import Header from "/components/header.svelte";
  import Footer from "/components/footer.svelte";
  import { parsePrice } from "/helpers/parsers.js";
  import { validateMail, validatePhone } from "/helpers/validators.js";
  import { contactsToString, dateToString } from "/helpers/converters.js";
  import i18n from "/helpers/i18n/index.js";
  import { stores } from "@sapper/app";
  import SimilarEvent from "/components/similar_event.svelte";
  import * as animateScroll from "svelte-scrollto";
  import Carousel from "/components/carousel.svelte";
  import Image from "/components/imageCenter.svelte";
  import BannerBlock from "/components/bannerBlock.svelte";
  import { slide } from "svelte/transition";
  import { fade } from "svelte/transition";
  import isValidActionDate from "/helpers/isValidActionDate.js";
  import YandexMap from "/components/yandexMap/index.svelte";

  export let result_action, actionId, userId, locale, similar_events, mobile;

  const fetcher = new Fetcher();
  const { session } = stores();
  const _ = i18n(locale);
  const customIcon = {
    iconImageHref: "/img/placeholder-map.svg",
    iconImageSize: [ 30, 42 ],
    iconImageOffset: [ -14, -36 ]
  };
  const apiKey = "c7b75af8-80f3-4ff2-afb6-a05da8ecdeec";

  let response,
    resp,
    second_price,
    userName = "",
    surname = "",
    userPhone = "",
    userMail = "",
    disabled = true,
    actionsParams,
    start = false,
    vkHref,
    twitterHref = "",
    facebookHref = "",
    initEditor = false,
    registerBlock,
    transfers,
    total,
    initVk = false,
    tickets = [],
    additionals = [],
    ticketsWithCount = [],
    additionalsWithCount = [],
    showBuyWindow = false,
    userDate = "",
    showDateChange = true,
    dates = result_action.dates,
    coords = [];

  $: {
    total = 0;

    for(let ticket of [...ticketsWithCount, ...additionalsWithCount])
      total += ticket.count * ticket.price;
  }

  $: {
    for(let location of result_action.locations)
      if(location.coords)
        coords.push({
          coords: location.coords
        });
    
    coords = coords;
  } 

  $: {
    result_action;
    changeAllData();
  }

  $: ticketsWithCount = tickets.filter(el => el.count);
  $: additionalsWithCount = additionals.filter(el => el.count);

  $: if (userName !== "" && userPhone !== "" && validateMail(userMail) && surname !== "" && userDate !== "")
      disabled = tickets.length ? !ticketsWithCount.length : false;
     else disabled = true;
  
  $: {
    let date = new Date(userDate);
    if( userDate !== "" && showDateChange){

      if(dates[0].time_start !== null)
        date.setHours(Number(dates[0].time_start.split(":")[0]))
      
      if( !dates.some(el => isValidActionDate(el, date))){
        alert(_("date_not_correct"))
        userDate = "";
      }
    }
  }

  function changeAllData(){
    userName = "";
    surname = "";
    userPhone = "";
    userMail = "";
    disabled = true;
    tickets = [];
    additionals = [];
    ticketsWithCount = [];
    additionalsWithCount = [];
    showBuyWindow = false;
    userDate = "";
    total = 0;
    showDateChange = true;;

    transfers = [];
    for(let transfer of result_action.transfers)
      transfers.push(transfer.name);

    second_price = parsePrice(result_action.price_min, result_action.price_max, _);

    tickets = result_action.buyable.filter(el => el.type === "ticket");
    additionals = result_action.buyable.filter(el => el.type === "additional");

    showDateChange = !(result_action.dates.length === 1 && result_action.dates[0].date_start === result_action.dates[0].date_end);

    if(!showDateChange)
      userDate = result_action.dates[0].date_start === null ? result_action.dates[0].date_end : result_action.dates[0].date_start;

    for(let ticket of result_action.buyable)
      ticket.count = 0;

    if(start){
      setShare();
      startEditor();
    }
    
  }

  onMount(() => {
    actionsParams = localStorage.getItem("actionsParams");
    if (actionsParams === null) actionsParams = "./events";

    start = true;
    if(initEditor)
      startEditor();

    if(initVk)
      startVkShare();

    setShare();
  });

  function setShare(){
    twitterHref = encodeURI(result_action.name + "\n\n" + document.location.href);
    facebookHref = document.location.href;
  }

  function startVkShare(){
    vkHref = VK.Share.button(false, {
      type: "custom",
      text: '<img src="/img/vk-grey.svg"/>'
    });
  }
  
  async function subscribeUser() {
    let reservationData = {
      userId: Number(userId),
      actionId: Number(actionId),
      surname,
      name: userName,
      phone: userPhone,
      email: userMail,
      date: new Date(userDate).toISOString()
    }

    let countedTickets = [];
    for(let ticket of [...ticketsWithCount, ...additionalsWithCount])
      countedTickets.push({
        actionBuyableId: ticket.id,
        count: ticket.count
      })

    if(countedTickets.length)
      reservationData.buyable = countedTickets;

    let reservationResult = await fetcher.post(`/api/actionReservations`, reservationData);

    if(reservationResult.ok)
      showBuyWindow = true;
  }

  function startEditor(){
    var editorText = new Quill("#description-block",{
      readOnly: true
    })
    
    editorText.setContents(editorText.clipboard.convert(result_action.full_description.replace(/\n/g, "</br>")))
  }
</script>

<style lang="scss">
  @import "./styles/global";

  .form-width {
    margin: 15px auto 15px;
    font-size: $Medium_Font_Size;
  }

  h1 {
    font-weight: bold;
    font-size: $UltraBig_Font_Size;
  }

  .italic-bold {
    font-weight: bold;
    font-style: italic;
    font-size: $LowBig_Font_Size;
    margin-top: 32px;
  }

  .italic {
    margin-top: 20px;
    font-style: italic;
  }

  #description-block {
    margin-top: 35px;
  }

  .register-center{
    display: flex;
    justify-content: center;
  }

  .register-form {
    margin-top: 100px;
    background: #F5F7FA;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 20px;
    box-sizing: border-box;
    display: inline-block;
    position: relative;

    & > hr{
      border-color: #E7E7E7;
      margin: 0;
    }

    & > .register-info-blocks {
      display: inline-flex;
      padding: 85px 50px 30px;

      & > .inputs-block {
        width: 340px;

        & > .input-block:not(:first-child) {
          margin-top: 30px;
        }

        & > .input-block{
          position: relative;

          input {
            background: white;
            box-sizing: border-box;
            box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
            border-radius: 100px;
            width: 100%;
            padding: 15px 50px 15px 20px; 
            box-sizing: border-box;
            width: 100%;
            font-size: $Big_Font_Size;
          }

          & > .img-block{
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            border-radius: 100px;
            background: $Orange_Gradient;
            box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.45);

            & > img{
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              height: 15px;
            }
          }
        }
      }

      & > .register-categoty-block {
        padding-left: 20px;
        margin-left: 20px;
        width: 360px;
        box-sizing: border-box;

        & > h2 {
          margin: 0 0 38px 0;
          font-size: 24px;
          font-family: $Playfair;
          text-align: center;
        }

        & .ticket-block {
          display: flex;
          justify-content: space-between;
          align-items: center;

          & > *{
            font-size: 24px;
          }

          &:not(:first-child){
            margin-top: 25px;
          }

          & .ticket-price {
            color: $Blue;
          }

          & > .counter {
            display: flex;
            align-items: center;

            & > button {
              width: 30px;
              height: 30px;
              border-radius: 100px;
              font-size: $Big_Font_Size;

              &:first-child{
                background: linear-gradient(193.13deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
              }

              &:last-child{
                background: $Orange_Gradient;
                box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
              }
            }

            & > *:not(:first-child) {
              margin-left: 20px;
            }
          }
        }
      }
    }
  }

  label {
    font-weight: bold;
  }

  .register-button {
    display: block;
    background: $Blue_Gradient;
    box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    border-radius: 100px;
    padding: 15px 50px;
    color: white;
    font-size: $LowBig_Font_Size;
    transition: 0.3s;

    &:disabled {
      opacity: 0.3;
    }
  }

  ul {
    list-style-type: none;
  }

  .main-carousel {
    margin-top: 90px;
  }

  .carousel-cell {
    height: 350px;
    width: 500px !important;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .contact-ul {
    margin-top: 10px;

    & > li {
      margin-top: 5px;
    }
  }

  .main-block {
    min-height: 650px;
    position: relative;
    background: linear-gradient(126.58deg, rgba(255, 255, 255, 0.6) 50.56%, rgba(255, 255, 255, 0) 58.16%);
    overflow: hidden;

    & > .form-width {
      padding-top: 235px;
      padding-right: 480px;
      box-sizing: border-box;

      & > h1 {
        font-size: 36px;
        font-family: $Playfair;
        margin-top: 20px;
        color: #34353F;
      }

      & > button{
        margin-top: 40px;
      }
    }

    & > :global(img) {
      z-index: -1;
    }
  }

  h2 {
    margin: 20px 0 25px;
  }

  .total-price {
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #4D5062;

    & > span{
      color: $Blue;
      font-size: 26px;
    }
  }

  ul.italic > li:not(:first-child) {
    margin-top: 15px;
  }

  .partners-block{
    margin-top: 100px;

    & > h3{
      font-family: $Playfair;
      margin: 0;
      font-size: $UltraBig_Font_Size;
      color: #34353F;
    }
  }

  .partners-carousel {
    margin-top: 40px;

    & :global(.flickity-viewport){
      overflow: visible;
    }

    & .partner-block {
      text-align: center;
      width: 280px;
      height: 180px;
      background: white;
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      position: relative;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 80%;
        max-height: 80%;
      }

      &:not(:first-child){
        margin-left: 25px;
      }
    }
  }

  .contacts-and-place {
    display: flex;
    margin-top: 45px;
    justify-content: space-between;

    & > .contacts-block {
      padding-left: 20px;
      box-sizing: border-box;
      width: calc(100% - 800px - 50px);
      padding: 0;
      margin-top: 0;

      & h2 {
        font-family: $Playfair;
        margin: 0;
        margin-top: -10px;
        color: #34353F;
        font-size: $UltraBig_Font_Size;
      }

      & li {
        margin: 0 !important;
      }
    }

    & > .map-block {

      & > .map {
        width: 800px;
        height: 350px;
        background: $Gray;
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
        border-radius: 10px;
        overflow: hidden;
        position: relative;

        & h3{
          position: absolute;
          top: 30px;
          left: 0;
          background: linear-gradient(182.54deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
          box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
          border-radius: 0px 10px 10px 0px;
          padding: 15px 20px;
          max-width: 425px;
          z-index: 2;
          font-size: $Big_Font_Size;
          font-family: $Playfair;
        }
      }
    }
  }

  .share {
    display: flex;
    align-items: center;
    font-family: $Playfair;
    font-size: $Big_Font_Size;
    margin-top: 35px;
    font-weight: bold;
    
    & :global(img) {
      margin-left: 20px;
      height: 20px;
    }

    & :global(img:first-child){
      margin-left: 30px;
    }
  }

  .banners-block {
    margin-top: 100px;

    & > .banners-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      & > h2 {
        font-size: $UltraBig_Font_Size;
        color: #34353F;
        font-family: $Playfair;
        margin: 0;
      }

      & > a{
        font-size: $Big_Font_Size;
        color: #34353F;
        text-decoration: underline;
      }
    }

    & > .banners {
      display: grid;
      grid-template-columns: repeat(3, auto);
      justify-content: space-between;
      margin-top: 40px;
    }
  }

  hr {
    border-top: 1px solid black;
    margin: 50px 0 30px;
  }

  .auto-height {
    min-height: auto !important;
  }

  .similar-events-block {
    margin-top: 100px;
    margin-bottom: 100px;

    & > h2 {
      margin: 0;
      font-size: $UltraBig_Font_Size;
      font-family: $Playfair;
    }

    & > .similar-events {
      margin-top: 45px;
      display: grid;
      grid-template-columns: repeat(2, auto);
      justify-content: space-between;
    }
  }

  .footer-banners {
    background: $Light_Gray;
  }

  .form-width.banners-block {
    text-align: left;
    margin: auto;
    padding: 25px 0 20px;

    & .banners {
      & > div {
        text-align: left;
        font-style: italic;
        font-size: $LowBig_Font_Size;
      }
    }
  }

  .little-margin {
    margin: 25px 0 0 0;
  }

  :global(.ql-editor){
    padding: 0 !important;
  }

  .subjects-block{
    display: flex;
    align-items: center;

    & > li{
      display: flex;
      align-items: center;
      color: $Blue;
      font-size: $Big_Font_Size;
    }

    & .point{
      width: 7px;
      height: 7px;
      border-radius: 10px;
      border: 1px solid $Blue;
      box-sizing: border-box;
      margin: 0 15px;
    }
  }

  .locations-block{
    margin-top: 20px;

    & li{
      color: rgba(52, 53, 63, 0.7);
      font-weight: bold;
      font-size: $Big_Font_Size;

      &:not(:first-child){
        margin-top: 10px;
      }
    }
  }

  .short-description{
    width: 65%;
    font-size: 24px;
    font-weight: bold;
    margin-top: 50px;
  }

  #description-block{
    width: 800px;
    margin: 140px auto 0;
    font-size: 20px;
  }

  .contacts-block{
    background: #F5F5F5;
    padding: 100px 0;
    margin-top: 100px;

    & > .form-width{
      min-height: auto;
    }
  }

  .line {
    display: flex;
    align-items: flex-start;
    margin-top: 30px;

    & > .img-block {
      margin-right: 15px;
      min-width: 30px;
      max-width: 30px;
      height: 30px;
      background: linear-gradient(315deg, #F8A822 26.87%, #FCD41F 91.87%);
      position: relative;
      border-radius: 100px;

      & > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 15px;
      }

      &.vk{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.facebook{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.twitter{
        background: linear-gradient(315deg, #2177D2 26.87%, #0341C0 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }

      &.instagram{
        background: linear-gradient(315deg, #D33D93 26.87%, #FFCA52 91.87%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1);
      }
    }

    & li{
      font-size: $Big_Font_Size;
      color: #34353F;
      width: 300px;

      & > a{
        color: #348EE0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 300px;
        display: block;
      }
    }

    &.contacts-flex{
      align-items: center;
    }
  }

  .final-price-block{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 30px 50px 60px;

    & > *{
      width: 340px;
    }

    & > button{
      margin-top: 30px;
    }
  }

  .only-inputs{
    padding-top: 0px !important;
  }

  .already-tickets-block{
    position: fixed;
    min-height: 100vh;
    top: 0;
    left: 0;
    z-index: 5;
    box-sizing: border-box;
    width: 100%;
    overflow-y: scroll;

    & > button{
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 0;
      background: #00000088;
    }
  }

  .already-tickets{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    z-index: 1;

    & > div{
      padding: 50px;
      background: #F8F9FB;
      border-radius: 10px;
      max-height: 800px;
      overflow: auto;
      box-sizing: border-box;
      -ms-overflow-style: none;
      scrollbar-width: none;

      & *{
      font-size: 18px;
      }

      & > h3{
        font-size: 24px;
        color: #4D5062;
        text-align: center;
        width: 75%;
        margin: 0 auto;
      }

      & > hr{
        width: calc(100% + 100px);
        margin-left: -50px;
        border: 1px solid #E7E7E7;
        margin: 40px 0 30px -50px;
      }

      & > .user-data-block{
        margin-top: 20px;

        & > .user-data{

          & > h5{
            font-size: $Big_Font_Size;
            color: #4f4f4f;
            font-weight: normal;
          }

          & > span{
            margin-top: 20px;
            display: block;
            font-weight: 600;
          }

          &:not(:first-child){
            margin-top: 30px;
          }
        }
      }

      & > .user-tickets-block{
        & > h4{
          font-family: $Playfair;
          font-size: 20px;
          color: #4f4f4f;
        }

        & > .additional-header{
          margin-top: 30px;
        }

        & > table{
          margin-top: 10px;
          width: 100%;

          & > tr{

            & > td:first-child{
              color: #4f4f4f;
            }

            & > td:last-child{
              text-align: right;
              color: $Blue;
              font-weight: 600;
            }

            & > td{
              padding-top: 20px;
            }
          }
        }
      }

      & > .user-total{
        display: flex;
        align-items: center;
        justify-content: space-between;

        & > .user-total-text{
          font-weight: 600;
          font-size: 24px;
          color: #4f4f4f;
        }

        & > .blue{
          color: $Blue;
          font-size: 20px;
          font-weight: 600;
        }
      }

      & > .buttons-block > button{
        display: block;
        border-radius: 100px;
        font-size: $LowBig_Font_Size;
        width: 100%;
        padding: 18px 0;
        font-weight: 600;

        &.blue-button{
          background: $Blue_Gradient;
          color: white;
          box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
          margin-top: 30px;
        }

        &.back{
          background: linear-gradient(181.91deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
          box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.05);
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;

          & > img{
            width: 20px;
            transform: rotate(180deg);
            margin-right: 10px;
          }
        }
      }
    }
  }

  .already-tickets > div::-webkit-scrollbar{
    display: none;
  }

  .close-window{
    position: absolute;
    width: 45px;
    height: 45px;
    right: calc(45px / 2 * -1);
    top: calc(45px / 2 * -1);
    background: #F5F5F5;
    border-radius: 100px;
  
    & > img{
      width: 15px;
    }
  }

  @media only screen and (max-width: 768px) {
    h1 {
      font-size: $Big_Font_Size;
    }

    .info-block {
      flex-direction: column-reverse;
    }

    #description-block {
      padding: 0;
    }

    .left-side {
      margin-top: 30px;
    }

    .register-form {
      width: 100%;
      padding: 30px 50px;
    }

    .main-block > .form-width{
      width: 100%;
      padding: 190px 15px 85px;

      & > h1{
        font-size: 24px;
      }

      & li{
        font-size: $LowBig_Font_Size;

        & > .point{
          width: 5px;
          height: 5px;
        }
      }

      & > .locations-block li{
        color: #34353F;
      }

      & > button{
        width: 100%;
      }
    }

    .short-description{
      width: 100%;
      font-size: $Big_Font_Size;
    }

    .carousel-cell{
      width: 245px !important;
      height: 190px;
    }

    .main-carousel{
      margin-top: 40px;
    }

    #description-block{
      width: 100%;
      margin: 50px 0 0 0;
      font-size: $Medium_Font_Size;
    }

    .partners-block{
      margin-top: 60px;

      & > h3{
        font-size: 24px;
      }
    }

    .partner-block{
      width: 145px !important;
      height: 90px !important;
      margin-left: 0 !important;
    }

    .contacts-block{
      padding-top: 40px;
      width: 100%;
      padding-bottom: 30px;

      & > .contacts-and-place{
        flex-direction: column;
        justify-content: flex-start;
        padding: 0 15px;
        margin-top: 0;

        & > .contacts-block{
          padding-top: 0;
          padding-bottom: 0;
          width: 100%;
          margin-top: 0;

          & h2{
            font-size: 24px;
            margin: 0;
          }

          & .line{
            & > div{
              min-width: 25px;
              max-width: 25px;
              height: 25px;

              & > img{
                width: 12px;
              }
            }

            & li{
              font-size: $Medium_Font_Size;

              & > a{
                width: 240px;
              }
            }
          }
        }

        & > .map-block{
          width: 100%;
          margin-top: 30px;

          & > .map{
            width: 100%;
            height: 210px;

            & h3{
              font-size: $Medium_Font_Size;
              padding: 10px 15px;
            }
          }

          & > .share{
            font-size: $Medium_Font_Size;
          }
        }
      }
    }

    .register-form{
      margin-top: 75px;
      padding: 35px 15px;

      & > .register-info-blocks{
        flex-direction: column;
        padding: 0;
        width: 100%;

        & > div{
          padding: 0 !important;
          min-width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          
          &:not(:first-child){
            margin-top: 40px;
          }
        }

        & input{
          font-size: $Medium_Font_Size;
        }
        
        & h2{
          font-size: $Big_Font_Size;
        }

        & .ticket-block > *{
          font-size: $Big_Font_Size !important;
        }

      }

      & > hr{
        margin-top: 30px;
      }

      & > .final-price-block{
        padding: 0;
        margin-top: 30px;

        & > button{
          width: 100%;
          font-size: $Big_Font_Size;
        }

        & > .total-price{
          width: 100%;
          font-size: 20px;

          & > span{
            font-size: inherit;
          }
        }
      }
    }

    .banners-block{
      margin-top: 60px;

      & > .banners-info{
        flex-direction: column;

        & > *{
          width: 100%;
        }

        & > a{
          margin-top: 10px;
          font-size: $Medium_Font_Size;
        }

        & > h2{
          font-size: 24px;
        }
      }

      & > .banners{
        overflow-x: scroll;
        grid-column-gap: 10px;
        justify-content: left;
      }
    }

    .similar-events-block{
      margin-top: 60px;

      & > h2{
        font-size: 24px;
      }

      & > .similar-events{
        margin-top: 20px;
        grid-template-columns: repeat(1, 100%);
        grid-row-gap: 20px;
      }
    }

    .form-width{
      overflow: hidden;
    }

    .already-tickets{
      width: calc(100% - 30px) !important;

      & > div{
        padding: 40px 20px !important;
        max-height: calc(100vh - 80px) !important;

        & > h3{
          width: 100% !important;
        }

        & > hr{
          width: calc(100% + 40px) !important;
          margin-left: -20px !important;
        }
      }
    }
  }
</style>

<svelte:head>
  <title>{result_action.title === null ? result_action.name : result_action.title}</title>

  <script
    type="text/javascript"
    src="https://vk.com/js/api/share.js?95"
    charset="windows-1251" on:load={() => {
      initVk = true;
      if(start)
        startVkShare();
    }}></script>

  <script src="//cdn.quilljs.com/1.3.6/quill.js" on:load={() => {
    initEditor = true;
    if(start)
      startEditor()
  }}></script>
  <link href="//cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
  <meta name="description" content={result_action.short_description}>
</svelte:head>

<Header {locale} />
<!-- <BreadCrumbs
  path={[{ name: _('event_catalog'), url: actionsParams }, { name: result_action.name, url: './action?id=' + actionId }]} /> -->
<div
  class="main-block">
  {#if result_action.images.length && result_action.images.filter(el => el.is_main)[0]}
    <Image
      src={result_action.images.filter(el => el.is_main)[0].image_url}
      alt={result_action.name} />
  {/if}
  <div class="form-width">
    {#if result_action.subjects.length > 0}
      <ul class="subjects-block">
        {#each result_action.subjects as subjects, i}
          <li>{subjects.name}
            {#if result_action.subjects.length !== i + 1}
              <div class="point" />
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
    <h1>{result_action.name}</h1>
    <div class="locations-block">
      {#if result_action.locations.length > 0}
        <ul>
          {#each result_action.locations as location}
            <li>
              {location.name + (location.address === null ? '' : ', ' + location.address)}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    {#if $session.isLogged}
      <button class="register-button" on:click={() => {
        animateScroll.scrollTo({offset: registerBlock.offsetTop - 150, duration: 1500})
      }}>{_("register")}</button>
    {/if}
  </div>

</div>
<div class="form-width">
  <!-- <p class="italic-bold">{result_action.tagline}</p> -->
  <p class="short-description">{result_action.short_description}</p>

  {#if result_action.images.length}
    <div class="main-carousel">
      <Carousel data={{slidesPerView: 'auto', preloadImages: "false", centeredSlides: true, spaceBetween: 25, speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}}
      carouselData={result_action.images}>
        {#each result_action.images as img}
          <div class="carousel-cell swiper-slide">
            <Image src={img.image_url} alt={"img"}/>
          </div>
        {/each}       
      </Carousel>
    </div>
  {/if}

  <div id="description-block"></div>

  <!-- <ul class="italic">
    <li>{_('organizer')}: {result_action.organizer_name}</li>
    <li>
      {_('how_to_get')}:
      {transfers.join("; ")}
    </li>
  </ul> -->

  {#if result_action.partners.length > 0}
    <div class="partners-block">
      <h3>{_('action_partners')}</h3>

      <div class="partners-carousel">
        <Carousel data={{slidesPerView: 'auto', spaceBetween: (mobile ? 10 : 25), speed: 750, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}}
        carouselData={result_action.partners}>
          {#each result_action.partners as partner}
            <div class="partner-block swiper-slide">
              <img
                src={partner.image_url}
                alt={partner.name === null ? 'partner' : partner.name} />
            </div>
          {/each}
        </Carousel>
        
      </div>
    </div>
  {/if}
</div>

<div class="contacts-block">
  <div class="form-width contacts-and-place">
    <div class="contacts-block">
      <div class="contacts">
        <h2>{_('contacts')}</h2>

          {#if result_action.emails !== null}
          <div class="line" class:contacts-flex={result_action.emails.length > 0}>
            <div class="img-block">
              <img src="/img/mail.svg" alt="email">
            </div>
            <ul> 
              {#each result_action.emails as email}
                <li>
                  {email}
                </li>
              {/each}
            </ul>
          </div>
          {/if}

          {#if result_action.phones !== null}
          <div class="line" class:contacts-flex={result_action.phones.length > 0}>
            <div class="img-block">
              <img src="/img/phone-call.svg" alt="phone">
            </div>
            <ul> 
              {#each result_action.phones as phone}
                <li>
                  {phone}
                </li>
              {/each}
            </ul>
          </div>
          {/if}

          {#if result_action.websites !== null}
          <div class="line contacts-flex">
            <div class="img-block">
              <img src="/img/internet.svg" alt="site">
            </div>
            <ul>
              <li>
                <a href={result_action.websites[0]} target="_blank">
                  {result_action.websites[0]}
                </a>
              </li>
            </ul>
          </div>
          {/if}

          {#if result_action.vk_link !== null}
            <div class="line contacts-flex">
              <div class="img-block vk">
                <img src="/img/vk-white.svg" alt="vk">
              </div>
              <ul>
                <li>
                  <a href={result_action.vk_link} target="_blank">{result_action.vk_link}</a>
                </li>
              </ul>
            </div>
          {/if}

          {#if result_action.instagram_link !== null}
            <div class="line contacts-flex">
              <div class="img-block instagram">
                <img src="/img/insta-white.svg" alt="instagram">
              </div>
              <ul>
                <li>
                  <a href={result_action.instagram_link} target="_blank">{result_action.instagram_link}</a>
                </li>
              </ul>
            </div>
          {/if}

          {#if result_action.facebook_link !== null}
            <div class="line contacts-flex">
              <div class="img-block facebook">
                <img src="/img/facebook-white.svg" alt="facebook">
              </div>
              <ul>
                <li>
                  <a href={result_action.facebook_link} target="_blank">{result_action.facebook_link}</a>
                </li>
              </ul>
            </div>
          {/if}

          {#if result_action.twitter_link !== null}
            <div class="line contacts-flex">
              <div class="img-block twitter">
                <img src="/img/twitter.svg" alt="twitter">
              </div>
              <ul>
                <li>
                  <a href={result_action.twitter_link} target="_blank">{result_action.twitter_link}</a>
                </li>
              </ul>
            </div>
          {/if}
      </div>
    </div>
    <div class="map-block">
      <div class="map">
        <div class="location-block">
          <h3>{_('venue')}: 
          {#each result_action.locations as location}
            <span>
              {location.name + (location.address === null ? '' : ', ' + location.address)}
            </span>
          {/each}
          </h3>
        </div>
        {#if coords.length}
        <YandexMap
          {apiKey}
          {customIcon}
          center={[ 52.285725130459866, 104.28156685575135 ]}
          staticPlacemarks={coords}
        />
        {/if}
      </div>
      <div class="share">
        {_('share')}
        <a
          class="twitter-share-button"
          href="https://twitter.com/intent/tweet?text={twitterHref}"
          target="_blank">
          <img src="/img/twitter-grey.svg" alt="twitter" />
        </a>
        <a
          href="https://www.facebook.com/sharer/sharer.php?u={facebookHref}"
          target="_blank">
          <img src="/img/facebook-grey.svg" alt="facebook" />
        </a>
        {@html vkHref}
      </div>
    </div>
  </div>
</div>

<div class="form-width" bind:this={registerBlock}>
  {#if $session.isLogged}
    <div class="register-center">
      <div class="register-form">
        <div class="register-info-blocks">
          <div class="inputs-block" class:only-inputs={result_action.buyable.length === 0}>
            <div class="input-block">
              <input type="text" bind:value={userName} placeholder={_("name")}/>
              <div class="img-block">
                <img src="/img/user-black.svg" alt="user">
              </div>
            </div>
            <div class="input-block">
              <input type="text" bind:value={surname} placeholder={_("surname")}/>
              <div class="img-block">
                <img src="/img/user-black.svg" alt="user">
              </div>
            </div>
            <div class="input-block">
              <input
                type="text"
                bind:value={userPhone}
                on:keydown={validatePhone} 
                placeholder={_("phone")}/>
              <div class="img-block">
                <img src="/img/phone-call.svg" alt="phone">
              </div>
            </div>
            <div class="input-block">
              <input type="text" bind:value={userMail} placeholder="e-mail"/>
              <div class="img-block">
                <img src="/img/mail.svg" alt="e-mail">
              </div>
            </div>
            {#if showDateChange}
              <div class="input-block">
                <input type="date" bind:value={userDate}/>
                <div class="img-block">
                  <img src="/img/calendar.png" alt="date">
                </div>
              </div>
            {/if}
          </div>
          
          {#if tickets.length > 0}
          <div class="register-categoty-block">
            <h2>{_('ticket_categories')}</h2>
            <div class="tickets-block">
              {#each tickets as ticket}
                <div class="ticket-block">
                  <div>
                    <div>{ticket.name}</div>
                    <div class="ticket-price">{ticket.price} {_('rub')}</div>
                  </div>
                  <div class="counter">
                    <button on:click={() => ticket.count = ticket.count - 1 < 0 ? 0 : ticket.count - 1 }>-</button>
                    <div class="couter-value">{ticket.count}</div>
                    <button on:click={() => ticket.count++}>+</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          {/if}

          {#if additionals.length > 0}
          <div class="register-categoty-block">
            <h2>{_('additionally')}</h2>
            <div class="tickets-block">
              {#each additionals as ticket}
                <div class="ticket-block">
                  <div>
                    <div>{ticket.name}</div>
                    <div class="ticket-price">{ticket.price} {_('rub')}</div>
                  </div>
                  <div class="counter">
                    <button on:click={() => ticket.count = ticket.count - 1 < 0 ? 0 : ticket.count - 1}>-</button>
                    <div class="couter-value">{ticket.count}</div>
                    <button on:click={() => ticket.count++}>+</button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          {/if}
        </div>
        <hr />
        <div class="final-price-block">
          {#if tickets.length}
            <div class="total-price">{_("total")}<span>{total} {_('rub')}</span></div>
          {/if}
          <button class="register-button" on:click={subscribeUser} disabled={disabled}>
            {!tickets.length ? _('register') : _("buy_tickets")}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if result_action.excursions.length > 0}
    <div class="banners-block">
      <div class="banners-info">
        <h2>{_('excursions')}</h2>
        <a href="https://fanatbaikala.ru/excursions" target="_blank">{_('more_excursions')}</a>
      </div>
      <div class="banners">
        {#each result_action.excursions as excursion}
          <BannerBlock {...excursion} {_} />
        {/each}
      </div>
    </div>
  {/if}

  {#if result_action.tours.length > 0}
  <div class="banners-block">
    <div class="banners-info">
      <h2>{_('tours')}</h2>
      <a href="https://fanatbaikala.ru/tours" target="_blank">{_('more_excursions')}</a>
    </div>
    <div class="banners">
      {#each result_action.tours as tour}
        <BannerBlock {...tour} {_} />
      {/each}
    </div>
  </div>
  {/if}

  {#if result_action.hotels.length}
    <div class="banners-block">
      <div class="banners-info">
        <h2>{_('hotels')}</h2>
        <a href="https://fanatbaikala.ru/tours" target="_blank">{_('more_hotels')}</a>
      </div>
      <div class="banners">
        {#each result_action.hotels as hotel}
          <BannerBlock {...hotel} {_} site={hotel.booking_url} noFollow={true}/>
        {/each}
      </div>
    </div>
  {/if}

  <div class="similar-events-block">
    <h2>{_('similar_events')}</h2>
    <div class="similar-events">
      {#each similar_events as favorite}
        <SimilarEvent {_} {favorite}/>
      {/each}
    </div>
  </div>
</div>
<Footer {locale} />

{#if showBuyWindow}
  <div class="already-tickets-block" transition:fade={{duration: 300}}>
    <button on:click={() => showBuyWindow = false}></button>
      <div class="already-tickets">
        <button class="close-window" on:click={() => showBuyWindow = false}><img src="/img/cross.svg" alt="cross" /></button>
        <div>
          <h3>{_("check_intered_data")}</h3>
          <hr>
          <div class="user-data-block">
            <div class="user-data">
              <h5>{_("name")} {_("surname")}</h5>
              <span>{userName} {surname}</span>
            </div>
            <div class="user-data">
              <h5>{_("phone")}</h5>
              <span>{userPhone}</span>
            </div>
            <div class="user-data">
              <h5>E-mail</h5>
              <span>{userMail}</span>
            </div>
          </div>
          <hr />
          {#if ticketsWithCount.length || additionalsWithCount.length}
            <div class="user-tickets-block">
              {#if ticketsWithCount.length}
                <h4>{_("tickets")}</h4>
                <table>
                  {#each ticketsWithCount as ticket}
                    <tr>
                      <td>{ticket.name} - {ticket.count} {_("piece_short")}</td>
                      <td class="blue">{ticket.count * ticket.price} {_("rub")}</td>
                    </tr>
                  {/each}
                </table>
              {/if}
              {#if additionalsWithCount.length}
                <h4 class="additional-header">{_("additionally")}</h4>
                <table>
                  {#each additionalsWithCount as ticket}
                    <tr>
                      <td>{ticket.name} - {ticket.count} {_("piece_short")}</td>
                      <td class="blue">{ticket.count * ticket.price} {_("rub")}</td>
                    </tr>
                  {/each}
                </table>
              {/if}
            </div>
            <hr />
          {/if}
          <div class="user-total">
            <span class="user-total-text">{_("total")}</span>
            <span class="blue">{total} {_("rub")}.</span>
          </div>
          <div class="buttons-block">
            <button class="blue-button">{_("pay").toUpperCase()}</button>
            <button class="back" on:click={() => showBuyWindow = false}><img src="/img/right-arrow.svg" alt="back">{_("back")}</button>
          </div>
        </div>
    </div>
  </div>
{/if}