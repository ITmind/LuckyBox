//Список алгоритмов ректификации
let algorithmReflux = [
    { "value": 0, "text": "Ручной режим, только сигнализация" },
    { "value": 1, "text": "Прима отбор по пару (головная фракция по жидкости)" },
    { "value": 2, "text": "Отбор по пару" },
    { "value": 3, "text": "РК отбор по жидкости (1 клапан на отбор)" },
    { "value": 4, "text": "РК отбор по жидкости (2 клапана на отбор)" },
    { "value": 5, "text": "Бражная колонна, регулировка отбора охлаждением" },
    { "value": 6, "text": "Бражная колонна, головная фракция по жидкости" }
    // {"value":3,"text":"РК по жидкости 1 клапан (головы - импульсы, тело - дельта)"},
    // {"value":4,"text":"РК по жидкости 2 клапана (головы - импульсы, тело - дельта)"},
    // {"value":5,"text":"РК по жидкости 2 клапана (головы - открыт, тело - дельта)"},
    // {"value":6,"text":"Бражная колонна, регулировка отбора охлаждением"},
    // {"value":7,"text":"Бражная колонна, регулировка отбора мощностью"}
];

function refluxPageLoadComplite() {
    setTimeout(function () {
        pasteRefluxSensors(false);
    }, 1000);
}

