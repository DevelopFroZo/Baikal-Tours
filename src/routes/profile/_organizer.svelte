<script>
  export let _;
  let hideForm = false,
    hideApplications = false;
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  .balance-block {
    background: $Light_Gray;
    border: 1px solid $Gray;
    padding: 20px;
    box-sizing: border-box;
    margin-top: 30px;
    color: $Light_Black;
  }

  h3 {
    margin-left: 30px;
    font-size: $Medium_Font_Size;
    font-weight: bold;
    color: black;
  }

  .balanse-info-block {
    display: flex;
    justify-content: space-between;
    font-size: 24px;
    font-weight: bold;
    margin-top: 30px;
    padding-bottom: 10px;
    border: solid $Gray;
    border-width: 0 0 1px 0;
    color: black;
  }

  .hide {
    margin-top: 10px;
  }

  .payment-block > h2 {
    margin-top: 25px;
    text-align: center;
  }

  input {
    background: white;
    border: 1px solid $Gray;
    height: 30px;
    padding: 5px;
    box-sizing: border-box;
  }

  .payment-info-block {
    display: flex;
    align-items: flex-start;

    & > div {
      width: 530px;

      & > div {
        display: flex;
        align-items: center;
        height: 30px;

        & > label {
          min-width: 80px;
          max-width: 80px;
        }

        & > input {
          width: calc(100% - 80px);
          margin-left: 10px;
        }
      }

      & > div:last-child > input {
        width: 250px;
      }

      & > div:not(:first-child) {
        margin-top: 10px;
      }
    }

    & > div:last-child {
      width: 130px;
      margin-left: 20px;

      & > div {
        & > label {
          min-width: 30px;
          max-width: 30px;
        }
        & > input {
          width: calc(100% - 30px);
        }
      }
    }
  }

  .price-block {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 25px;
    padding-bottom: 20px;
    border: solid $Gray;
    border-width: 0 0 1px 0;

    & > input {
      margin: 0 10px;
      width: 80px;
    }

    & > button {
      margin: 0 0 0 30px;
    }
  }

  .price-list {
    margin: 15px auto 0;
    width: 330px;
    border-spacing: 0px;

    & > tr {
      &:first-child {
        font-weight: bold;
        color: black;
      }
      & > td {
        width: 165px;
        padding: 5px 0;
        text-align: center;
        position: relative;
        border: solid $Gray;
        border-width: 0 0 1px 0;
        color: $Light_Black;

        & > div {
          display: flex;
          align-items: center;
          justify-content: center;

          & > button {
            margin-left: 10px;

            &:hover + div {
              visibility: visible;
            }
          }

          & > div {
            visibility: hidden;
            position: absolute;
            bottom: 30px;
            right: 0;
            background: white;
            border: $Gray;
            padding: 10px;
            width: 200px;
          }
        }
      }
    }
  }

  .event {
    background: $Light_Gray;
    border: 1px solid $Gray;
    padding: 20px;
    box-sizing: border-box;

    &:not(:first-child) {
      margin-top: 25px;
    }

    & > h2 {
      margin: 0;
    }

    & > p {
      padding: 10px 0;
      border: solid $Gray;
      border-width: 0 0 1px 0;
    }
  }

  .tickets-block {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding-bottom: 20px;
    border: solid $Gray;
    border-width: 0 0 1px 0;

    & > div {
      width: 155px;

      & > span {
        font-weight: bold;
      }

      & > table {
        margin-top: 10px;
        width: 100%;
      }
    }

    & > .download-info-block {
      width: 190px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      & > button {
        background: #4fc617;
        box-shadow: inset 0px 0px 7px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        padding: 5px 10px;
        color: white;
        text-align: left;
        box-sizing: border-box;

        & > img {
          margin-left: 5px;
        }
      }
    }
  }

  .payed {
    margin: 20px 0 0 0 !important;
  }
</style>

<div class="form">
  <div class="balance-block">
    <h3>{_("balance")}</h3>
    <div class="balanse-info-block">
      <div>{_("balance_status")}</div>
      <div>10 500 {_("rub")}</div>
    </div>
    <button class="hide" on:click={() => (hideForm = !hideForm)}>
      {#if !hideForm}{_("hide_application_form")}{:else}{_("show_application_form")}{/if}
    </button><br>
    {#if !hideForm}
      <div class="payment-block">
        <h2>{_("request_for_applications")}</h2>
        <div class="payment-info-block">
          <div>
            <div>
              <label for="name">{_("recipient")}</label>
              <input type="text" name="name" />
            </div>
            <div>
              <label for="bank">{_("recipient_bank")}</label>
              <input type="text" name="bank" />
            </div>
            <div>
              <label for="number">{_("account_number")}</label>
              <input type="text" name="number" />
            </div>
          </div>
          <div>
            <div>
              <label for="bik">{_("bik")}</label>
              <input type="text" name="bik" />
            </div>
            <div>
              <label for="inn">{_("inn")}</label>
              <input type="text" name="inn" />
            </div>
            <div>
              <label for="kpp">{_("kpp")}</label>
              <input type="text" name="kpp" />
            </div>
          </div>
        </div>
        <div class="price-block">
          <label for="price">{_("amount")}</label>
          <input type="text" name="price" />
          {_("rub")}
          <button class="blue-button">{_("send_request")}</button>
        </div>
      </div>
    {/if}
    <button class="hide" on:click={() => hideApplications = !hideApplications}>
      {#if !hideApplications}{_("hide_all_applications")}{:else}{_("show_all_applications")}{/if}
    </button>
    {#if !hideApplications}
      <table class="price-list">
        <tr>
          <td>{_("amount")}</td>
          <td>{_("order_status")}</td>
        </tr>
        <tr>
          <td>8900{_("rub")}</td>
          <td>{_("processed")}</td>
        </tr>
        <tr>
          <td>3900{_("rub")}</td>
          <td>
            <div>
              {_("rejected")}
              <button class="info">
                <img src="/img/tooltip.png" alt="tooltip" />
              </button>
              <div class="info-hover">Ну кароче ты дурачек</div>
            </div>

          </td>
        </tr>
        <tr>
          <td>1900{_("rub")}</td>
          <td>{_("paid")}</td>
        </tr>
      </table>
    {/if}
  </div>

  <h2 class="high">{_("your_events")}</h2>

  <div class="events-block">
    <div class="event">
      <h2>Веревочные соревнования среди взрослых и детей в Вуки-Парк</h2>
      <p>
        г. Байкальск, горнолыжный курорт “Гора Соболиная”
        <br />
        с 1 сентября - по 30 сентября
      </p>
      <div class="tickets-block">
        <div class="ticket-block">
          <span>
            {_("paid_tickets")}
          </span>
          <table>
            <tr>
              <td>Взрослый</td>
              <td>36шт.</td>
            </tr>
            <tr>
              <td>Детский</td>
              <td>48шт.</td>
            </tr>
            <tr>
              <td>Льготный</td>
              <td>12шт.</td>
            </tr>
          </table>
        </div>
        <div class="services-block">
          <span>
            {_("paid_additional")}
          </span>
          <table>
            <tr>
              <td>Питание</td>
              <td>36шт.</td>
            </tr>
            <tr>
              <td>Снаряжение</td>
              <td>48шт.</td>
            </tr>
          </table>
        </div>
        <div class="download-info-block">
          <button>
            {_("download_registered_users")}
            <img src="/img/excel.png" alt="excel" />
          </button>
        </div>
      </div>
      <h2 class="payed">{_("paid2")} 29 500 {_("rub")}</h2>
    </div>
  </div>

</div>
