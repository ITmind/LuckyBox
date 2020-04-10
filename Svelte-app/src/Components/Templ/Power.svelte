<style>
    section{
        display: flex;
    }

    section>:global(*){
        flex: auto;
        align-self: center;
        margin-right: 30px;
    }
</style>

<script>
    import Delta from "./Delta.svelte";
    // import Textfield  from "./../../../node_modules/@smui/textfield/textfield.svelte";

    export let powerHigh = 0;
    export let powerLower = 0;
    export let current_value = 0;
</script>

<section>
    <div>Мощность тена</div>
    <span>{current_value==undefined?0:current_value}%</span>

    <Delta bind:value = {powerHigh} label="Требуемая мощность"/>
    <Delta bind:value = {powerLower} label="После прогрева"/>
</section>
