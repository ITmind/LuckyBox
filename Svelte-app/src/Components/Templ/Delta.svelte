<style>
    /* div {
        display: grid;
        grid-template-columns: 30px 50px 30px;
    }
    div button:first-child{
        margin-left: -1px;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
    }
    div button:last-child{
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
    } */
</style>

<script>
    import { Button, Textfield  } from "svelte-mui";

    export let value = 0;
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let attrs = {};

    //прокидываем произвольные параметры в дочерний компонент
    $: {
		const {
			value,
			min,
			max,
			step,
			...other
		} = $$props;
		delete other.class;
		attrs = other;
	}
</script>

<section>
    <Textfield  type="number" {...attrs} bind:value {min} {max} {step}></Textfield >
</section>
