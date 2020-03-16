<script>
  import Action from "/components/profile_event_card.svelte";

  export let userSubscribeds, _;

  console.log(userSubscribeds)

  let section = "next";

  let secondActions = [],
    oldActions = [];

  for (let action of userSubscribeds)
    if (
      action.date_ends !== null &&
      new Date(action.date_ends).getTime() <= new Date()
    )
      oldActions.push(action);
    else secondActions.push(action);

  function setSection(sectionType) {
    section = sectionType;
  }
</script>

<style lang="scss">
  @import "./styles/profile.scss";

  .action-type-block {
    border: none;
    justify-content: space-around;
    padding: 15px 0 0 0;
  }

  .not-found{
      margin-top: 40px;
      text-align: center;
  }
</style>

<div>
  <div class="action-type-block">
    <button
      class:active={section === 'next'}
      on:click={() => setSection('next')}
      disabled={section === 'next'}>
      Будущие события
    </button>
    <button
      class:active={section === 'prev'}
      on:click={() => setSection('prev')}
      disabled={section === 'prev'}>
      Прошедшие события
    </button>
  </div>
  {#if section === 'next'}
    {#if secondActions.length !== 0}
      {#each secondActions as action}
        <Action {...action} {_} />
      {/each}
    {:else}
      <h2 class="not-found">Будущие события не найдены</h2>
    {/if}
  {:else if section === 'prev'}
    {#if oldActions.length !== 0}
      {#each oldActions as action}
        <Action {...action} {_} />
      {/each}
    {:else}
      <h2 class="not-found">Прошедшие события не найдены</h2>
    {/if}
  {/if}
</div>
