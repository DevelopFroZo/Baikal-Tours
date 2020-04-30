<script context="module">
  import Fetcher from "/helpers/fetcher.js";

  export async function preload(page, session) {
    const fetcher = new Fetcher(this.fetch);

    let params = page.query;
    let locale = session.locale;
    let actions;

    if(params.filter === ""){
        actions = await fetcher.get("api/actions", {
            credentials: "same-origin",
            query: params
        });
    }
    else 
        actions = await fetcher.get("api/actions", {
            credentials: "same-origin"
        });

    return {locale, actions, apiKey: process.env.YANDEX_MAPS_API_KEY }
  }
</script>

<script>
    import Header from "/components/header.svelte";
    import Footer from "/components/footer.svelte";
    import YandexMap from "/components/yandexMap/index.svelte";
    import i18n from "/helpers/i18n/index.js";
    import Image from "/components/imageCenter.svelte";

    export let locale, actions, apiKey;

    const _ = i18n(locale);
    const customIcon = {
        iconImageHref: "/img/placeholder-map.svg",
        iconImageSize: [ 30, 42 ],
        iconImageOffset: [ -14, -36 ]
    };

    console.log(actions)
</script>

<style lang="scss">
    @import "./styles/global.scss";

    .map-block{
        width: 100%;
        height: 100vh;
        background: $Light_Gray;
    }

    .cards-block{
        position: absolute;
        left: calc(50% - 600px);
        z-index: 1;
        background: white;
        top: 160px;
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
        width: 400px;
        padding: 20px 25px;
        border-radius: 10px;
    }

    .card-block{
        position: relative;
        background: linear-gradient(270deg, rgba(255, 255, 255, 0) 26.95%, #FFFFFF 100%);
        border-radius: 10px;
        overflow: hidden;
        max-height: calc(100vh - 200px);

        & > .event-info-block{
            padding: 15px 40% 15px 20px;
            box-sizing: border-box;
            background: linear-gradient(90deg, white 40%, rgba(255, 255, 255, 0) 100%);
            position: relative;
            z-index: 2;

            & > *:not(h2){
                font-size: $Medium_Font_Size;
                margin-top: 5px;
                display: block;
            }

            & > h2{
                font-size: $LowBig_Font_Size;
                color: #34353F;
                margin: 0;
                font-family: $Playfair;
                margin: 0;
                margin-bottom: 3px;
            }

            & > span{
                color: #3B394A;
            }

            & > a{
                color: $Blue;
                text-decoration: underline;
            }
        }

        .image-block{
            position: absolute;
            height: 100%;
            width: 60%;
            top: 0;
            right: 0;
        }
    }
</style>

<Header {locale} />
<div class="map-block">
    <div class="cards-block">
        <div class="card-block">
            <div class="event-info-block">
                <h2>Веревочные сорвенования, очень крутые и веселые</h2>
                <span class="event-date">23 октября - 13 ноября</span>
                <span class="event-location">Иркутск, ул. Триллисера, д. 201</span>
                <a href="/action?id=44">{_("detailed")}</a>
            </div>
            <div class="image-block">
                <Image src="/img/test.png" alt="test" />
            </div>
        </div>
    </div>
    <YandexMap
        {apiKey}
        {customIcon}
        center={[ 52.285725130459866, 104.28156685575135 ]}
    />
</div>
<Footer {locale} />