function pasteRefluxSensors(sensors_select) {
    if (objIsEmpty(globalSensorsJson, false) && countError < 10) {
        setTimeout(function () {
            pasteRefluxSensors(false);
        }, 1000);
    }
    let sensorsRefluxSend = {
        "t1": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t2": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t3": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t4": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t5": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t6": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t7": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "t8": { "name": "", "delta": 0, "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
        "out1": { "name": "", "member": 0 },
        "out2": { "name": "", "member": 0 },
        "out3": { "name": "", "member": 0 },
        "out4": { "name": "", "member": 0 },
        "out5": { "name": "", "member": 0 },
        "out6": { "name": "", "member": 0 },
        "out7": { "name": "", "member": 0 },
        "out8": { "name": "", "member": 0 },
        "in1": { "name": "", "member": 0 },
        "in2": { "name": "", "member": 0 },
        "in3": { "name": "", "member": 0 },
        "in4": { "name": "", "member": 0 },
        "stab": 0,
        "point": 0,
        "transitionTemperature": 0,
        "tapCorrection": 0
    };
    let refluxTemplate = '';
    let tpl_devices_body = '';
    let tpl_safety_body = '';
    let tpl_stab = '';
    if (!sensors_select && objIsEmpty(refluxProcess["sensors"], false)) {
        console.log('ajax refluxSensorsGetTpl');
        $.ajax({
            url: ajax_url_debug + 'refluxSensorsGetTpl',
            data: {},
            type: 'GET',
            dataType: 'json',
            success: function (msg) {
                refluxProcess["sensors"] = msg;
                refluxProcess["stab"] = Number(msg["stab"]);
                refluxProcess["point"] = Number(msg["point"]);
                refluxProcess["number"] = Number(msg["number"]);
                refluxProcess["powerHigh"] = Number(msg["powerHigh"]);
                refluxProcess["powerLower"] = Number(msg["powerLower"]);
                if (!objIsEmpty(refluxProcess["sensors"], false)) {
                    pasteRefluxSensors(false);
                }
            },
            error: function (err, exception) {
                alertAjaxError(err, exception, $("#error_reflux"));
            }
        });
    }
    let flagout = false;
    if (!objIsEmpty(refluxProcess["sensors"], false)) {
        let tpl_delta_thead =
            '<div class="row-xs clearfix">' +
            '<div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-4 text-center text-middle text-primary">Значение</div>' +
            '<div class="col-xs-4 col-sm-3 text-center text-middle text-primary">Дельта</div>' +
            '<div class="col-xs-4 col-sm-2 text-center text-middle text-primary">Уставка</div>' +
            '</div>';
        let tpl_delta_body = '';
        let tpl_cutoff_thead =
            '<div class="row-xs clearfix">' +
            '<div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-4 text-center text-middle text-primary">Значение</div>' +
            '<div class="col-xs-4 col-xs-offset-3 col-sm-3 col-sm-offset-2 text-center text-middle text-primary">Отсечка</div>' +
            '</div>';
        let tpl_cutoff_body = '';
        let tpl_all_body = '';

        tpl_stab = '<div class="row row-striped">' +
            '<div class="pt-10 clearfix">' +
            '<div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">Время стабилизации колонны</div>' +
            '<div class="col-xs-12 col-sm-3 text-center text-middle text-strong"><span id="reflux_stab"></span>' +
            refluxProcess["stab"] +
            ' <span>мин.</span></div></div>' +
            '<div class="pt-10 clearfix">' +
            '<div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">Время до применения уставки</div>' +
            '<div class="col-xs-12 col-sm-3 text-center text-middle text-strong pb-10"><span id="reflux_point"></span>' +
            refluxProcess["point"] +
            ' <span>мин.</span></div></div></div>';

        sensorsRefluxSend["stab"] = refluxProcess["stab"];
        sensorsRefluxSend["point"] = refluxProcess["point"];
        sensorsRefluxSend["transitionTemperature"] = refluxProcess["transitionTemperature"];
        sensorsRefluxSend["tapCorrection"] = refluxProcess["tapCorrection"];

        $.each(refluxProcess["sensors"], function (i, e) {
            let sensor_key = i;
            if (e.hasOwnProperty("name") && sensorsRefluxSend[sensor_key].hasOwnProperty("name")) {
                sensorsRefluxSend[sensor_key]["name"] = e["name"];
            }
            if (re_t.test(sensor_key) && Number(e["member"]) !== 0) {
                sensorsRefluxSend[sensor_key]["color"] = e["color"];
                sensorsRefluxSend[sensor_key]["member"] = 1;
                let tpl_delta = '';
                let tpl_delta_result = '';
                if (e["delta"]) {
                    sensorsRefluxSend[sensor_key]["delta"] = 1;
                    tpl_delta = returnTplHtml([{ id: "reflux_delta_" + sensor_key, value: e["allertValue"], min: '0', max: '1', step: '0.05' }], deltaTempl);
                    tpl_delta_result = '<span id="reflux_delta_result_' + sensor_key + '"></span><span class="hidden">&#176С</span>';
                    tpl_delta_body +=
                        '<div class="row row-striped">' + tpl_delta_thead +
                        '<div id="reflux_alert_bg_' + sensor_key + '" class="pt-10 pb-10 clearfix">' +
                        '<div id="reflux_alert_text_' + sensor_key + '" class="col-xs-12 col-sm-4 text-middle text-center-xs text-strong">t&#176' + e["name"] + '</div>' +
                        '<div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong text-nowrap">' +
                        '<span id="reflux_' + sensor_key + '"></span><span class="hidden">&#176С</span></div>' +
                        '<div class="col-xs-4 col-sm-3">' + tpl_delta + '</div>' +
                        '<div class="col-xs-4 col-xs-offset-0 col-sm-2 col-sm-offset-0 text-center text-middle text-strong text-nowrap">' + tpl_delta_result +
                        '</div>' +
                        '</div>' +
                        '</div>';

                    tpl_delta_thead = '';
                }
                let tpl_cutoff = '';
                if (e["cutoff"]) {
                    sensorsRefluxSend[sensor_key]["cutoff"] = 1;
                    tpl_cutoff = returnTplHtml([{ id: "reflux_cutoff_" + sensor_key, value: e["allertValue"], min: '0', max: '105', step: '0.5' }], deltaTempl);
                    tpl_cutoff_body +=
                        '<div class="row row-striped">' + tpl_cutoff_thead +
                        '<div id="reflux_alert_bg_' + sensor_key + '" class="pt-10 pb-10 clearfix">' +
                        '<div id="reflux_alert_text_' + sensor_key + '" class="col-xs-12 col-sm-4 text-middle text-center-xs text-strong">t&#176' + e["name"] + '</div>' +
                        '<div class="col-xs-4 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="reflux_' + sensor_key + '"></span><span' +
                        ' class="hidden">&#176С</span></div>' +
                        //'<div class="col-xs-3 col-sm-3"></div>' +
                        '<div class="col-xs-4 col-xs-offset-1 col-sm-3 col-sm-offset-2">' + tpl_cutoff +
                        '</div>' +
                        '</div>' +
                        '</div>';

                    tpl_cutoff_thead = '';
                }
                if (!e["delta"] && !e["cutoff"]) {
                    tpl_all_body += '<div class="row row-striped">' +
                        '<div class="pt-10 pb-10 clearfix">' +
                        '<div class="col-xs-12 col-sm-4 text-center-xs text-strong">t&#176' + e["name"] + '</div>' +
                        '<div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="reflux_' + sensor_key + '"></span><span class="hidden">&#176С</span></div>' +
                        '<div class="col-xs-3 col-sm-3"></div>' +
                        '<div class="col-xs-4 col-sm-3"></div>' +
                        '</div>' +
                        '</div>';
                }
            }
            if (re_out.test(sensor_key) && Number(e["member"]) !== 0) {
                sensorsRefluxSend[sensor_key]["member"] = 1;
                //console.log(sensor_key);
                if (sensor_key === "out1" || sensor_key === "out2") {
                    flagout = true;
                } else {
                    tpl_devices_body += '<div class="row row-striped">' +
                        '<div class="pt-10 pb-10 clearfix">' +
                        '<div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">' + e["name"] + '</div>' +
                        '<div class="col-xs-5 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-strong">' +
                        '<span id="reflux_' + sensor_key + '" class="box-green hidden"><span class="glyphicon">✔</span></span></div>' +
                        '</div></div>';
                }
            }
            if (re_in.test(sensor_key) && Number(e["member"]) !== 0) {
                sensorsRefluxSend[sensor_key]["member"] = 1;
                tpl_safety_body += '<div class="row row-striped">' +
                    '<div id="reflux_alert_bg_' + sensor_key + '" class="pt-10 pb-10 clearfix">' +
                    '<div id="reflux_alert_text_' + sensor_key + '" class="col-xs-12 col-sm-4 text-center-xs text-strong">' + e["name"] + '</div>' +
                    '<div class="col-xs-5 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="reflux_' + sensor_key + '"></span> <span class="hidden"></span></div>' +
                    '</div></div>';
            }
        });
        if (tpl_delta_body !== '') {
            refluxTemplate += tpl_delta_thead + tpl_delta_body;
        }
        if (tpl_cutoff_body !== '') {
            refluxTemplate += tpl_cutoff_thead + tpl_cutoff_body;
        }
        if (tpl_all_body !== '') {
            refluxTemplate += tpl_all_body;
        }
    }
    if (refluxTemplate !== '') {
        if (sensors_select) {
            sendRequest("refluxSensorsSetSave", sensorsRefluxSend, "json", false, false, $("#error_reflux"), false);
        }
        let timeStepTemplate = '<div class="row row-striped">' +
            '<div id="reflux_step" class="col-xs-12 col-md-6 text-center-xs text-middle text-strong hidden"></div>' +
            '<div id="reflux_time" class="col-xs-12 col-md-6 text-center-xs text-middle text-strong hidden"></div>' +
            '</div>';
        let head_devices = '<div class="row-xs clearfix">' +
            '<div class="col-xs-4 col-xs-offset-0 col-sm-3 col-sm-offset-3 text-center text-middle text-primary text-nowrap">Период сек.</div>' +
            '<div class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap">Открыт %</div>' +
            '<div id="reflux_devices_out_header_" class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap">%&#8595;</div></div>';
        let head_devices_prima = '<div class="row-xs clearfix">' +
            '<div class="col-xs-4 col-xs-offset-0 col-sm-3 col-sm-offset-3 text-center text-middle text-primary text-nowrap">Период сек.</div>' +
            '<div class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap">Открыт %</div>' +
            '<div id="reflux_devices_out_header_" class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap"></div></div>';
        let head_devices_steam = '<div class="row-xs clearfix">' +
            '<div class="col-xs-4 col-xs-offset-0 col-sm-3 col-sm-offset-3 text-center text-middle text-primary text-nowrap"></div>' +
            '<div class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap">Открыт %</div>' +
            '<div id="reflux_devices_out_header_" class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap"></div></div>';
        let body_devices = '<div class="row-xs clearfix">' +
            '<div class="col-xs-4 col-xs-offset-0 col-sm-3 col-sm-offset-3 text-center text-middle text-primary text-nowrap">В начале %</div>' +
            '<div class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap">В конце %</div>' +
            '<div id="reflux_devices_out_header_" class="col-xs-4 col-sm-3 text-center text-middle text-primary text-nowrap">%&#8595;</div></div>';
        let tpl_devices_out_body = '';
        if (flagout) {
            let valwe_head = {};
            let valwe_headSteam = {};
            let valwe_body = {};
            let valwe_bodyPrima = {};
            if (globalSensorsJson.hasOwnProperty("valwe")) {
                $.each(globalSensorsJson["valwe"], function (i, e) {
                    // console.log(i,e);
                    let valwe_key = Object.keys(e).shift();
                    switch (valwe_key) {
                        case "head":
                            valwe_head = e;
                            break;
                        case "headSteam":
                            valwe_headSteam = e;
                            break;
                        case "body":
                            valwe_body = e;
                            break;
                        case "bodyPrima":
                            valwe_bodyPrima = e;
                            break;
                    }
                })
            }


            let visible_reflux_out = ((refluxProcess["number"] === 1 || refluxProcess["number"] === 2 || refluxProcess["number"] === 3) ? "" : " hidden");
            //головы жижа
            let val_head_cycle_rk = (valwe_head.hasOwnProperty("head") ? valwe_head["head"]["timeCycle"] : 5);
            let tpl_head_cycle_rk = returnTplHtml([{ id: "reflux_head_cycle_rk", value: val_head_cycle_rk, min: '5', max: '30', step: '1' }], deltaTempl);
            let val_head_time_rk = (valwe_head.hasOwnProperty("head") ? valwe_head["head"]["timeOn"] : 1);
            let tpl_head_time_rk = returnTplHtml([{ id: "reflux_head_time_rk", value: val_head_time_rk, min: '1', max: '100', step: '0.5' }], deltaTempl);
            //головы пар
            let val_head_steam = (valwe_headSteam.hasOwnProperty("headSteam") ? valwe_headSteam["headSteam"]["percent"] : 0);
            let tpl_head_steam = returnTplHtml([{ id: "reflux_head_steam", value: val_head_steam, min: '0', max: '100', step: '0.5' }], deltaTempl);
            //головы прима (как у жижи, те же данные)
            let val_head_cycle_prima = (valwe_head.hasOwnProperty("head") ? valwe_head["head"]["timeCycle"] : 5);
            let tpl_head_cycle_prima = returnTplHtml([{ id: "reflux_head_cycle_prima", value: val_head_cycle_prima, min: '5', max: '30', step: '1' }], deltaTempl);
            let val_head_time_prima = (valwe_head.hasOwnProperty("head") ? valwe_head["head"]["timeOn"] : 1);
            let tpl_head_time_prima = returnTplHtml([{ id: "reflux_head_time_prima", value: val_head_time_prima, min: '1', max: '100', step: '0.5' }], deltaTempl);

            tpl_devices_out_body += '<div id="reflux_devices_out" class="row' + visible_reflux_out + '">' +
                '<div class="col-xs-12">';
            //тпл головы жижа
            tpl_devices_out_body +=
                '<div id="reflux_devices_head_rk" class="row row-striped">' +
                head_devices +
                '<div class="pt-10 pb-10 clearfix">' +
                '<div class="col-xs-12 col-sm-3 text-middle text-center-xs text-strong">Клапан отбора голов</div>' +
                '<div class="col-xs-4 col-sm-3">' + tpl_head_cycle_rk + '</div>' +
                '<div class="col-xs-4 col-sm-3">' + tpl_head_time_rk + '</div>' +
                '</div></div>';
            //тпл головы пар
            tpl_devices_out_body +=
                '<div id="reflux_devices_head_steam" class="row row-striped">' +
                head_devices_steam +
                '<div class="pt-10 pb-10 clearfix">' +
                '<div class="col-xs-12 col-sm-3 text-middle text-center-xs text-strong">Кран отбора голов</div>' +
                '<div class="col-xs-4 col-sm-3"></div>' +
                '<div class="col-xs-4 col-sm-3">' + tpl_head_steam + '</div>' +
                '</div></div>';
            //тпл головы прима
            tpl_devices_out_body +=
                '<div id="reflux_devices_head_prima" class="row row-striped">' +
                head_devices_prima +
                '<div class="pt-10 pb-10 clearfix">' +
                '<div class="col-xs-12 col-sm-3 text-middle text-center-xs text-strong">Клапан отбора голов</div>' +
                '<div class="col-xs-4 col-sm-3">' + tpl_head_cycle_prima + '</div>' +
                '<div class="col-xs-4 col-sm-3">' + tpl_head_time_prima + '</div>' +
                '</div></div>';

            //тело жижа
            let val_body_cycle_rk = (valwe_body.hasOwnProperty("body") ? valwe_body["body"]["timeCycle"] : 5);
            let tpl_body_cycle_rk = returnTplHtml([{ id: "reflux_body_cycle_rk", value: val_body_cycle_rk, min: '5', max: '30', step: '1' }], deltaTempl);
            let val_body_time_rk = (valwe_body.hasOwnProperty("body") ? valwe_body["body"]["timeOn"] : 0);
            let tpl_body_time_rk = returnTplHtml([{ id: "reflux_body_time_rk", value: val_body_time_rk, min: '0', max: '100', step: '0.5' }], deltaTempl);
            let val_body_decline_rk = (valwe_body.hasOwnProperty("body") ? valwe_body["body"]["decline"] : 0);
            let tpl_body_decline_rk = returnTplHtml([{ id: "reflux_body_decline_rk", value: val_body_decline_rk, min: '0', max: '30', step: '1' }], deltaTempl);
            //тело пар (как у примы, те же данные)
            let val_body_start_steam = (valwe_bodyPrima.hasOwnProperty("bodyPrima") ? valwe_bodyPrima["bodyPrima"]["percentStart"] : 0);
            let tpl_body_start_steam = returnTplHtml([{ id: "reflux_body_start_steam", value: val_body_start_steam, min: '0', max: '100', step: '0.5' }], deltaTempl);
            let val_body_stop_steam = (valwe_bodyPrima.hasOwnProperty("bodyPrima") ? valwe_bodyPrima["bodyPrima"]["percentStop"] : 0);
            let tpl_body_stop_steam = returnTplHtml([{ id: "reflux_body_stop_steam", value: val_body_stop_steam, min: '0', max: '100', step: '0.5' }], deltaTempl);
            let val_body_decline_steam = (valwe_bodyPrima.hasOwnProperty("bodyPrima") ? valwe_bodyPrima["bodyPrima"]["decline"] : 0);
            let tpl_body_decline_steam = returnTplHtml([{ id: "reflux_body_decline_steam", value: val_body_decline_steam, min: '0', max: '30', step: '1' }], deltaTempl);
            //тело прима
            let val_body_start_prima = (valwe_bodyPrima.hasOwnProperty("bodyPrima") ? valwe_bodyPrima["bodyPrima"]["percentStart"] : 0);
            let tpl_body_start_prima = returnTplHtml([{ id: "reflux_body_start_prima", value: val_body_start_prima, min: '0', max: '100', step: '0.5' }], deltaTempl);
            let val_body_stop_prima = (valwe_bodyPrima.hasOwnProperty("bodyPrima") ? valwe_bodyPrima["bodyPrima"]["percentStop"] : 0);
            let tpl_body_stop_prima = returnTplHtml([{ id: "reflux_body_stop_prima", value: val_body_stop_prima, min: '0', max: '100', step: '0.5' }], deltaTempl);
            let val_body_decline_prima = (valwe_bodyPrima.hasOwnProperty("bodyPrima") ? valwe_bodyPrima["bodyPrima"]["decline"] : 0);
            let tpl_body_decline_prima = returnTplHtml([{ id: "reflux_body_decline_prima", value: val_body_decline_prima, min: '0', max: '30', step: '1' }], deltaTempl);
            //тпл тело жижа
            tpl_devices_out_body += '<div id="reflux_devices_body_rk" class="row row-striped">' +
                '<div class="pt-10 pb-10 clearfix">' +
                '<div class="col-xs-12 col-sm-3 pxs-10 text-middle text-center-xs text-strong">Клапан отбора тела</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_cycle_rk + '</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_time_rk + '</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_decline_rk + '</div>' +
                '</div></div>';
            //тпл тело пар
            tpl_devices_out_body += '<div id="reflux_devices_body_steam" class="row row-striped">' +
                body_devices +
                '<div class="pt-10 pb-10 clearfix">' +
                '<div class="col-xs-12 col-sm-3 pxs-10 text-middle text-center-xs text-strong">Кран отбора тела</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_start_steam + '</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_stop_steam + '</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_decline_steam + '</div>' +
                '</div></div>';
            //тпл тело прима
            tpl_devices_out_body += '<div id="reflux_devices_body_prima" class="row row-striped">' +
                body_devices +
                '<div class="pt-10 pb-10 clearfix">' +
                '<div class="col-xs-12 col-sm-3 pxs-10 text-middle text-center-xs text-strong">Кран отбора тела</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_start_prima + '</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_stop_prima + '</div>' +
                '<div class="col-xs-4 col-sm-3 pxs-0">' + tpl_body_decline_prima + '</div>' +
                '</div></div>';

            tpl_devices_out_body += '</div></div>';

            tpl_devices_body = tpl_devices_out_body + tpl_devices_body;
        }

        refluxTemplate = timeStepTemplate +
            returnTplHtml([{ id_value: "reflux_power_value", id_set: "reflux_power_set" }], powerTempl) +
            returnTplHtml([{ id_lower_set: "reflux_power_lower_set" }], powerLowerTempl) +
            tpl_stab + refluxTemplate + pressureTemplate + tpl_devices_body + tpl_safety_body;

        $("#reflux_start_group_button").removeClass("hidden");
        $("#reflux_group_volume").removeClass("hidden");
        $("#reflux_volume").val(soundVolume);
    } else {
        $("#reflux_start_group_button").addClass("hidden");
        $("#reflux_group_volume").addClass("hidden");
        if (sensors_select) {
            refluxProcess["sensors"] = {};
            $.fn.pasteRefluxSensors(false);
        }
    }
    $("#reflux_process").html(refluxTemplate);
    $.fn.clearSelect($("#reflux_algorithm_select"));
    $.fn.fillSelect($("#reflux_algorithm_select"), algorithmReflux, false);
    $("#reflux_algorithm_select").val(refluxProcess["number"]).change();
    // $("#reflux_algorithm").removeClass("hidden");
    $("#reflux_power_set").val(refluxProcess["powerHigh"]);
    $("#reflux_power_lower_set").val(refluxProcess["powerLower"]);
    if (refluxProcess["start"] === true) {
        getReflux();
        $('#reflux_start').prop("disabled", true);
        // $('#reflux_add_sensor').prop("disabled", true);
        $('#reflux_add_sensor').parent().addClass("hidden");
        $("#reflux_algorithm_select option[value=" + refluxProcess["number"] + "]").prop('selected', true);
        // $('#reflux_algorithm_select').prop("disabled", true);
        $('#reflux_add_sensor').parent().addClass("hidden");
        $("#reflux_algorithm").addClass("hidden");
    } else {
        // $('#reflux_add_sensor').prop("disabled", false);
        $('#reflux_add_sensor').parent().removeClass("hidden");
        $('#reflux_stop').prop("disabled", true);
        $('#reflux_next').prop("disabled", true);
        // $('#reflux_algorithm_select').prop("disabled", false);
        $('#reflux_add_sensor').parent().removeClass("hidden");
        $("#reflux_algorithm").removeClass("hidden");
    }
}

//Привязка датчиков к процессу ректификации, и запуск
let refluxProcess = {
    "sensors": {},
    "stab": 0,
    "point": 0,
    "powerHigh": 0,
    "powerLower": 0,
    "number": 0,
    "start": false,
    "transitionTemperature": 0,
    "tapCorrection": 0
};//"devices":[],"safety":[],
$(document).on('click', '#reflux_add_sensor', function (e) {
    e.preventDefault();
    let _this = $(this);
    sendRequest("refluxSensorsSetLoad", {}, "json", selectSensorsReflus, _this, $("#error_reflux"), false);
});


$(document).on('click', '#reflux_sensors input[type=checkbox]', function () {
    let checked = !$(this).prop("checked");
    let radio_delta = $("#delta_" + $(this).data("sensor"));
    let radio_cutoff = $("#cutoff_" + $(this).data("sensor"));
    radio_delta.prop("disabled", checked);
    radio_cutoff.prop("disabled", checked);
    if (checked) {
        radio_delta.prop("checked", false);
        radio_cutoff.prop("checked", false);
    }
});
$(document).on('click', '#reflux_sensors input.reflux_delta_radio', function () {
    let checked = $(this).prop("checked");
    if (checked) {
        $('#reflux_sensors input.reflux_delta_radio').prop("checked", false);
        $(this).prop("checked", true);
    }
});


$(document).on('change', '#reflux_algorithm_select', function () {
    let algorithm_val = Number($(this).find(":selected").val());
    refluxProcess["number"] = algorithm_val;
    if ($("#reflux_devices_out").length > 0) {
        console.log("reflux_devices_out", algorithm_val);
        if (algorithm_val === 1 || algorithm_val === 2 || algorithm_val === 3 || algorithm_val === 4 || algorithm_val === 6) {
            $("#reflux_devices_out").removeClass("hidden");
        } else {
            $("#reflux_devices_out").addClass("hidden");
        }
        if (algorithm_val === 1) {
            $("#reflux_devices_head_rk").addClass("hidden");
            $("#reflux_devices_body_rk").addClass("hidden");
            $("#reflux_devices_head_steam").addClass("hidden");
            $("#reflux_devices_body_steam").addClass("hidden");
            $("#reflux_devices_head_prima").removeClass("hidden");
            $("#reflux_devices_body_prima").removeClass("hidden");
            // $("#reflux_devices_out_header").addClass("hidden");
        } else if (algorithm_val === 2) {
            $("#reflux_devices_head_rk").addClass("hidden");
            $("#reflux_devices_body_rk").addClass("hidden");
            $("#reflux_devices_head_steam").removeClass("hidden");
            $("#reflux_devices_body_steam").removeClass("hidden");
            $("#reflux_devices_head_prima").addClass("hidden");
            $("#reflux_devices_body_prima").addClass("hidden");
            // $("#reflux_devices_out_header").removeClass("hidden");
        } else if (algorithm_val === 3) {
            $("#reflux_devices_head_rk").removeClass("hidden");
            $("#reflux_devices_body_rk").removeClass("hidden");
            $("#reflux_devices_head_steam").addClass("hidden");
            $("#reflux_devices_body_steam").addClass("hidden");
            $("#reflux_devices_head_prima").addClass("hidden");
            $("#reflux_devices_body_prima").addClass("hidden");
            // $("#reflux_devices_out_header").removeClass("hidden");
        } else if (algorithm_val === 4) {
            $("#reflux_devices_head_rk").removeClass("hidden");
            $("#reflux_devices_body_rk").removeClass("hidden");
            $("#reflux_devices_head_steam").addClass("hidden");
            $("#reflux_devices_body_steam").addClass("hidden");
            $("#reflux_devices_head_prima").addClass("hidden");
            $("#reflux_devices_body_prima").addClass("hidden");
            // $("#reflux_devices_out_header").removeClass("hidden");
        } else if (algorithm_val === 6) {
            $("#reflux_devices_head_rk").removeClass("hidden");
            $("#reflux_devices_body_rk").addClass("hidden");
            $("#reflux_devices_head_steam").addClass("hidden");
            $("#reflux_devices_body_steam").addClass("hidden");
            $("#reflux_devices_head_prima").addClass("hidden");
            $("#reflux_devices_body_prima").addClass("hidden");
            // $("#reflux_devices_out_header").removeClass("hidden");
        }
    }
});
//Запрос датчиков для ректификации и вывод их в диалоговое окно
function selectSensorsReflus(data) {
    let sensors = data;//sensorsJson
    //console.log(sensors);
    if (sensors !== null) {
        let section = '<section id="reflux_sensors" class="table-responsive"><table class="table table-noborder">';
        let tpl_temperature = '';
        let tpl_devices = '';
        let tpl_safety = '';
        let tpl_stab = '';
        for (let key in sensors) {
            if (sensors.hasOwnProperty(key)) {
                let sensor_name = (sensors[key].hasOwnProperty("name") ? sensors[key]["name"] : "");
                if (sensor_name !== "") {
                    if (re_t.test(key)) {
                        let sensor_delta = (key === 't2' ? '<label class="checkbox-inline pl-10">' +
                            '<input class="reflux_delta_radio" disabled id="delta_' + key + '" name="reflux_radio_' + key + '" type="radio"' +
                            ' value="Y">Уставка</label>' : '');
                        let sensor_cutoff = '<label class="checkbox-inline pl-10">' +
                            '<input disabled id="cutoff_' + key + '" name="reflux_radio_' + key + '" type="radio" value="Y">Отсечка</label>';

                        let jscolor = sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF";

                        tpl_temperature += '<tr><td style="width: 320px">' +
                            '<div class="input-group input-group-sm">' +
                            '<span class="input-group-addon" style="background-color: #' + jscolor + '">' + key + '</span>' +
                            '<input readonly id="reflux_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
                            '<input type="hidden" id="reflux_color_' + key + '" value="' + jscolor + '">' +
                            '</div></td>' +
                            '<td><input data-sensor="' + key + '" type="checkbox" value="' + key + '"></td>' +
                            '<td>' + sensor_delta + '</td>' +
                            '<td>' + sensor_cutoff + '</td>' +
                            '</tr>';
                    }
                    if (re_out.test(key)) {
                        tpl_devices += '<tr><td>' +
                            '<div class="input-group input-group-sm">' +
                            '<span class="input-group-addon">' + key + '</span>' +
                            '<input readonly id="reflux_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
                            '</div></td>' +
                            '<td><input data-sensor="' + key + '" type="checkbox" value="' + key + '"></td>' +
                            '<td></td>' +
                            '<td></td>' +
                            '</tr>';
                    }
                    if (re_in.test(key)) {
                        tpl_safety += '<tr><td>' +
                            '<div class="input-group input-group-sm">' +
                            '<span class="input-group-addon">' + key + '</span>' +
                            '<input readonly id="reflux_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
                            '</div></td>' +
                            '<td><input data-sensor="' + key + '" type="checkbox" value="' + key + '"></td>' +
                            '<td></td>' +
                            '<td></td>' +
                            '</tr>';
                    }
                }
                if (key === "stab") {
                    tpl_stab += '<tr>' +
                        '<td>Время стабилизации колонны</td>' +
                        '<td colspan="3" class="text-center">' + returnTplHtml([{ id: "stab", value: sensors[key], min: '0', max: '120', step: '1' }], deltaTempl) + '</td>' +
                        '</tr>';
                }
                if (key === "point") {
                    tpl_stab += '<tr>' +
                        '<td>Время до применения уставки</td>' +
                        '<td colspan="3" class="text-center">' + returnTplHtml([{ id: "point", value: sensors[key], min: '0', max: '60', step: '1' }], deltaTempl) + '</td>' +
                        '</tr>';
                }
                if (key === "transitionTemperature") {
                    tpl_stab += '<tr>' +
                        '<td>Температура в царге перехода на рабочую мощность</td>' +
                        '<td colspan="3" class="text-center">' + returnTplHtml([{ id: "transitionTemperature", value: sensors[key], min: '30', max: '100', step: '1' }], deltaTempl) + '</td>' +
                        '</tr>';
                }
                if (key === "tapCorrection") {
                    tpl_stab += '<tr>' +
                        '<td>Коррекция угла открытия шарового крана</td>' +
                        '<td colspan="3" class="text-center">' + returnTplHtml([{ id: "tapCorrection", value: sensors[key], min: '50', max: '250', step: '1' }], deltaTempl) + '</td>' +
                        '</tr>';
                }
            }
        }
        if (tpl_temperature !== '') {
            section += '<tr><td colspan="4" class="text-center text-strong">Датчики температуры</td></tr>' + tpl_temperature;
        }
        if (tpl_devices !== '') {
            section += '<tr><td colspan="4" class="text-center text-strong">Исполнительные устройства</td></tr>' + tpl_devices;
        }
        if (tpl_safety !== '') {
            section += '<tr><td colspan="4" class="text-center text-strong">Датчики безопасности</td></tr>' + tpl_safety;
        }
        if (tpl_stab !== '') {
            section += '<tr><td colspan="4" class="text-center text-strong">Настройки колонны</td></tr>' + tpl_stab;
        }
        section += '</table></section>';
        $.fn.openModal('Выбор датчиков для ректификации', section, "modal-md", false, {
            text: "Выбрать",
            id: "sensors_select",
            class: "btn btn-success",
            click: function () {
                refluxProcess["sensors"] = {};
                let sensors_select = $('#reflux_sensors input[type=checkbox]');
                $.map(sensors_select, function (e) {
                    if ($(e).is(":checked")) {
                        let key = $(e).data("sensor");
                        let tmp = false;
                        if (re_t.test(key)) {
                            tmp = true;
                        }
                        let name = $("#reflux_name_" + key).val();
                        let val_color = (tmp ? $("#reflux_color_" + key).val() : "");
                        let color = (val_color !== "FFFFFF" && val_color !== "") ? Number(hex2dec(val_color)) : 0;
                        let delta = (tmp ? Number($("#delta_" + key).prop("checked")) : 0);
                        let cutoff = (tmp ? Number($("#cutoff_" + key).prop("checked")) : 0);

                        refluxProcess["sensors"][key] = {};
                        if (tmp) {
                            refluxProcess["sensors"][key] = { "name": name, "delta": delta, "cutoff": cutoff, "color": color, "allertValue": 0, "value": 0, "member": 1 };
                        } else {
                            refluxProcess["sensors"][key] = { "name": name, "value": 0, "member": 1 };
                        }
                    }
                });
                refluxProcess["stab"] = Number($("#stab").val());
                refluxProcess["point"] = Number($("#point").val());
                refluxProcess["transitionTemperature"] = Number($("#transitionTemperature").val());
                refluxProcess["tapCorrection"] = Number($("#tapCorrection").val());
                $(this).closest(".modal").modal("hide");
                $.fn.pasteRefluxSensors(true);
            }
        },
            { id: "modal_sensors_select" }
        );
    }
}

function launchReflux() {
    curProcess = 2;
    countProcess = 0;
    refluxProcess["start"] = flagSendProcess = true;
    $('#reflux_start').prop("disabled", true);
    // $('#reflux_add_sensor').prop("disabled", true);
    $('#reflux_add_sensor').parent().addClass("hidden");
    $('#reflux_stop').prop("disabled", false);
    $('#reflux_next').prop("disabled", false);
    $("#reflux_algorithm_select option[value=" + refluxProcess["number"] + "]").prop('selected', true);
    $('#reflux_algorithm').addClass("hidden");
    // $('#reflux_algorithm_select').prop("disabled", true);
    clearInterval(sensorsProcessId);
    stopInterval();
    localStorage.setObj('oldStartProcess', 2);
    setTimeout(function () {
        setReflux();
    }, 1000);
}

$(document).on('start-event', '#reflux_start', function (e) {
    console.log("start-event-Reflux");
    launchReflux()
});
$(document).on('click', '#reflux_start', function () {
    $.fn.openModal('', '<p class="text-center text-danger text-strong">Будет запущен процесс ректификации, убедитесь в том, что тэн залит жидкостью!</p>', "modal-sm", false, [{
        text: "Да",
        id: "return_restart",
        class: "btn btn-primary btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
            launchReflux();
        }
    },
    {
        text: "Нет",
        id: "return_tab",
        class: "btn btn-danger btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
        }
    }], { buttons: "replace" });
});
$(document).on('click', '#reflux_stop', function () {
    $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите остановить процесс ректификации?</p>', "modal-sm", false, [{
        text: "Да",
        id: "return_restart",
        class: "btn btn-primary btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
            stopReflux()
        }
    },
    {
        text: "Нет",
        id: "return_tab",
        class: "btn btn-danger btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
        }
    }], { buttons: "replace" });

});
$(document).on('click', '#reflux_next', function () {
    let step = globalSensorsJson["process"]["step"];
    $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите прервать «' + step + '» и перейти на следующий шаг?</p>', "modal-sm", false, [{
        text: "Да",
        id: "return_restart",
        class: "btn btn-primary btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
            stepRefluxNext = true;
            setReflux();
        }
    },
    {
        text: "Нет",
        id: "return_tab",
        class: "btn btn-danger btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
        }
    }], { buttons: "replace" });

});
function stopReflux() {
    $('#reflux_stop').prop("disabled", true);
    $('#reflux_next').prop("disabled", true);
    // $('#reflux_add_sensor').prop("disabled", false);
    $('#reflux_add_sensor').parent().removeClass("hidden");
    $('#reflux_start').prop("disabled", false);
    // $('#reflux_algorithm_select').prop("disabled", false);
    $('#reflux_algorithm').removeClass("hidden");
    $("#svg_reflux_start").css('stroke', "#000000");
    $("#svg_reflux_alco_txt").hide();
    $("#svg_reflux_alco_val").hide().text("");
    $("#reflux_time").html('').addClass("hidden");
    $("#reflux_step").html('').addClass("hidden");
    $("#reflux_process").find("div.bg-danger").removeClass("bg-danger");
    $("#reflux_process").find("div.text-danger").removeClass("text-danger");
    clearInterval(sensorsProcessId);
    // clearInterval(sensorsIntervalId);
    stopInterval();
    flagSendProcess = true;
    globalSensorsJson["process"]["allow"] = 0;
    curProcess = 0;
    countProcess = 0;
    refluxProcess["start"] = false;
    setReflux();
}

