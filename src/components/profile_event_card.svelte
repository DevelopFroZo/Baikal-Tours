<script>
    import { parseDateForCards } from "/helpers/parsers.js";
    export let action_id, name, locations, date_starts, date_ends, _, prev = false;

    let dates = parseDateForCards(date_starts, date_ends, _);
</script>

<style lang="scss">
    @import "./styles/profile.scss";

    .action-block{
        margin-top: 50px;
        background: white;
        display: flex;
        align-items: center;
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
        border-radius: 10px;
    }

    .image-block{
        position: relative;
        min-width: 400px;
        max-width: 400px;
        height: 400px;
        overflow: hidden;
        width: 175px;
        border-radius: 10px;

        & > img{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-height: 100%;
            min-width: 100%;
        }
    }

    .action-info-block{
      padding: 50px;
    }

    .tickets-block{
        min-height: 10px;
        margin-bottom: 70px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;

        & *{
          color: #434343;
          font-size: 20px;
        }

        & > ul{
          margin-top: 40px;

          & > li{
            margin-top: 30px;
          }
        }
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
        font-size: 20px;
    }

    h3{
        margin: 0;
        font-size: 24px;
        font-family: $Playfair;
        color: #34353F;
    }

    .action-info{
        margin-top: 20px;

        & > ul{

          &:not(:first-child){
            margin-top: 10px;
          }

          & > li{
            color: #434343;
            font-size: 20px;
          }
        }
    }

    .buttons{
      display: flex;
      margin-top: 50px;

      & > button{
        width: 250px;
        padding-left: 10px;
        padding-right: 10px;
        box-sizing: border-box;
        background: linear-gradient(114.29deg, #0A92DB 7.11%, #117BCD 78.9%);
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1), inset 0px 0px 50px rgba(255, 255, 255, 0.15);
      }

      & > .cansel{
        box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
        background: linear-gradient(182.67deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
        color: #434343;
      }

      & > button:not(:first-child){
        margin-left: 20px;
      }
    }

    .blue{
      color: $Blue !important;
    }

    .bold{
      font-weight: 600;
    }

    .prev{
      background: rgba(52, 53, 63, 0.2);
    }

    .red{
      color: #ED2D33;
    }
</style>

<div class="action-block" class:prev>
  <div class="image-block">
    <img src="/img/test.png" alt="image" />
  </div>
  <div class="action-info-block">
    <h2>{name}</h2>
    <h3>Название</h3>
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
        {_("your_tickets")}
        <li>Взрослый - 1шт. - <span class="blue">1000 руб.</span></li>
        <li>Детский - 2шт. - <span class="blue">1000 руб.</span></li>
      </ul>
      <ul>
        {_("additionally")}
        <li>Питание - 1шт. - <span class="blue">1000 руб.</span></li>
        <li>Снаряжение - 2шт. - <span class="blue">1000 руб.</span></li>
      </ul>
    </div>
    <p class="status-text">
      <span class="blue bold">{_("action_register_success")}</span>
      <br />
      {_("action_register_mail")}
    </p>
    <p class="status-text">
      <span class="bold blue">{_("action_confirm_pay_blue")}</span>
      <br />
      {_("action_confirm_pay")}
    </p>
    <p class="status-text red bold">{_("held_event")}</p>
    <div class="buttons">
      <button class="blue-button cansel">{_("cansel_reservation")}</button>
      <button class="blue-button">{_("pay_ticket")}</button>
    </div>
  </div>
</div>
