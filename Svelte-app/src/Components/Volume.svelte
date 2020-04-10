<style>
    section {
        display: flex;
        flex-wrap: wrap;
    }

    section>:global(*){
        margin-right: 10px;
        align-self: center;
        align-content: center;
    }

</style>

<script>
    import Delta from "./Templ/Delta.svelte";
    import { Button } from "svelte-mui";

    export let volume = 0;

    function saveVolume() {}
</script>

<section>
    <div>Громкость звукового сигнала</div>

    <Delta bind:value={volume} />

    <Button on:click={saveVolume} unelevated=true color="primary">Сохранить</Button>

</section>
