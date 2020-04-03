<script>
  import { slide } from "svelte/transition";

  export let _;
  let hideForm = false,
    hideApplications = false;
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  * {
    color: #434343;
  }

  .balance-block {
    background: #f5f7fa;
    padding: 100px;
    box-sizing: border-box;
    margin-top: 50px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
  }

  h2 {
    font-size: 36px;
    color: #34353f;
    font-family: $Playfair;
  }

  .balance-info-block {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > div {
      font-size: 36px;
      font-weight: 600;
    }
  }

  .hide {
    margin-top: 25px;
    font-size: $Big_Font_Size;
    display: flex;
    align-items: center;

    &:not(:first-child) {
      margin-top: 90px;
    }

    & > img {
      transform: rotate(90deg);
      width: 15px;
      height: 10px;
      transition: 0.3s;

      &.rotate {
        transform: rotate(270deg);
      }
    }

    & > span {
      margin-right: 10px;
    }
  }

  .payment-block > h3 {
    margin-top: 55px;
    font-family: $Playfair;
    font-size: 24px;
  }

  .payment-block,
  .price-list-block {
    display: flex;
    flex-direction: column;
  }

  input {
    background: white;
    padding: 15px 30px;
    box-sizing: border-box;
    border-radius: 100px;
    box-shadow: 0px 0px 20px rgba(229, 229, 229, 0.35);
  }

  .payment-info-block {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    & > div {
      width: 700px;

      & > div {
        display: flex;
        align-items: center;
        height: 50px;
        margin-top: 40px;

        & > label {
          min-width: 150px;
          max-width: 150px;
          font-size: $Big_Font_Size;
        }

        & > input {
          width: calc(100% - 150px);
          margin-left: 30px;
        }
      }
    }

    & > div:last-child {
      width: 265px;

      & > div {
        & > label {
          min-width: 40px;
          max-width: 40px;
        }
        & > input {
          width: calc(100% - 40px);
        }
      }
    }
  }

  .price-block {
    display: flex;
    align-items: center;
    margin-top: 60px;

    & > label {
      width: 150px;
      font-size: $Big_Font_Size;
    }

    & > input {
      margin: 0 30px;
      width: 150px;
    }

    & > .ruble {
      font-size: 40px;
    }

    & > button {
      margin-left: 115px;
      width: 200px;
      background: linear-gradient(109.85deg, #0a92db 7.11%, #117bcd 78.9%);
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    }
  }

  .price-list {
    margin-top: 50px;
    width: 330px;
    border-spacing: 0px;

    & > tr {
      &:first-child > td {
        color: black !important;
      }

      &:not(:first-child) > td {
        padding-top: 25px;
      }

      & > td {
        width: 200px;
        position: relative;
        font-size: 20px;
        font-weight: 600;

        &:first-child {
          color: $Blue;
        }

        & > div {
          display: flex;
          align-items: center;

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
    background: white;
    padding: 50px 100px;
    box-sizing: border-box;
    margin-top: 35px;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);

    &:first-child{
      margin-top: 50px
    }

    & > h3 {
      margin: 0;
      font-size: 24px;
      font-family: $Playfair;
      letter-spacing: 0.1em;
    }

    & > ul{
      margin-top: 10px;
    }


  }

  .tickets-block {
    display: flex;
    justify-content: space-between;
    margin-top: 45px;

    & > div {
      width: 275px;

      & > span {
        font-weight: 600;
        font-size: 20px;
      }

      & > table {
        width: 100%;

        & td{
            padding-top: 10px;
            font-size: 20px;
          }
      }

      &.services-block{
        width: 350px;
      }
    }

    & > .download-info-block {
      width: 320px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;

      & > button {
        background: linear-gradient(180deg, #FFC700 0%, rgba(255, 199, 0, 0.7) 100%);
        display: flex;
        align-items: center;
        padding: 35px 15px;
        color: white;
        text-align: left;
        box-sizing: border-box;
        border-radius: 10px;
        font-size: 20px;

        & > img {
          margin-right: 15px;
          width: 50px;
        }
      }
    }
  }

  .user-events-block{
    margin-top: 100px;
    
    & > h2{
      margin: 0;
    }
  }

  .payed {
    font-size: 24px;
    font-weight: 600;

    & > span{
      color: $Blue;
      margin-left: 20px;
    }
  }

  hr{
    width: calc(100% + 200px);
    margin: 35px 0 35px -100px;
    border-top: 1px solid #E7E7E7;
  }

  .gray {
    color: #c4c4c4;
  }

  .red {
    color: #b66868;
  }

  .green {
    color: #8cc261;
  }
</style>

<div>
  <div class="balance-block">
    <div class="balance-info-block">
      <h2>{_('balance_status')}</h2>
      <div>10 500 {_('rub')}</div>
    </div>
    <button class="hide" on:click={() => (hideForm = !hideForm)}>
      <span>
        {#if !hideForm}
          {_('hide_application_form')}
        {:else}{_('show_application_form')}{/if}
      </span>
      <img src="/img/next.svg" alt="hide" class:rotate={hideForm} />
    </button>
    <br />
    {#if !hideForm}
      <div class="payment-block" transition:slide>
        <h3>{_('request_for_applications')}</h3>
        <div class="payment-info-block">
          <div>
            <div>
              <label for="name">{_('recipient')}</label>
              <input type="text" name="name" />
            </div>
            <div>
              <label for="bank">{_('recipient_bank')}</label>
              <input type="text" name="bank" />
            </div>
            <div>
              <label for="number">{_('account_number')}</label>
              <input type="text" name="number" />
            </div>
          </div>
          <div>
            <div>
              <label for="bik">{_('bik')}</label>
              <input type="text" name="bik" />
            </div>
            <div>
              <label for="inn">{_('inn')}</label>
              <input type="text" name="inn" />
            </div>
            <div>
              <label for="kpp">{_('kpp')}</label>
              <input type="text" name="kpp" />
            </div>
          </div>
        </div>
        <div class="price-block">
          <label for="price">{_('amount')}</label>
          <input type="text" name="price" />
          <span class="ruble">₽</span>
          <button class="blue-button">{_('send_request')}</button>
        </div>
      </div>
    {/if}
    <button
      class="hide"
      on:click={() => (hideApplications = !hideApplications)}>
      <span>
        {#if !hideApplications}
          {_('hide_all_applications')}
        {:else}{_('show_all_applications')}{/if}
      </span>
      <img src="/img/next.svg" alt="hide" class:rotate={hideApplications} />
    </button>
    {#if !hideApplications}
      <div class="price-list-block" transition:slide>
        <table class="price-list">
          <tr>
            <td>{_('amount')}</td>
            <td>{_('order_status')}</td>
          </tr>
          <tr>
            <td>8900{_('rub')}</td>
            <td class="gray">{_('processed')}</td>
          </tr>
          <tr>
            <td>3900{_('rub')}</td>
            <td>
              <div class="red">
                {_('rejected')}
                <button class="info">
                  <img src="/img/tooltip.png" alt="tooltip" />
                </button>
                <div class="info-hover">*сообщение с ошибкой*</div>
              </div>
            </td>
          </tr>
          <tr>
            <td>1900{_('rub')}</td>
            <td class="green">{_('paid')}</td>
          </tr>
        </table>
      </div>
    {/if}
  </div>

  <div class="user-events-block">
    <h2>{_('your_events')}</h2>

    <div class="events-block">
      <div class="event">
        <h3>Веревочные соревнования среди взрослых и детей в Вуки-Парк</h3>
        <ul>
          <li>локация</li>
          <li>локация</li>
        </ul>
        <ul>
          <li>дата</li>
          <li>дата</li>
        </ul>
        <div class="tickets-block">
          <div class="ticket-block">
            <span>{_('paid_tickets')}</span>
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
            <span>{_('paid_additional')}</span>
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
              <img src="/img/excel.svg" alt="excel" />
              {_('download_registered_users')}
            </button>
          </div>
        </div>
        <hr />
        <div class="payed">{_('paid2')} <span>29 500 {_('rub')}</span></div>
      </div>
    </div>
  </div>
</div>
