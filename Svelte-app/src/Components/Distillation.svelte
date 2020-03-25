<style>

</style>

<script>
    import DistSVG from "./DistSVG.svelte";
    import Volume from "./Volume.svelte";
    import Power from "./Templ/Power.svelte";
    import PowerLower from "./Templ/PowerLower.svelte";
    import ModalYesNo from "./Templ/ModalYesNo.svelte";
    import ShowSensors from "./ShowSensors.svelte";
    import { sendRequest, objIsEmpty, secToTime } from "./../utils.js";
    import { startInterval, stopInterval, globalSensorsJson } from "./../process.js";

    let distillation_volume = 0;
    let isStart = false;
    let error = "";
    let showModal = false;

    //Привязка датчиков к процессу дистилляции, и запуск
    let distillationProcess = {
        sensors: [],
        powerHigh: 0,
        powerLower: 0,
        start: false,
        transitionTemperature: 0
    };

    function startStop() {
        if (isStart) {
            //open dialog
            launchDistillation();
        } else {
            //open dialog Вы действительно хотите остановить процесс дистилляции?
        }
    }

    function read() {
        //читаем сохраненные настройки из МК
        sendRequest("distillationSensorsGetTpl", {}, parseTpl, error);
        function parseTpl(msg) {
            distillationProcess.sensors = msg;
            distillationProcess.powerHigh = Number(msg.powerHigh);
            distillationProcess.powerLower = Number(msg.powerLower);
        }
    }
    function add_sensor() {
        sendRequest("distillationSensorsSetLoad", {}, selectSensorsDistillation, error);
    }

    //Запрос датчиков для дистилляции и вывод их в диалоговое окно
    function selectSensorsDistillation(data) {
        //SelectSensor.svelte
    }

    function launchDistillation() {
        isStart = true;
        stopInterval();
        setTimeout(function() {
            setDistillation();
        }, 1000);
    }

    function stopDistillation() {
        isStart = false;
        stopInterval();
        $globalSensorsJson.process.allow = 0;
        setDistillation();
    }

    //Установка значений для дистилляции
    //каждую секунду смотрим есть ли изменения и записываем их в EEPROM
    function setDistillation() {
        //запустим только когда будут сенсоры
        if (objIsEmpty(distillationProcess.sensors, false)) {
            setTimeout(function() {
                setDistillation();
            }, 1000);
        } else {
            let distillationSendData = {
                t_sensors: [
                    { key: "t1", allertValue: 0 },
                    { key: "t2", allertValue: 0 },
                    { key: "t3", allertValue: 0 },
                    { key: "t4", allertValue: 0 },
                    { key: "t5", allertValue: 0 },
                    { key: "t6", allertValue: 0 },
                    { key: "t7", allertValue: 0 },
                    { key: "t8", allertValue: 0 }
                ],
                process: { allow: 0, number: 0 },
                powerHigh: 0,
                powerLower: 0
            };

            distillationSendData.process.allow = isStart ? 1 : 0;
            if (distillationProcess.powerHigh !== distillation_power_set) {
                flagSendProcess = true;
            }
            if (distillationProcess.powerLower !== distillation_power_lower_set) {
                flagSendProcess = true;
            }
            distillationSendData.powerHigh = distillationProcess.powerHigh = distillation_power_set;
            distillationSendData.powerLower = distillationProcess.powerLower = distillation_power_lower_set;

            distillationProcess.sensors.forEach(function(item, i, arr) {
                if (arr[i].allertValue !== distillation_cutoff[i]) {
                    flagSendProcess = true;
                }
                distillationSendData[i].allertValue = arr[i].allertValue = distillation_cutoff[i];
            });

            if (flagSendProcess) {
                flagSendProcess = false;
                stopInterval();
                sendRequest("SensorsIn", distillationSendData, startDistillation, error);
            }
        }
    }

    function startDistillation() {
        //просто перезапуск глобального опроса датчиков?
        console.log("startDistillation");
        setTimeout(function() {
            stopInterval();
            startInterval();
        }, 2000);
    }
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->

{#if showModal}
    <ModalYesNo on:close={() => (showModal = false)} on:onOkey={launchDistillation}>
        <p class="text-center text-danger text-strong" slot="header">
            Будет запущен процесс дистилляции, убедитесь в том, что в тэн залит жидкостью!
        </p>
    </ModalYesNo>
{/if}

<div class="container tab-pane theme_grey swipe-tab-content active">
    <div class="row">
        <div id="error_distillation" class="col-md-offset-2 col-md-8" />
    </div>
    <div class="row">
        <div class="col-md-12 fill-height">
            <div class="row mt-10">
                <div class="col-xs-offset-3 col-xs-6 col-sm-3 col-sm-offset-0 svg-container">
                    <DistSVG alco_val={$globalSensorsJson.cubeAlcohol} />
                </div>
                <div class="col-xs-12 col-sm-9">

                    <div class="row row-striped">
                        <div class="col-xs-12 col-md-6 text-center-xs text-middle text-strong">
                            Текущая операция:
                            {#if $globalSensorsJson.process=undefined}
                            <span class="text-primary">{$globalSensorsJson.process.step}</span>
                            {/if}
                        </div>
                        <div id="distillation_time" class="col-xs-12 col-md-6 text-center-xs text-middle text-strong">
                            Прошло времени:
                            {#if $globalSensorsJson.process=undefined}
                            <span class="text-primary">{secToTime(Number($globalSensorsJson.process.time))}</span>
                            {/if}
                        </div>

                        <Power current_value={$globalSensorsJson.power} bind:value={$globalSensorsJson.powerHigh} />
                        <PowerLower bind:value={$globalSensorsJson.powerLower} />
                        <ShowSensors />
                    </div>
                    <div class="form-group pt-10 clearfix">
                        <button id="distillation_add_sensor" type="button" class="btn btn-primary btn-sm noSwipe" on:click={add_sensor}>
                            Добавить датчики для процесса
                        </button>
                    </div>

                    <Volume bind:volume={distillation_volume} />

                    <div class="form-group pt-10 pb-10 clearfix" id="distillation_start_group_button">
                        <button on:click={startStop} type="button" class="btn btn-danger btn-sm pull-left noSwipe" class:hide={!isStart}>СТОП</button>
                        <button on:click={startStop} type="button" class="btn btn-success btn-sm noSwipe" class:hide={isStart}>СТАРТ</button>
                    </div>
                </div>

                <div class="col-xs-12">
                    <div class="bg-info noSwipe" id="view_distillation_chart" />
                </div>
            </div>
        </div>
    </div>
</div>
