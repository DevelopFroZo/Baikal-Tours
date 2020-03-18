<script>
  import { parseDataToIds } from "/helpers/edit.js";

  export let _, subjects, fetcher;

  let page = 0, query = {
      filter: "",
      companions: null,
      subjects: null,
  }
    

  $:{
      query.subjects = query.subjects === null ? [] : query.subjects;
  } 

  function changeCompanions(id) {
    query.companions = id;
    page = 1;
  }

  function showActions(){
      let URL = fetcher.makeQuery({query});

      document.location.href = `/actions${URL}`;
  }
</script>

<style lang="scss">
  @import "./styles/global.scss";

  .quiz {
    margin: auto;
    width: 470px;
  }

  .quiz-interactive-block {
    height: 225px;
    background: $Light_Gray;
    padding: 30px;
    box-sizing: border-box;
    margin-top: 20px;
    position: relative;
  }

  h2 {
    text-align: center;
    font-size: 24px;
  }

  h3 {
    font-size: $Big_Font_Size;
    margin: 0;
  }

  .quiz-first-page {
    margin: 20px 30px;
    text-align: center;
    
    & > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 35px;

      & > button {
        text-align: center;

        & > img {
          margin-bottom: 10px;
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

  .quiz-second-page {
    text-align: center;

    & > .subjects-block{
        height: 125px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        align-items: center;

        & > button{
            display: block;
            margin-top: 5px;
            padding: 3px 6px;
            border-radius: 100px;
            font-size: $Medium_Font_Size;
            font-weight: bold;
        }
    }
  }

  .show-actions{
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

  .back{
      position: absolute;
      top: 50%;
      left: 5px;
      transform: translateY(-50%);
      display: none;
  }
</style>

<div class="quiz">
  <h2>{_("quiz_text")}</h2>
  <div class="quiz-interactive-block">
    <button class = "back" class:visible={page>0} on:click={() => page = page - 1}><img src="/img/back-black.png" alt="back"></button>
    {#if page === 0}
      <div class="quiz-first-page">
        <h3>{_("quiz_first")}</h3>
        <div>
          <button on:click={() => changeCompanions(2)}>
            <img src="/img/companions-one.png" alt="one" />
            <br />
            {_("one")}
          </button>
          <button on:click={() => changeCompanions(3)}>
            <img src="/img/companions-child.png" alt="child" />
            <br />
            {_("with_child")}
          </button>
          <button on:click={() => changeCompanions(1)}>
            <img src="/img/companions-group.png" alt="group" />
            <br />
            {_("group")}
          </button>
        </div>
      </div>
    {:else if page === 1}
      <div class="quiz-second-page">
        <h3>Какие события вам интересны?</h3>
        <div class="subjects-block">
          {#each subjects as subject}
            <button
              on:click={() => (query.subjects = parseDataToIds(query.subjects, subject.id))}
              class:checked={query.subjects.indexOf(subject.id) !== -1}>
              {subject.name}
            </button>
          {/each}
        </div>
        <button class="show-actions" on:click={showActions}>{_("show")}<img src="/img/next-white.png" alt="next"> </button>
      </div>
    {/if}
  </div>
</div>
