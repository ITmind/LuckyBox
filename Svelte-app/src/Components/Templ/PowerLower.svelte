<script>
    import Delta from "./Delta.svelte";
    export let value = 0;
</script>

<div class="row row-striped">
    <div class="pt-10 pb-10 clearfix">
        <div class="col-xs-12 col-sm-7 text-center-xs text-middle text-strong">Рабочая мощность после прогрева куба</div>
        <div class="col-xs-3 col-xs-offset-1 hidden-sm" />
        <div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-0 col-centered">
            <Delta bind:value />
        </div>
    </div>
</div>

