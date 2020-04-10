<style>
    section {
        display: grid;
        grid-template-columns: auto 1fr;
    }
</style>

<script>
    import DistSVG from "./DistSVG.svelte";
    import Volume from "./Volume.svelte";
    import Chart from "./Chart.svelte";
    import Power from "./Templ/Power.svelte";
    import PowerLower from "./Templ/PowerLower.svelte";
    import ModalYesNo from "./Templ/ModalYesNo.svelte";
    import ShowSensors from "./ShowSensors.svelte";
    import { Button } from "svelte-mui";
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
            //launchDistillation();
        } else {
            showModal = true;
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

<section>
    <DistSVG alco_val={$globalSensorsJson.cubeAlcohol} />

    <div>
        <div id="error_distillation" />

        <div>
            Текущая операция:
            {#if ($globalSensorsJson.process = undefined)}
                <span>{$globalSensorsJson.process.step}</span>
            {/if}
        </div>
        <div>
            Прошло времени:
            {#if ($globalSensorsJson.process = undefined)}
                <span>{secToTime(Number($globalSensorsJson.process.time))}</span>
            {/if}
        </div>

        <Power current_value={$globalSensorsJson.power} 
            bind:powerHigh={$globalSensorsJson.powerHigh}
            bind:powerLower={$globalSensorsJson.powerLower} />
        <ShowSensors />

        <Volume bind:volume={distillation_volume} />

        {#if isStart}
            <Button raised color="red" on:click={startStop} disabled>СТОП</Button>
        {:else}
            <Button raised color="primary" on:click={startStop}>СТАРТ</Button>
        {/if}

    </div>

    <Chart />
</section>
