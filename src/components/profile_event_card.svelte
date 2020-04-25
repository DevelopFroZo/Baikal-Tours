<script>
  import { parseDate } from "/helpers/parsers.js";
  import Image from "/components/imageCenter.svelte";

  export let action_reservation_id,
    action_id,
    image_url,
    name,
    locations,
    dates,
    date,
    buyable,
    paid,
    _,
    prev = false;

  if(!buyable) buyable = [];

  let tickets = buyable.filter(el => el.type === "ticket");
  let additions = buyable.filter(el => el.type === "additional");

  date = parseDate(new Date(date));
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  .action-block {
    margin-top: 50px;
    background: white;
    display: flex;
    align-items: center;
    box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
    border-radius: 10px;
  }

  .image-block {
    position: relative;
    min-width: 400px;
    max-width: 400px;
    height: 400px;
    overflow: hidden;
    width: 175px;
    border-radius: 10px;

    & > img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-height: 100%;
      min-width: 100%;
    }
  }

  .action-info-block {
    padding: 50px;
    width: calc(100% - 400px);
  }

  .tickets-block {
    min-height: 10px;
    margin-bottom: 70px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    & * {
      color: #434343;
      font-size: 20px;
    }

    & > ul {
      margin-top: 40px;

      & > li {
        margin-top: 30px;
      }
    }
  }

  ul {
    font-weight: bold;
    list-style-type: none;
  }

  li {
    font-weight: normal;
    padding: 0;
  }

  .status-text {
    font-size: 20px;
  }

  h3 {
    margin: 0;
    font-size: 24px;
    font-family: $Playfair;
    color: #34353f;

    & > a{
      font-family: inherit;
    }
  }

  .action-info {
    margin-top: 20px;

    & > ul {
      &:not(:first-child) {
        margin-top: 10px;
      }

      & > li {
        color: #434343;
        font-size: 20px;
      }
    }
  }

  .buttons,
  .mobile-buttons {
    display: flex;
    margin-top: 50px;

    & > button {
      width: 250px;
      padding-left: 10px;
      padding-right: 10px;
      box-sizing: border-box;
      background: linear-gradient(114.29deg, #0a92db 7.11%, #117bcd 78.9%);
      box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
        inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    }

    & > .cansel {
      box-shadow: 0px 0px 70px rgba(40, 39, 49, 0.1);
      background: linear-gradient(182.67deg, #ffffff 24.24%, #efefef 90.54%);
      color: #434343;
    }

    & > button:not(:first-child) {
      margin-left: 20px;
    }
  }

  .blue {
    color: $Blue !important;
  }

  .bold {
    font-weight: 600;
  }

  .prev {
    background: rgba(52, 53, 63, 0.2);
  }

  .red {
    color: #ed2d33;
  }

  .mobile-buttons {
    display: none;
  }

  @media only screen and (max-width: 768px) {
    .action-block {
      flex-direction: column;
      padding: 30px 10px;

      & > .action-info-block {
        order: 0;
      }

      & > .image-block {
        min-width: 100%;
        max-width: 100%;
        height: 180px;
        order: 1;
        margin-top: 15px;
      }
    }

    .action-info-block {
      padding: 0;
      width: 100%;

      & * {
        font-size: $Medium_Font_Size !important;
      }

      & > h3 {
        font-size: $LowBig_Font_Size !important;
      }

      & > .tickets-block {
        flex-direction: column;
        margin-bottom: 30px;

        & > ul {
          margin-top: 30px;

          & > li {
            margin-top: 15px !important;
          }
        }
      }

      & > .buttons {
        display: none;
      }
    }

    .mobile-buttons {
      display: flex;
      flex-direction: column;
      margin-top: 20px;
      order: 2;
      justify-content: flex-start;
      align-items: flex-start;
      width: 100%;

      & > button:last-child {
        margin-top: 15px;
        margin-left: 0;
      }

      & > button {
        width: 100%;
        font-size: $Medium_Font_Size;
        padding: 10px 0;
      }
    }
  }
</style>

<div class="action-block" class:prev>
  <div class="image-block">
    <Image src={image_url} alt="image" />
  </div>
  <div class="action-info-block">
    <h3> <a href={`/action?id=${action_id}`}>{name}</a></h3>
    <div class="action-info">
      <ul>
        {#each locations as location}
          <li>{location.name}</li>
        {/each}
      </ul>
      <ul>{date}</ul>
    </div>
    <div class="tickets-block">
      {#if tickets.length}
        <ul>
          {_('your_tickets')}
          {#each tickets as ticket}
            <li>
              {ticket.name} - {ticket.count}{_('piece_short')}. -
              <span class="blue">{ticket.count * ticket.price} {_('rub')}</span>
            </li>
          {/each}
        </ul>
      {/if}
      {#if additions.length}
        <ul>
          {_('additionally')}
          {#each additions as ticket}
            <li>
              {ticket.name} - {ticket.count}{_('piece_short')}. -
              <span class="blue">{ticket.count * ticket.price} {_('rub')}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    {#if !prev}
      {#if paid || !buyable.length}
        <p class="status-text">
          <span class="blue bold">{_('action_register_success')}</span>
          <br />
          {_('action_register_mail')}
        </p>
      {:else}
        <p class="status-text">
          <span class="bold blue">{_('action_confirm_pay_blue')}</span>
          <br />
          {_('action_confirm_pay')}
        </p>
        {#if !paid}
          <div class="buttons">
            <button class="blue-button cansel">
              {_('cansel_reservation')}
            </button>
            <button class="blue-button">{_('pay_ticket')}</button>
          </div>
        {/if}
      {/if}
    {:else}
      <p class="status-text red bold">{_('held_event')}</p>
    {/if}
  </div>
  {#if !paid && !prev}
    <div class="mobile-buttons">
      <button class="blue-button cansel">{_('cansel_reservation')}</button>
      <button class="blue-button">{_('pay_ticket')}</button>
    </div>
  {/if}
</div>