$(document).on('stop-event', '#reflux_stop', function (e) {
    stopReflux()
});

//Установка значений для ректификации
let stepRefluxNext = false;
function setReflux() {
    console.log("setReflux", stepRefluxNext);
    if ($.fn.objIsEmpty(refluxProcess["sensors"], false)) {
        setTimeout(function () {
            setReflux();
        }, 1000);
    } else {
        let refluxSendData = {
            "process": { "allow": 0, "number": 0 },
            "t1": { "allertValue": 0 },
            "t2": { "allertValue": 0 },
            "t3": { "allertValue": 0 },
            "t4": { "allertValue": 0 },
            "t5": { "allertValue": 0 },
            "t6": { "allertValue": 0 },
            "t7": { "allertValue": 0 },
            "t8": { "allertValue": 0 },
            "head": { "timeCycle": 0, "timeOn": 0 },
            "headSteam": { "percent": 0 },
            "body": { "timeCycle": 0, "timeOn": 0, "decline": 0 },
            "bodyPrima": { "percentStart": 0, "percentStop": 0, "decline": 0 },
            "powerHigh": 0,
            "powerLower": 0,
            "stepNext": 0
        };
        let power_set = $("#reflux_power_set");
        let power_lower_set = $("#reflux_power_lower_set");
        refluxSendData["process"]["allow"] = (refluxProcess["start"] ? 2 : 0);
        if (refluxProcess["powerHigh"] !== power_set.val()) {
            flagSendProcess = true;
        }
        if (refluxProcess["powerLower"] !== power_lower_set.val()) {
            flagSendProcess = true;
        }
        refluxSendData["process"]["number"] = refluxProcess["number"];
        refluxSendData["powerHigh"] = refluxProcess["powerHigh"] = Number(power_set.val());
        refluxSendData["powerLower"] = refluxProcess["powerLower"] = Number(power_lower_set.val());

        $.each(refluxProcess["sensors"], function (i, e) {
            let sensor_key = i;
            let reflux_delta = $("#reflux_delta_" + sensor_key);
            let reflux_cutoff = $("#reflux_cutoff_" + sensor_key);
            if (reflux_delta.length) {
                if (e["allertValue"] !== reflux_delta.val()) {
                    flagSendProcess = true;
                }
                refluxSendData[sensor_key]["allertValue"] = e["allertValue"] = reflux_delta.val();
            }
            if (reflux_cutoff.length) {
                if (e["allertValue"] !== reflux_cutoff.val()) {
                    flagSendProcess = true;
                }
                refluxSendData[sensor_key]["allertValue"] = e["allertValue"] = reflux_cutoff.val();
            }
        });
        //клапана
        let valwe_head = {};
        let valwe_headSteam = {};
        let valwe_body = {};
        let valwe_bodyPrima = {};
        if (globalSensorsJson.hasOwnProperty("valwe")) {
            $.each(globalSensorsJson["valwe"], function (i, e) {
                // console.log(i, e);
                let valwe_key = Object.keys(e).shift();
                switch (valwe_key) {
                    case "head":
                        valwe_head = e;
                        break;
                    case "headSteam":
                        valwe_headSteam = e;
                        break;
                    case "body":
                        valwe_body = e;
                        break;
                    case "bodyPrima":
                        valwe_bodyPrima = e;
                        break;
                }
            });

            //прима
            if (Number(refluxSendData["process"]["number"]) === 1) {
                let reflux_head_cycle_prima = $("#reflux_head_cycle_prima");
                let reflux_head_time_prima = $("#reflux_head_time_prima");
                let reflux_body_start_prima = $("#reflux_body_start_prima");
                let reflux_body_stop_prima = $("#reflux_body_stop_prima");
                let reflux_body_decline_prima = $("#reflux_body_decline_prima");
                if (reflux_head_cycle_prima.length) {
                    let val_reflux_head_cycle_prima = Number(reflux_head_cycle_prima.val());
                    if (Number(valwe_head["head"]["timeCycle"]) !== val_reflux_head_cycle_prima) {
                        flagSendProcess = true;
                    }
                    refluxSendData["head"]["timeCycle"] = val_reflux_head_cycle_prima;
                }
                if (reflux_head_time_prima.length) {
                    let val_reflux_head_time_prima = Number(reflux_head_time_prima.val());
                    if (Number(valwe_head["head"]["timeOn"]) !== val_reflux_head_time_prima) {
                        flagSendProcess = true;
                    }
                    refluxSendData["head"]["timeOn"] = val_reflux_head_time_prima;
                }
                if (reflux_body_start_prima.length) {
                    let val_reflux_body_start_prima = Number(reflux_body_start_prima.val());
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStart"]) !== val_reflux_body_start_prima) {
                        flagSendProcess = true;
                    }
                    refluxSendData["bodyPrima"]["percentStart"] = val_reflux_body_start_prima;
                }
                if (reflux_body_stop_prima.length) {
                    let val_reflux_body_stop_prima = Number(reflux_body_stop_prima.val());
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStop"]) !== val_reflux_body_stop_prima) {
                        flagSendProcess = true;
                    }
                    refluxSendData["bodyPrima"]["percentStop"] = val_reflux_body_stop_prima;
                }
                if (reflux_body_decline_prima.length) {
                    let val_reflux_body_decline_prima = Number(reflux_body_decline_prima.val());
                    if (Number(refluxSendData["bodyPrima"]["decline"]) !== val_reflux_body_decline_prima) {
                        flagSendProcess = true;
                    }
                    refluxSendData["bodyPrima"]["decline"] = val_reflux_body_decline_prima;
                }
            }
            //пар
            if (Number(refluxSendData["process"]["number"]) === 2) {
                let reflux_head_steam = $("#reflux_head_steam");
                let reflux_body_start_steam = $("#reflux_body_start_steam");
                let reflux_body_stop_steam = $("#reflux_body_stop_steam");
                let reflux_body_decline_steam = $("#reflux_body_decline_steam");
                if (reflux_head_steam.length) {
                    let val_reflux_head_steam = Number(reflux_head_steam.val());
                    if (Number(valwe_headSteam["headSteam"]["percent"]) !== val_reflux_head_steam) {
                        flagSendProcess = true;
                    }
                    refluxSendData["headSteam"]["percent"] = val_reflux_head_steam;
                }
                if (reflux_body_start_steam.length) {
                    let val_reflux_body_start_steam = Number(reflux_body_start_steam.val());
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStart"]) !== val_reflux_body_start_steam) {
                        flagSendProcess = true;
                    }
                    refluxSendData["bodyPrima"]["percentStart"] = val_reflux_body_start_steam;
                }
                if (reflux_body_stop_steam.length) {
                    let val_reflux_body_stop_steam = Number(reflux_body_stop_steam.val());
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStop"]) !== val_reflux_body_stop_steam) {
                        flagSendProcess = true;
                    }
                    refluxSendData["bodyPrima"]["percentStop"] = val_reflux_body_stop_steam;
                }
                if (reflux_body_decline_steam.length) {
                    let val_reflux_body_decline_steam = Number(reflux_body_decline_steam.val());
                    if (Number(refluxSendData["bodyPrima"]["decline"]) !== val_reflux_body_decline_steam) {
                        flagSendProcess = true;
                    }
                    refluxSendData["bodyPrima"]["decline"] = val_reflux_body_decline_steam;
                }
            }
            //жижа
            if (Number(refluxSendData["process"]["number"]) === 3 || Number(refluxSendData["process"]["number"]) === 4) {
                let reflux_head_cycle_rk = $("#reflux_head_cycle_rk");
                let reflux_head_time_rk = $("#reflux_head_time_rk");
                let reflux_body_cycle_rk = $("#reflux_body_cycle_rk");
                let reflux_body_time_rk = $("#reflux_body_time_rk");
                let reflux_body_decline_rk = $("#reflux_body_decline_rk");
                if (reflux_head_cycle_rk.length) {
                    let val_reflux_head_cycle_rk = Number(reflux_head_cycle_rk.val());
                    if (Number(valwe_head["head"]["timeCycle"]) !== val_reflux_head_cycle_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["head"]["timeCycle"] = val_reflux_head_cycle_rk;
                }
                if (reflux_head_time_rk.length) {
                    let val_reflux_head_time_rk = Number(reflux_head_time_rk.val());
                    if (Number(valwe_head["head"]["timeOn"]) !== val_reflux_head_time_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["head"]["timeOn"] = val_reflux_head_time_rk;
                }
                if (reflux_body_cycle_rk.length) {
                    let val_reflux_body_cycle_rk = Number(reflux_body_cycle_rk.val());
                    if (Number(valwe_body["body"]["timeCycle"]) !== val_reflux_body_cycle_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["body"]["timeCycle"] = val_reflux_body_cycle_rk;
                }
                if (reflux_body_time_rk.length) {
                    let val_reflux_body_time_rk = Number(reflux_body_time_rk.val());
                    if (Number(valwe_body["body"]["timeOn"]) !== val_reflux_body_time_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["body"]["timeOn"] = val_reflux_body_time_rk;
                }
                if (reflux_body_decline_rk.length) {
                    let val_reflux_body_decline_rk = Number(reflux_body_decline_rk.val());
                    if (Number(valwe_body["body"]["decline"]) !== val_reflux_body_decline_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["body"]["decline"] = val_reflux_body_decline_rk;
                }
            }
            //бражная с клапаном на головы
            if (Number(refluxSendData["process"]["number"]) === 6) {
                let reflux_head_cycle_rk = $("#reflux_head_cycle_rk");
                let reflux_head_time_rk = $("#reflux_head_time_rk");
                if (reflux_head_cycle_rk.length) {
                    let val_reflux_head_cycle_rk = Number(reflux_head_cycle_rk.val());
                    if (Number(valwe_head["head"]["timeCycle"]) !== val_reflux_head_cycle_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["head"]["timeCycle"] = val_reflux_head_cycle_rk;
                }
                if (reflux_head_time_rk.length) {
                    let val_reflux_head_time_rk = Number(reflux_head_time_rk.val());
                    if (Number(valwe_head["head"]["timeOn"]) !== val_reflux_head_time_rk) {
                        flagSendProcess = true;
                    }
                    refluxSendData["head"]["timeOn"] = val_reflux_head_time_rk;
                }
            }
        }
        if (stepRefluxNext) {
            flagSendProcess = true;
            refluxSendData["stepNext"] = 1;
            stepRefluxNext = false;
        }

        if (flagSendProcess) {
            flagSendProcess = false;
            clearInterval(sensorsProcessId);
            // clearInterval(sensorsIntervalId);
            stopInterval();
            sendRequest("SensorsIn", refluxSendData, "json", startReflux, false, $("#error_reflux"), false);
        }
    }
}
// $(document).on('mousedown',"#reflux_process input", function () {
// 	flagSendProcess = true;
// });
$(document).on('change', "#reflux_process input",
    $.debounce(function () {
        flagButtonPress = false;
        // flagSendProcess = true;
        if (refluxProcess["start"] === true) {
            setReflux();
        }
    }, 300)
);
function startReflux() {
    console.log("startReflux");
    setTimeout(function () {
        clearInterval(sensorsProcessId);
        // clearInterval(sensorsIntervalId);
        stopInterval();
        startInterval();
        // sensorsIntervalId = setInterval(getIntervalSensors, 1000);
        if (refluxProcess["start"] === true) {
            sensorsProcessId = setInterval(getReflux, 2000);
        }
    }, 2000);
}

function getReflux() {
    if (!$.fn.objIsEmpty(globalSensorsJson, false)) {
        let dtoJson = {};
        dtoJson["h"] = Number(globalSensorsJson["power"]);
        dtoJson["t"] = {};
        $.each(globalSensorsJson["sensors"], function (i, e) {
            let sensor_key = Object.keys(e).shift();
            let sensor_value = Number(globalSensorsJson["sensors"][i][sensor_key]["value"]);
            let alert_value = Number(globalSensorsJson["sensors"][i][sensor_key]["allertValue"]);
            $.each(refluxProcess["sensors"], function (j, q) {
                if (j === sensor_key && re_t.test(sensor_key)) {
                    q["value"] = sensor_value;
                    let color_value = q["color"];
                    let fillcolor = "#" + dec2hex(color_value);
                    if (alert_value > 0 && sensor_value >= alert_value) {
                        $("#reflux_alert_bg_" + sensor_key).addClass("bg-danger");
                        $("#reflux_alert_text_" + sensor_key).addClass("text-danger");
                    } else {
                        $("#reflux_alert_bg_" + sensor_key).removeClass("bg-danger");
                        $("#reflux_alert_text_" + sensor_key).removeClass("text-danger");
                    }
                    // console.log(q);
                    if (q["delta"] === 0) {
                        $("#svg_reflux_color_" + sensor_key).css('fill', colorPersent(fillcolor, sensor_value, alert_value));
                    } else {
                        let delta_alert = Number($("#reflux_delta_" + sensor_key).val());
                        let delta_value = parseFloat((delta_alert + sensor_value).toFixed(2));
                        $("#svg_reflux_color_" + sensor_key).css('fill', colorPersent(fillcolor, delta_value, (sensor_value + delta_alert)));
                        console.log(q["delta"], fillcolor, delta_value, (sensor_value + delta_alert))
                    }
                    //убрал пока
                    /*if(!flagSendProcess) {
                        //$("#reflux_delta_" + sensor_key).val(alert_value);
                        $("#reflux_cutoff_" + sensor_key).val(alert_value.toFixed(0));
                    }*/
                    //убрал пока
                    if (!flagSendProcess && !flagButtonPress) {
                        //дельта
                        if (globalSensorsJson.hasOwnProperty("delta")) {
                            let reflux_delta = $("#reflux_delta_" + sensor_key);
                            if (reflux_delta.length) {
                                if (Number(reflux_delta.val()) !== Number(globalSensorsJson["delta"])) {
                                    deltaChange++
                                }
                                if (deltaChange > 5) {
                                    reflux_delta.val(globalSensorsJson["delta"]);
                                    deltaChange = 0;
                                }
                            }
                        }

                        let reflux_cutoff = $("#reflux_cutoff_" + sensor_key);
                        if (reflux_cutoff.length) {
                            //console.log(countChange, $("#distillation_cutoff_" + sensor_key).val(), alert_value);
                            if (Number(reflux_cutoff.val()) !== alert_value) {
                                alertChange[sensor_key]++
                            }
                            if (alertChange[sensor_key] > 5) {
                                reflux_cutoff.val(alert_value);
                                //$("#distillation_temperature_" + sensor_key).val(temperature);
                                alertChange[sensor_key] = 0;
                            }
                        }
                    }
                    $("#reflux_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    let allertValue = alert_value;
                    allertValue = allertValue > 0 ? allertValue.toFixed(2) : "";
                    if (allertValue !== "") {
                        $("#reflux_delta_result_" + sensor_key).text(allertValue).parent().find(".hidden").removeClass("hidden").addClass("show");
                        $("#reflux_cutoff_result_" + sensor_key).text(allertValue).parent().find(".hidden").removeClass("hidden").addClass("show");
                    } else {
                        $("#reflux_delta_result_" + sensor_key).text(allertValue).parent().find(".show").removeClass("show").addClass("hidden");
                        $("#reflux_cutoff_result_" + sensor_key).text(allertValue).parent().find(".show").removeClass("show").addClass("hidden");
                    }
                    //svg
                    if (sensor_value < 150) {
                        $("#svg_reflux_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
                    } else {
                        $("#svg_reflux_" + sensor_key).text('');
                    }

                    if (Number(q["member"]) !== 0) {
                        dtoJson["t"][sensor_key] = sensor_value;
                    }
                }
            });
            //Исполнительные устройства
            $.each(globalSensorsJson["devices"], function (i, e) {
                let sensor_key = Object.keys(e).shift();
                $.each(refluxProcess["sensors"], function (j, q) {
                    if (j === sensor_key && re_out.test(sensor_key)) {
                        if (Number(refluxProcess["sensors"][sensor_key]["member"]) !== 0) {
                            if (Number(e[sensor_key]["allert"]) !== 0) {
                                $("#reflux_" + sensor_key).removeClass("hidden").addClass("show");
                            } else {
                                $("#reflux_" + sensor_key).removeClass("show").addClass("hidden");
                            }
                        }
                    }
                })
            });
            //Датчики безопасности
            $.each(globalSensorsJson["safety"], function (i, e) {
                let sensor_key = Object.keys(e).shift();
                $.each(refluxProcess["sensors"], function (j, q) {
                    if (j === sensor_key && re_in.test(sensor_key)) {
                        if (Number(refluxProcess["sensors"][sensor_key]["member"]) !== 0) {
                            if (Number(e[sensor_key]["allert"]) !== 0) {
                                $("#reflux_alert_bg_" + sensor_key).addClass("bg-danger");
                                $("#reflux_alert_text_" + sensor_key).addClass("text-danger");
                            } else {
                                $("#reflux_alert_bg_" + sensor_key).removeClass("bg-danger");
                                $("#reflux_alert_text_" + sensor_key).removeClass("text-danger");
                            }
                        }
                    }
                })
            });

            if (re_p.test(sensor_key)) {
                $("#reflux_pressure").text(globalSensorsJson["sensors"][i]["p1"]["value"].toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                dtoJson["p"] = globalSensorsJson["sensors"][i]["p1"]["value"];
            }

        });
        $("#reflux_alco_boil").text(globalSensorsJson["temperatureAlcoholBoil"].toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
        let power_value = Number(globalSensorsJson["power"]);
        // let power_higt_value = refluxProcess["powerHigh"];
        // let power_lower_value = refluxProcess["powerLower"];
        //заполнение поля регулировки тена и рабочей мощности
        if (!flagSendProcess && !flagButtonPress) {
            // $("#reflux_power_set").val(power_higt_value.toFixed(0));
            // $("#reflux_power_lower_set").val(power_lower_value.toFixed(0));

            if (Number($("#reflux_power_set").val()) !== Number(globalSensorsJson["powerHigh"]) ||
                Number($("#reflux_power_lower_set").val()) !== Number(globalSensorsJson["powerLower"])
            ) {
                powerChange++
            }
            if (powerChange > 5) {
                $("#reflux_power_set").val(globalSensorsJson["powerHigh"].toFixed(0));
                $("#reflux_power_lower_set").val(globalSensorsJson["powerLower"].toFixed(0));
                powerChange = 0;
            }
            //настройки колонн
            let valwe_head = {};
            let valwe_headSteam = {};
            let valwe_body = {};
            let valwe_bodyPrima = {};
            if (globalSensorsJson.hasOwnProperty("valwe")) {
                $.each(globalSensorsJson["valwe"], function (i, e) {
                    // console.log(i,e);
                    let valwe_key = Object.keys(e).shift();
                    switch (valwe_key) {
                        case "head":
                            valwe_head = e;
                            break;
                        case "headSteam":
                            valwe_headSteam = e;
                            break;
                        case "body":
                            valwe_body = e;
                            break;
                        case "bodyPrima":
                            valwe_bodyPrima = e;
                            break;
                    }
                })
            }
            //прима
            let reflux_head_cycle_prima = $("#reflux_head_cycle_prima");
            let reflux_head_time_prima = $("#reflux_head_time_prima");
            let reflux_body_start_prima = $("#reflux_body_start_prima");
            let reflux_body_stop_prima = $("#reflux_body_stop_prima");
            let reflux_body_decline_prima = $("#reflux_body_decline_prima");
            if (reflux_head_cycle_prima.length &&
                reflux_head_time_prima.length &&
                reflux_body_start_prima.length &&
                reflux_body_stop_prima.length &&
                reflux_body_decline_prima.length) {

                if (Number(valwe_head["head"]["timeCycle"]) !== Number(reflux_head_cycle_prima.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_head["head"]["timeOn"]) !== Number(reflux_head_time_prima.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_bodyPrima["bodyPrima"]["percentStart"]) !== Number(reflux_body_start_prima.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_bodyPrima["bodyPrima"]["percentStop"]) !== Number(reflux_body_stop_prima.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_bodyPrima["bodyPrima"]["decline"]) !== Number(reflux_body_decline_prima.val())) {
                    algorithmChange++;
                }

                if (algorithmChange > 5) {
                    if (Number(valwe_head["head"]["timeCycle"]) !== Number(reflux_head_cycle_prima.val())) {
                        reflux_head_cycle_prima.val(valwe_head["head"]["timeCycle"])
                    }
                    if (Number(valwe_head["head"]["timeOn"]) !== Number(reflux_head_time_prima.val())) {
                        reflux_head_time_prima.val(valwe_head["head"]["timeOn"])
                    }
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStart"]) !== Number(reflux_body_start_prima.val())) {
                        reflux_body_start_prima.val(valwe_bodyPrima["bodyPrima"]["percentStart"])
                    }
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStop"]) !== Number(reflux_body_stop_prima.val())) {
                        reflux_body_stop_prima.val(valwe_bodyPrima["bodyPrima"]["percentStop"])
                    }
                    if (Number(valwe_bodyPrima["bodyPrima"]["decline"]) !== Number(reflux_body_decline_prima.val())) {
                        reflux_body_decline_prima.val(valwe_bodyPrima["bodyPrima"]["decline"])
                    }
                    algorithmChange = 0;
                }

            }
            //пар
            let reflux_head_steam = $("#reflux_head_steam");
            let reflux_body_start_steam = $("#reflux_body_start_steam");
            let reflux_body_stop_steam = $("#reflux_body_stop_steam");
            let reflux_body_decline_steam = $("#reflux_body_decline_steam");
            if (reflux_head_steam.length &&
                reflux_body_start_steam.length &&
                reflux_body_stop_steam.length &&
                reflux_body_decline_steam.length) {

                if (Number(valwe_headSteam["headSteam"]["percent"]) !== Number(reflux_head_steam.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_bodyPrima["bodyPrima"]["percentStart"]) !== Number(reflux_body_start_steam.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_bodyPrima["bodyPrima"]["percentStop"]) !== Number(reflux_body_stop_steam.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_bodyPrima["bodyPrima"]["decline"]) !== Number(reflux_body_decline_steam.val())) {
                    algorithmChange++;
                }
                if (algorithmChange > 5) {
                    if (Number(valwe_headSteam["headSteam"]["percent"]) !== Number(reflux_head_steam.val())) {
                        reflux_head_steam.val(valwe_headSteam["headSteam"]["percent"])
                    }
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStart"]) !== Number(reflux_body_start_steam.val())) {
                        reflux_body_start_steam.val(valwe_bodyPrima["bodyPrima"]["percentStart"])
                    }
                    if (Number(valwe_bodyPrima["bodyPrima"]["percentStop"]) !== Number(reflux_body_stop_steam.val())) {
                        reflux_body_stop_steam.val(valwe_bodyPrima["bodyPrima"]["percentStop"])
                    }
                    if (Number(valwe_bodyPrima["bodyPrima"]["decline"]) !== Number(reflux_body_decline_steam.val())) {
                        reflux_body_decline_steam.val(valwe_bodyPrima["bodyPrima"]["decline"])
                    }
                    algorithmChange = 0;
                }

            }
            //жижа и бражная колонна с клапаном
            let reflux_head_cycle_rk = $("#reflux_head_cycle_rk");
            let reflux_head_time_rk = $("#reflux_head_time_rk");
            let reflux_body_cycle_rk = $("#reflux_body_cycle_rk");
            let reflux_body_time_rk = $("#reflux_body_time_rk");
            let reflux_body_decline_rk = $("#reflux_body_decline_rk");
            if (reflux_head_cycle_rk.length &&
                reflux_head_time_rk.length &&
                reflux_body_cycle_rk.length &&
                reflux_body_time_rk.length &&
                reflux_body_decline_rk.length) {

                if (Number(valwe_head["head"]["timeCycle"]) !== Number(reflux_head_cycle_rk.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_head["head"]["timeOn"]) !== Number(reflux_head_time_rk.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_body["body"]["timeCycle"]) !== Number(reflux_body_cycle_rk.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_body["body"]["timeOn"]) !== Number(reflux_body_time_rk.val())) {
                    algorithmChange++;
                }
                if (Number(valwe_body["body"]["decline"]) !== Number(reflux_body_decline_rk.val())) {
                    algorithmChange++;
                }
                if (algorithmChange > 5) {
                    if (Number(valwe_head["head"]["timeCycle"]) !== Number(reflux_head_cycle_rk.val())) {
                        reflux_head_cycle_rk.val(valwe_head["head"]["timeCycle"])
                    }
                    if (Number(valwe_head["head"]["timeOn"]) !== Number(reflux_head_time_rk.val())) {
                        reflux_head_time_rk.val(valwe_head["head"]["timeOn"])
                    }
                    if (Number(valwe_body["body"]["timeCycle"]) !== Number(reflux_body_cycle_rk.val())) {
                        reflux_body_cycle_rk.val(valwe_body["body"]["timeCycle"])
                    }
                    if (Number(valwe_body["body"]["timeOn"]) !== Number(reflux_body_time_rk.val())) {
                        reflux_body_time_rk.val(valwe_body["body"]["timeOn"])
                    }
                    if (Number(valwe_body["body"]["decline"]) !== Number(reflux_body_decline_rk.val())) {
                        reflux_body_decline_rk.val(valwe_body["body"]["decline"])
                    }
                    algorithmChange = 0;
                }

            }
        }
        $("#reflux_power_value").text(power_value.toFixed(0)).parent().find(".hidden").removeClass("hidden").addClass("show");


        if (globalSensorsJson["process"]["step"] !== "") {
            let stepProcess = globalSensorsJson["process"]["step"];
            $("#reflux_step").html('Текущая операция: <span class="text-primary">' + stepProcess + '</span>').removeClass("hidden");
        } else {
            $("#reflux_step").html('').addClass("hidden");
        }
        if (Number(globalSensorsJson["process"]["time"]) > 0) {
            let timeProcess = secToTime(Number(globalSensorsJson["process"]["time"]));
            $("#reflux_time").html('Прошло времени: <span class="text-primary">' + timeProcess + '</span>').removeClass("hidden");
        } else {
            $("#reflux_time").html('').addClass("hidden");
        }

        $("#svg_reflux_ten_t").text(power_value.toFixed(0) + "%");
        $("#svg_reflux_color_ten").css('fill', colorPersent("#FF0000", power_value.toFixed(0), 100));
        $("#view_distillation_chart").html("");
        $("#view_mashing_chart").html("");
        $("#view_pid_chart").html("");
        if (!$.fn.objIsEmpty(dtoJson["t"], false) && drowChart) {
            dtoReceiver.start(dtoJson, 'view_reflux_chart');
        }
    }
    if (refluxProcess["start"] === true) {
        $("#svg_reflux_start").css('stroke', "#02b500");
        if (Number(globalSensorsJson["cubeAlcohol"]) > 0) {
            $("#svg_reflux_alco_txt").show();
            $("#svg_reflux_alco_val").show().text(globalSensorsJson["cubeAlcohol"] + "%");
        } else {
            $("#svg_reflux_alco_txt").hide();
            $("#svg_reflux_alco_val").hide().text("");
        }
    }
}