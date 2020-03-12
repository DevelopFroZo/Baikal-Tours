<script>
    import { parseDateForCards } from "/helpers/parsers.js";
    export let action_id, name, locations, date_starts, date_ends, _;

    let dates = parseDateForCards(date_starts, date_ends, _);
</script>

<style lang="scss">
    @import "./styles/profile.scss";

    .action-block{
        margin-top: 30px;
        background: $Light_Gray;
        border: 1px solid $Dark_Gray;
        padding: 20px;
        display: flex;
        box-sizing: border-box;
    }

    .image-block{
        position: relative;
        height: 200px;
        overflow: hidden;
        width: 175px;

        & > img{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100%;
        }
    }

    .action-info-block{
        width: calc(100% - 175px - 20px);
        margin-left: 20px;
    }

    .tickets-block{
        margin: 15px 0;
        min-height: 50px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }

    ul{
        font-weight: bold;
        list-style-type: none;
    }

    li{
        font-weight: normal;
        padding: 0;
    }

    .status-text{
        font-size: $LowBig_Font_Size;
        font-weight: bold;
    }

    h2{
        margin: 0;
    }

    .action-info > ul{
        margin-top: 5px;
    }
</style>

<a class="action-block" href="/action?id={action_id}">
  <div class="image-block">
    <img src="/img/test.png" alt="image" />
  </div>
  <div class="action-info-block">
    <h2>{name}</h2>
    <div class="action-info">
      <ul>
        {#each locations as location}
            <li>{location}</li>
        {/each}
      </ul>
      <ul>
        {#each dates as date}
            <li>{date}</li>
        {/each}
      </ul>
    </div>
    <div class="tickets-block">
      <ul>
        Вaши билеты
        <li>Взрослый - 1шт. - 1000 руб.</li>
        <li>Детский - 2шт. - 1000 руб.</li>
      </ul>
      <ul>
        Дополнительно
        <li>Питание - 1шт. - 1000 руб.</li>
        <li>Снаряжение - 2шт. - 1000 руб.</li>
      </ul>
    </div>
    <p class="status-text">
      Вы зарегистрированы на событие!
      <br />
      На вашу почту отправлено письмо с подтверждением
    </p>
    <button class="blue-button">Отплатить событие</button>
  </div>
</a>
