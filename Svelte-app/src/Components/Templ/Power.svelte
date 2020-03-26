<script>
    import Delta from "./Delta.svelte";
    // import Textfield  from "./../../../node_modules/@smui/textfield/textfield.svelte";

    export let value = 0;
    export let current_value = 0;
</script>

<style>
</style>



<div class="row row-striped">
    <div class="pt-10 pb-10 clearfix">
        <div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">Мощность тена</div>
        <div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong">
            <span>{current_value}</span>
            <span class="hidden">%</span>
        </div>
        <div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-0 col-centered">
            <!-- <Textfield bind:value={value} label="Number" type="number" /> -->
            <Delta bind:value />
        </div>
    </div>
</div>
