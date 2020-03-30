<style>
    section {
        margin-left: 20px;
        width: 768px;
    }
    p {
        text-align: center;
        font-weight: 700;
    }

    section > p {
        text-align: center;
        font-weight: 700;
        margin: 10px 0px;
    }
    section > div {
        display: grid;
        grid-template-columns: 40px 2fr 70px 100px 1fr 1fr 1fr;
    }

    section > div:first-of-type {
        border-bottom: 1px;
        border-bottom-style: solid;
        margin-bottom: 5px;
    }

    section > div > div:first-of-type {
        display: grid;
        grid-template-columns: 60px 1fr;
        padding: 0px 10px;
    }

    section > div {
        margin: 5px 0px;
    }

    section > div:hover {
        background-color: rgb(250, 250, 250);
    }

    div div button {
        border-radius: 0px;
        background: white;
    }
    input, select {
        background-color: transparent ;
        outline: none !important;
        border: none;
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-bottom-color: gray;
        justify-self: center;
    }

    input:focus {
        border-bottom-width: 2px;
        border-bottom-color: black;
    }
</style>

<script>
    import { startInterval, stopInterval, globalSensorsJson } from "./../process.js";
    import Picker from "vanilla-picker"; //npm install vanilla-picker --save
    import { onMount } from "svelte";
    let t_sensors = [1, 2, 3, 4, 5, 6, 7, 8];
    let devices = [1, 2, 3, 4];
    let safety = [1, 2, 3, 4];

    let thisElement;
    //инициируем кнопки выбора цвета
    onMount(() => {
        var color_buttons = thisElement.querySelectorAll("div div button");
        color_buttons.forEach(element => {
            var picker = new Picker(element);
            picker.onChange = function(color) {
                element.style.background = color.rgbaString;
            };
        });
    });
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section bind:this={thisElement}>

    <p>Датчики температуры</p>
    <div>
        <p>Цвет</p>
        <p>Название</p>
        <p>Сорт.</p>
        <p>Значение</p>
        <p>Дестиляция</p>
        <p>Ратификация</p>
        <p>Затирание</p>

    </div>
    {#each t_sensors as sensor, i}
        <div>

            <button />
            <input placeholder="t{i}" type="text" value={sensor.name ? sensor.name : ''} />

            <select id="sensor_number_t1">
                <option value="" />
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
            </select>

            <div>
                <span id="sensor_val_t1" />
                <span class="">&#176С</span>
            </div>

            <input type=checkbox>
            <input type=checkbox>
            <input type=checkbox>
        </div>
    {/each}

    <div>

        <button style="visibility: hidden;" />
        <input id="sensor_name_p1" type="text" readonly value="Атмосферное давление" />

        <div class="col-xs-2 col-sm-3" />
        <div class="col-xs-3 col-sm-3">
            <span id="sensor_val_p1" />
            <span class="hidden">мм рт.ст.</span>
        </div>
    </div>

    <p>Исполнительные устройства</p>

    {#each devices as device, i}
        <div>

            <button />
            <input placeholder="out{i}" id="device_name_out{i}" type="text" value="" />

        </div>
    {/each}

    <p>Датчики безопасности</p>

    {#each safety as saf, i}
        <div>
            <button />
            <input placeholder="in{i}" id="safety_name_in{i}" type="text" value="" />

        </div>
    {/each}

    <div>
        <button id="get_sensors" type="button" class="btn btn-primary btn-sm noSwipe mt-10">Опросить датчики</button>
        <button id="reset_sensors" type="button" class="btn btn-danger btn-sm noSwipe mt-10">Сбросить настройки</button>
        <button id="set_sensors" type="button" class="btn btn-success btn-sm noSwipe mt-10">Сохранить</button>
    </div>

</section>
