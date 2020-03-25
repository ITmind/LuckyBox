<script>
    import Delta from "./Delta.svelte";
    export let value_time = 0;
    export let value_temperature = 0;
    export let pause_name = "";
    export let pause_thead = "";
    export let id_step_bg = "";
    export let id_step_text = "";
    export let id_stop = "";
    export let checked_stop = "";
</script>

<div class="row row-striped">
    <div class="row-xs clearfix">{pause_thead}</div>
    <div id="{id_step_bg}" class="pt-10 pb-10 clearfix">
        <div id="{id_step_text}" class="col-xs-12 col-sm-3 text-center-xs text-middle text-strong">{pause_name}</div>
        <div class="col-xs-5 col-xs-offset-0 col-sm-3 col-sm-offset-0 col-centered">
            <Delta bind:value={value_time} />
        </div>
        <div class="col-xs-5 col-xs-offset-0 col-sm-3 col-sm-offset-0 col-centered">
            <Delta bind:value={value_temperature} />
        </div>
        <div class="col-xs-2 col-xs-offset-0 col-sm-3 col-sm-offset-0 text-center text-middle">
            <label class="checkbox-inline">
                <input class="noSwipe" {checked_stop} id="{id_stop}" type="checkbox" value="Y" />
            </label>
        </div>
    </div>
</div>
