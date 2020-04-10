<style>
    .row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }
</style>

<script>
    import Power from "./Templ/Power.svelte";
    import PowerLower from "./Templ/PowerLower.svelte";
    import Delta from "./Templ/Delta.svelte";
    import { sendRequest } from "./../utils.js";
    import { globalSensorsJson } from "./../process.js";

    let distillation_power_value = 0;
    let distillation_power_set = 0;
    let distillation_power_lower_set = 0;

    let sensor_key = "t1";
    let name = "t1 temper";
    let t1value = 0;
    let error = "";

    // let color_value = q["color"];
    // let fillcolor = "#" + dec2hex(color_value);

    // $("#svg_distillation_color_" + sensor_key).css("fill", colorPersent(fillcolor, sensor_value, alert_value));
    //svg
    // if (sensor_value < 150) {
    //     $("#svg_distillation_" + sensor_key).text(sensor_value.toFixed(1) + "°С");
    // } else {
    //     $("#svg_distillation_" + sensor_key).text("");
    // }
    let sensorsDistillationSend = {
        t1: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t2: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t3: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t4: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t5: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t6: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t7: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        t8: { name: "", cutoff: 0, color: 0, member: 0, priority: 0, allertValue: 0 },
        out1: { name: "", member: 0 },
        out2: { name: "", member: 0 },
        out3: { name: "", member: 0 },
        out4: { name: "", member: 0 },
        out5: { name: "", member: 0 },
        out6: { name: "", member: 0 },
        out7: { name: "", member: 0 },
        out8: { name: "", member: 0 },
        in1: { name: "", member: 0 },
        in2: { name: "", member: 0 },
        in3: { name: "", member: 0 },
        in4: { name: "", member: 0 },
        transitionTemperature: 0
    };

    function save() {
        sendRequest("distillationSensorsSetSave", sensorsDistillationSend, false, error);
    }

    //если старт скрываем кнопку добавления сенсоров
</script>

<div class="row">
    <div style="grid-column:2;">Значение</div>
    <div >Отсечка</div>
</div>

<!-- tpl_cutoff_body -->
{#if $globalSensorsJson.sensors != undefined}
    {#each $globalSensorsJson.sensors as item (item.key)}
        <div class="row">

            <div class:text-danger={item.alert_value > 0 && item.sensor_value >= item.alert_value}>t&#176 {name}</div>
            <div>
                <span>{item.value}</span>
                <span>&#176С</span>
            </div>
            <div>
                <Delta bind:value={item.distillation_cutoff} min={0} max={105} step={0.5} />
            </div>

        </div>
    {:else}
        <div>нет датчиков температуры</div>
    {/each}
{:else}
    <div>нет датчиков температуры</div>
{/if}

<!-- tpl_all_body -->
<!-- <div class="row row-striped">
    <div class="pt-10 pb-10 clearfix">
        <div class="col-xs-12 col-sm-4 text-center-xs text-strong">t&#176 {name}</div>
        <div class="col-xs-4 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong">
            <span id="distillation_{sensor_key}" class:hidden={e[sensor_key]['allert']} />
            <span class="hidden">&#176С</span>
        </div>
        <div class="col-xs-3 col-sm-3" />
        <div class="col-xs-3 col-sm-3" />
    </div>
</div> -->

{#if $globalSensorsJson.devices != undefined}
    {#each $globalSensorsJson.devices as item (item.key)}
        <div class="row row-striped">
            <div class="pt-10 pb-10 clearfix">
                <div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">{item.name}</div>
                <div class="col-xs-5 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-strong">
                    <span class="box-green" class:hidden={item.allertValue > 0}>
                        <span class="glyphicon">✔</span>
                    </span>
                </div>
            </div>
        </div>
    {:else}
        <div class="row row-striped">нет исполнительных устройств</div>
    {/each}
{:else}
    <div class="row row-striped">нет исполнительных устройств</div>
{/if}

{#if $globalSensorsJson.safety != undefined}
    {#each $globalSensorsJson.safety as item (item.key)}
        <div class="row row-striped">
            <div class="pt-10 pb-10 clearfix" class:bg-danger={item.allertValue > 0}>
                <div class="col-xs-12 col-sm-4 text-center-xs text-strong" class:text-danger={item.allertValue > 0}>{item.name}</div>
                <div class="col-xs-5 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong">
                    <span>{item.value}</span>
                </div>
            </div>
        </div>
    {:else}
        <div class="row row-striped">нет устройств безопасности</div>
    {/each}
{:else}
    <div class="row row-striped">нет устройств безопасности</div>
{/if}
