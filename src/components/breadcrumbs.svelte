<script>
    export let path, white = false;
</script>

<style lang="scss">
    @import "./styles/global";

    .breadcrumbs{
        margin-top: 10px;
        padding: 5px 0;
        font-size: $LowMedium_Font_Size;
    }
    
    .next-crumb{
        margin: 0 5px;
    }

    .white{

        & > *{
          color: white;  
        }
        
    }
</style>

<div class = "breadcrumbs form-width" class:white={white}>
    {#each path as crumb, i}
            <a href={crumb.url} class = "crumb">{crumb.name}</a>
        {#if i < path.length - 1}
            <span class = "next-crumb">→</span>
        {/if}
    {/each}
</div>