<script>
    import Image from "/components/imageCenter.svelte";

    export let name, image_url, site,  price, href, _;
</script>

<style lang="scss">
    @import "./styles/admin.scss";

    .excursion-block{
        padding: 20px;
        box-sizing: border-box;
        width: 225px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        background: white;

        & > *:not(:first-child){
            margin-top: 10px;
        }
    }

    h3{
        font-size: $LowBig_Font_Size;
    }

    .image-block{
        position: relative;
        width: 100%;
        height: 100px;
        overflow: hidden;
    }

    a{
        color: $Blue;
        display: block;
    }

    ul > li:not(:first-child){
        margin-top: 5px;
    }

    .edit{
        margin: 10px auto 0;
        padding: 10px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        width: 125px;
        text-align: center;
    }
</style>

<div class="excursion-block">
  <h3>{name}</h3>
  <div class="image-block">
    <Image src={image_url} alt="test" />
  </div>
  <a href={site}>{site}</a>
  <ul class="locations">
    <li>{_('price')}: {price}{_('rub')}</li>
  </ul>
  <!-- <a {href} class="edit">{_('edit')}</a> -->
</div>
