<style>
 
</style>

<script>
    import Delta from "./Delta.svelte";
    // import Textfield  from "./../../../node_modules/@smui/textfield/textfield.svelte";

    export let value = 0;
    export let current_value = 0;
</script>

<div>
    <div>Мощность тена</div>
        <span>{current_value}%</span>
    <div>
        <!-- <Textfield bind:value={value} label="Number" type="number" /> -->
        <Delta bind:value />
    </div>
</div>
