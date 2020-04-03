<script>
  import { parseDataToIds } from "/helpers/edit.js";
  import { slide } from "svelte/transition";

  export let _, subjects, fetcher;

  let page = 0,
    query = {
      filter: "",
      companions: null,
      subjects: null
    };

  $: {
    query.subjects = query.subjects === null ? [] : query.subjects;
  }

  $: {
    query.companions = query.companions === null ? [] : query.companions;
  }

  function showActions() {
    let URL = fetcher.makeQuery({ query });

    document.location.href = `/actions${URL}`;
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .quiz {
    margin: auto;
    width: 470px;
    margin-top: -60px;
    width: 1000px;
    background: white;
    box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
      inset 0px 0px 50px rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 80px 80px 40px;
    box-sizing: border-box;
    position: relative;
  }

  h3 {
    font-size: 28px;
    font-family: $Gilroy;
    text-align: center;
    margin-bottom: 40px;
    font-weight: normal;
  }

  .quiz-first-page,
  .quiz-second-page {
    display: grid;
    grid-template-columns: repeat(3, auto);
    justify-content: space-between;
    grid-row-gap: 20px;
    margin-top: 35px;

    & > button {
      padding: 140px 40px 40px;
      text-align: center;
      border: 1px solid $Light_Gray;
      border-radius: 10px;
      font-family: $Gilroy;
      background-position: center 50px;
      background-repeat: no-repeat;
      width: 250px;
      transition: 0.3s;
      font-size: 24px;
      position: relative;

      &.change {
        border-color: $Orange;
      }

      &.one {
        background-image: url(../img/boy.svg);
        background-size: 70px 53px;

        &.change {
          background-image: url(../img/boy-yellow.svg);
        }
      }

      &.child {
        background-image: url(../img/family.svg);
        background-size: 70px 64px;

        &.change {
          background-image: url(../img/family-yellow.svg);
        }
      }

      &.group {
        background-image: url(../img/team.svg);
        background-size: 70px 95px;

        &.change {
          background-image: url(../img/team-yellow.svg);
        }
      }

      &.gym {
        background-image: url(../img/gym.svg);
        background-size: 70px 87px;

        &.change {
          background-image: url(../img/gym-yellow.svg);
        }
      }

      &.forums {
        background-image: url(../img/chat.svg);
        background-size: 70px 77px;

        &.change {
          background-image: url(../img/chat-yellow.svg);
        }
      }

      &.exhibitions {
        background-image: url(../img/photo.svg);
        background-size: 70px 95px;

        &.change {
          background-image: url(../img/photo-yellow.svg);
        }
      }

      &.gastronomy {
        background-image: url(../img/sale.svg);
        background-size: 70px 95px;

        &.change {
          background-image: url(../img/sale-yellow.svg);
        }
      }

      &.city-life {
        background-image: url(../img/team.svg);
        background-size: 70px 95px;

        &.change {
          background-image: url(../img/team-yellow.svg);
        }
      }

      &.festivals {
        background-image: url(../img/concert.svg);
        background-size: 70px 95px;

        &.change {
          background-image: url(../img/concert-yellow.svg);
        }
      }

      & > div {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 25px;
        right: 30px;
        background: $Orange_Gradient;
        opacity: 0;
        transition: 0.3s;
        z-index: 1;
        border-radius: 100px;
        box-shadow: 0px 23px 70px rgba(77, 80, 98, 0.1),
          inset 0px 0px 50px rgba(255, 255, 255, 0.45);

        & > img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
        }

        &.change {
          opacity: 1;
        }
      }
    }
  }

  .visible {
    display: block !important;
  }

  .checked {
    background: $Gray;
  }

  .show-actions {
    padding: 5px 10px;
    background: $Dark_Gray;
    color: white;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100px;
    margin: 10px auto 0;
  }

  .back {
    position: absolute;
    top: 50%;
    left: 5px;
    transform: translateY(-50%);
    display: none;
  }

  .progress {
    width: 100%;
    height: 50px;
    position: relative;
    background: linear-gradient(180.76deg, #ffffff 24.24%, #efefef 90.54%);
    border-radius: 25px;
    overflow: hidden;

    & > .progress-line {
      position: absolute;
      z-index: 1;
      background: $Blue_Gradient;
      top: 0;
      left: 0;
      height: 100%;
      transition: 0.3s;
    }

    & > .progress-number {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: $Gilroy;
      font-size: 20px;
      z-index: 2;
    }
  }

  .buttons{
    display: flex;
    justify-content: center;
    margin-top: 35px;
    align-items: flex-start;
  }

  .next-page, .back-page {
    display: block;
    background: $Blue_Gradient;
    border-radius: 100px;
    width: 250px;
    padding: 15px 0;
    transition: 0.3s;
    overflow: hidden;

    & > img {
      margin-left: 15px;
      width: 20px;
      transform: rotate(180deg);
      height: 10px;
    }

    & > span {
      display: inline-block;
      margin-left: 35px;
      font-family: $Gilroy;
      font-size: $LowBig_Font_Size;
      color: white;
    }
  }

  .back-page{
    background: linear-gradient(182.67deg, #FFFFFF 24.24%, #EFEFEF 90.54%);
    width: 0;
    margin-left: 0;
    opacity: 0;

    & > img{
      margin-left: 0;
      margin-right: 15px;
      transform: rotate(0deg);
    }

    & > span{
      margin-left: 0;
      margin-right: 35px;
      color: black;
    }
  }

  .visible-back{
    width: 250px;
    margin-right: 20px;
    opacity: 1;
  }
</style>

<div class="quiz">
  <h3>
    {#if page === 0}{_('quiz_first')}{:else}{_('quiz_second')}{/if}
  </h3>
  <div class="progress">
    <div class="progress-number">{page + 1}/2</div>
    <div class="progress-line" style={`width: ${((page + 1) / 2) * 100}%`} />
  </div>
  <div>
    {#if page === 0}
      <div class="quiz-first-page" transition:slide>
        <button
          on:click={() => (query.companions = parseDataToIds(query.companions, 2))}
          class="one"
          class:change={query.companions.indexOf(2) !== -1}>
          <div class:change={query.companions.indexOf(2) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('one')}
        </button>
        <button
          on:click={() => (query.companions = parseDataToIds(query.companions, 3))}
          class="child"
          class:change={query.companions.indexOf(3) !== -1}>
          <div class:change={query.companions.indexOf(3) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('with_child')}
        </button>
        <button
          on:click={() => (query.companions = parseDataToIds(query.companions, 1))}
          class="group"
          class:change={query.companions.indexOf(1) !== -1}>
          <div class:change={query.companions.indexOf(1) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('group')}
        </button>
      </div>
    {:else if page === 1}
      <div class="quiz-second-page" transition:slide>
        <button
          on:click={() => (query.subjects = parseDataToIds(query.subjects, 1))}
          class="gym"
          class:change={query.subjects.indexOf(1) !== -1}>
          <div class:change={query.subjects.indexOf(1) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('sport')}
        </button>
        <button
          on:click={() => (query.subjects = parseDataToIds(query.subjects, 3))}
          class="forums"
          class:change={query.subjects.indexOf(3) !== -1}>
          <div class:change={query.subjects.indexOf(3) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('forums')}
        </button>
        <button
          on:click={() => (query.subjects = parseDataToIds(query.subjects, 5))}
          class="exhibitions"
          class:change={query.subjects.indexOf(5) !== -1}>
          <div class:change={query.subjects.indexOf(5) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('exhibitions')}
        </button>
        <button
          on:click={() => (query.subjects = parseDataToIds(query.subjects, 6))}
          class="gastronomy"
          class:change={query.subjects.indexOf(6) !== -1}>
          <div class:change={query.subjects.indexOf(6) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('gastronomy')}
        </button>
        <button
          on:click={() => (query.subjects = parseDataToIds(query.subjects, 4))}
          class="city-life"
          class:change={query.subjects.indexOf(4) !== -1}>
          <div class:change={query.subjects.indexOf(4) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('city_life')}
        </button>
        <button
          on:click={() => (query.subjects = parseDataToIds(query.subjects, 2))}
          class="festivals"
          class:change={query.subjects.indexOf(2) !== -1}>
          <div class:change={query.subjects.indexOf(2) !== -1}>
            <img src="/img/tick.svg" alt="tick" />
          </div>
          {_('festivals')}
        </button>
      </div>
    {/if}
    <div class="buttons">
      <button
        class="back-page"
        class:visible-back={page !== 0}
        on:click={() => (page = 0)} >
        <img src="/img/right-arrow-grey.svg" alt="next" />
        <span>{_("back")}</span>
      </button>
      <button
        class="next-page"
        on:click={() => {
          if (page === 0) page = 1;
          else showActions();
        }}>
        <span>
          {#if page === 0}{_('then')}{:else}{_('show')}{/if}
        </span>
        <img src="/img/right-arrow-grey.svg" alt="next" />
      </button>
    </div>
  </div>

</div>
