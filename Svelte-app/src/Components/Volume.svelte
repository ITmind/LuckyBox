<script>
    export let volume = 0;
    export let min = 0;
    export let max = 100;
    export let step = 1;

    function volumeUp() {
        volume++;
        // console.log("volume " + volume);
        if (volume > 100) volume = 100;
    }

    function volumeDown() {
        volume--;
        if (volume < 0) volume = 0;
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

            volume = isadd ? volume + _step : volume - _step;
        }, time);
    }

    function mouseup(e) {
        clearInterval(timeout);
    }

    // function change(e) {
    //     console.log("change");
    //     if (volume > max) {
    //         volume = max;
    //     } else if (volume < min) {
    //         volume = min;
    //     }
    // }

    $: {
        if (volume > max) {
            volume = max;
        } else if (volume < min) {
            volume = min;
        }
    }
</script>

<div id="distillation_group_volume" class="row row-striped pb-10">
    <div class="col-xs-12 col-sm-4 text-middle text-center-xs text-strong">Громкость звукового сигнала</div>
    <div class="col-xs-6 col-sm-3">
        <div class="input-group input-group-sm number-group">
            <span class="input-group-btn minus">
                <button
                    type="button"
                    class="btn btn-danger btn-number noSwipe"
                    on:click={volumeDown}
                    on:mousedown|preventDefault={e => mousedown(false)}
                    on:mouseup|preventDefault={mouseup}>
                    <span class="glyphicon glyphicon-minus" />
                </button>
            </span>
            <input bind:value={volume} class="form-control input-number noSwipe" type="number" {min} {max} {step} size="3" />
            <span class="input-group-btn plus">
                <button
                    type="button"
                    class="btn btn-success btn-number noSwipe"
                    on:click={volumeUp}
                    on:mousedown|preventDefault={e => mousedown(true)}
                    on:mouseup|preventDefault={mouseup}>
                    <span class="glyphicon glyphicon-plus" />
                </button>
            </span>
        </div>
    </div>
    <div class="col-xs-6 col-sm-2 text-left">
        <button on:click={saveVolume} type="button" class="btn btn-success btn-sm noSwipe">Сохранить</button>
    </div>
</div>
