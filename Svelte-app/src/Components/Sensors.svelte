<style>

</style>

<script>
    import { startInterval, stopInterval, globalSensorsJson } from "./../process.js";
    import Picker from "vanilla-picker";
    let t_sensors = [1, 2, 3, 4, 5, 6, 7, 8];
    let devices = [1, 2, 3, 4];
    let safety = [1, 2, 3, 4];

    function openPicker(e) {
		console.log(e.target);
        var picker = new Picker(e.target);
        picker.onChange = function(color) {
            e.target.style.background = color.rgbaString;
        };
    }
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<div class="container tab-pane theme_grey swipe-tab-content active">

    <div class="row row-xs mt-10" id="sensors_settings">
        <div class="col-md-12 fill-height">
            <div class="row row-xs text-center text-strong">
                <p>Датчики температуры</p>
            </div>
            {#each t_sensors as sensor, i}
                <div class="form-group row row-xs">
                    <div class="col-xs-5 col-sm-5">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon" on:click={openPicker}>t{i}</span>
                            <input placeholder="Название" id="sensor_name_t{i}" type="text" value="" />
                        </div>
                    </div>
                    <div class="col-xs-2 col-sm-1">
                        <input type="hidden" id="sensor_color_t1" onchange="svgFillUpdate(this.value,'t1')" value="" />
                        <button class="btn btn-sm jscolor noSwipe" valueElement="null">Цвет</button>
                    </div>
                    <div class="col-xs-2 col-sm-3">
                        <select id="sensor_number_t1" class="form-control input-sm noSwipe">
                            <option value="">Сортировка</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>
                    </div>
                    <div class="col-xs-3 col-sm-3">
                        <span id="sensor_val_t1" />
                        <span class="">&#176С</span>
                    </div>
                </div>
            {/each}

            <div class="form-group row row-xs">
                <div class="col-xs-5 col-sm-5">
                    <div class="input-group input-group-sm">
                        <span class="input-group-addon">p1</span>
                        <input id="sensor_name_p1" class="form-control input-sm noSwipe" type="text" readonly value="Атмосферное давление" />
                    </div>
                </div>
                <div class="col-xs-2 col-sm-1">
                    <input type="hidden" id="sensor_color_p1" value="" />
                    <button class="btn btn-sm jscolor noSwipe">Цвет</button>
                </div>
                <div class="col-xs-2 col-sm-3" />
                <div class="col-xs-3 col-sm-3">
                    <span id="sensor_val_p1" />
                    <span class="hidden">мм рт.ст.</span>
                </div>
            </div>

            <div class="row row-xs text-center text-strong">
                <p>Исполнительные устройства</p>
            </div>
            {#each devices as device, i}
                <div class="form-group row row-xs">
                    <div class="col-xs-11 col-sm-5">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">out{i}</span>
                            <input placeholder="Название" id="device_name_out{i}" class="form-control input-sm noSwipe" type="text" value="" />
                        </div>
                    </div>
                    <div class="col-xs-1 col-sm-7" />
                </div>
            {/each}

            <div class="row row-xs text-center text-strong">
                <p>Датчики безопасности</p>
            </div>
            {#each safety as saf, i}
                <div class="form-group row row-xs">
                    <div class="col-xs-11 col-sm-5">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">in{i}</span>
                            <input placeholder="Название" id="safety_name_in{i}" class="form-control input-sm noSwipe" type="text" value="" />
                        </div>
                    </div>
                    <div class="col-xs-1 col-sm-7" />
                </div>
            {/each}

            <div class="form-group row row-xs" id="sensors_group_button">
                <div class="col-xs-12">
                    <button id="get_sensors" type="button" class="btn btn-primary btn-sm noSwipe mt-10">Опросить датчики</button>
                    <button id="reset_sensors" type="button" class="btn btn-danger btn-sm noSwipe mt-10">Сбросить настройки</button>
                    <button id="set_sensors" type="button" class="btn btn-success btn-sm noSwipe mt-10">Сохранить</button>
                </div>
            </div>
        </div>
    </div>
</div>
