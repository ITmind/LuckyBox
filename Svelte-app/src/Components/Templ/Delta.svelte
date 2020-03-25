<script>
    export let value = "";
    export let min = 0;
    export let max = 100;
    export let step = 1;

    function Plus() {
        value++;
        // console.log("volume " + volume);
        if (value > 100) value = 100;
    }

    function Minus() {
        value--;
        if (value < 0) value = 0;
    }

    function saveVolume() {}

    //Кнопки + и -
    let flagSendProcess = false;
    let flagButtonPress = false;
    let timeout = false;

    function mousedown(isadd) {
        flagButtonPress = true;

        let count_interval = 0;
        let time = 500;
        let _step = step;
        timeout = setInterval(function() {
            count_interval++;

            if (count_interval > 3) {
                time = time / 2;
                _step = _step * 2;
                count_interval = 0;
            }

            value = isadd ? value + _step : value - _step;
        }, time);
    }

    function mouseup(e) {
        clearInterval(timeout);
    }

    $: {
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
    }

</script>

<div class="input-group input-group-sm number-group">
    <span class="input-group-btn minus">
        <button
            type="button"
            class="btn btn-danger btn-number noSwipe"
            on:click="{e => value--}"
            on:mousedown|preventDefault={e => mousedown(false)}
            on:mouseup|preventDefault={mouseup}>
            <span class="glyphicon glyphicon-minus" />
        </button>
    </span>
    <input bind:value={value} class="form-control input-number noSwipe" type="number" {min} {max} {step} size="3" />
    <span class="input-group-btn plus">
        <button
            type="button"
            class="btn btn-success btn-number noSwipe"
            on:click="{e => value++}"
            on:mousedown|preventDefault={e => mousedown(true)}
            on:mouseup|preventDefault={mouseup}>
            <span class="glyphicon glyphicon-plus" />
        </button>
    </span>
</div>