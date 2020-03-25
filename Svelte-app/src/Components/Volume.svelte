<script>
    import Delta from "./Templ/Delta.svelte";
    export let volume = 0;

    function saveVolume() {}

</script>

<div id="distillation_group_volume" class="row row-striped pb-10">
    <div class="col-xs-12 col-sm-4 text-middle text-center-xs text-strong">Громкость звукового сигнала</div>
    <div class="col-xs-6 col-sm-3">
        <Delta bind:value={volume}/>
    </div>
    <div class="col-xs-6 col-sm-2 text-left">
        <button on:click={saveVolume} type="button" class="btn btn-success btn-sm noSwipe">Сохранить</button>
    </div>
</div>
