<style>
</style>

<script>
    import DistSVG from "./DistSVG.svelte";
    import Volume from "./Volume.svelte";

    let distillation_volume = 0;
    let isStart = false;

    function startStop() {
        isStart = !isStart;
    }

    //Привязка датчиков к процессу дистилляции, и запуск
    let distillationProcess = {
        "sensors": {},
        "powerHigh": 0,
        "powerLower": 0,
        "start": false,
        "transitionTemperature": 0
    };

    function add_sensor() {
        sendRequest("distillationSensorsSetLoad", {}, "json", selectSensorsDistillation, _this, $("#error_distillation"), false);
    }
    
    //Запрос датчиков для дистилляции и вывод их в диалоговое окно
    function selectSensorsDistillation(data) {
        let sensors = data;//sensorsJson
        //console.log(sensors);
        if (sensors !== null) {
            let section = '<section id="distillation_sensors" class="table-responsive"><table class="table table-noborder">';
            let tpl_temperature = '';
            let tpl_devices = '';
            let tpl_safety = '';
            let tpl_stab = '';
            for (let key in sensors) {
                if (sensors.hasOwnProperty(key)/* && key !== "p1"*/) {
                    let sensor_name = (sensors[key].hasOwnProperty("name") ? sensors[key]["name"] : "");
                    if (sensor_name !== "") {
                        if (re_t.test(key)) {
                            let sensor_cutoff = '<label class="checkbox-inline"><input disabled id="cutoff_' + key + '" name="distillation_radio_' + key + '" type="radio" value="Y">Отсечка</label>';
                            let jscolor = sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF";

                            tpl_temperature += '<tr><td>' +
                                '<div class="input-group input-group-sm">' +
                                '<span class="input-group-addon" style="background-color: #' + jscolor + '">' + key + '</span>' +
                                '<input readonly id="distillation_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
                                '<input type="hidden" id="distillation_color_' + key + '" value="' + jscolor + '">' +
                                '</div></td>' +
                                '<td><input data-sensor="' + key + '" type="checkbox" value="' + key + '"></td>' +
                                '<td>' + sensor_cutoff + '</td>' +
                                '</tr>';
                        }
                        if (re_out.test(key)) {
                            tpl_devices += '<tr><td>' +
                                '<div class="input-group input-group-sm">' +
                                '<span class="input-group-addon">' + key + '</span>' +
                                '<input readonly id="distillation_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
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
                                '<input readonly id="distillation_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
                                '</div></td>' +
                                '<td><input data-sensor="' + key + '" type="checkbox" value="' + key + '"></td>' +
                                '<td></td>' +
                                '<td></td>' +
                                '</tr>';
                        }
                    }

                    if (key === "transitionTemperature") {
                        tpl_stab += '<tr>' +
                            '<td>Температура в кубе перехода на рабочую мощность</td>' +
                            '<td colspan="3" class="text-center">' + returnTplHtml([{ id: "transitionTemperature", value: sensors[key], min: '60', max: '100', step: '1' }], deltaTempl) + '</td>' +
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
            $.fn.openModal('Выбор датчиков для дистилляции', section, "modal-md", false, {
                text: "Выбрать",
                id: "sensors_select",
                class: "btn btn-success",
                click: function () {
                    distillationProcess["sensors"] = {};
                    let sensors_select = $('#distillation_sensors input[type=checkbox]');
                    $.map(sensors_select, function (e) {
                        if ($(e).is(":checked")) {
                            let key = $(e).data("sensor");
                            let tmp = false;
                            if (re_t.test(key)) {
                                tmp = true;
                            }
                            let name = $("#distillation_name_" + key).val();
                            let val_color = (tmp ? $("#distillation_color_" + key).val() : "");
                            let color = (val_color !== "FFFFFF" && val_color !== "") ? Number(hex2dec(val_color)) : 0;
                            let cutoff = (tmp ? Number($("#cutoff_" + key).prop("checked")) : 0);

                            distillationProcess["sensors"][key] = {};
                            if (tmp) {
                                distillationProcess["sensors"][key] = { "name": name, "cutoff": cutoff, "color": color, "allertValue": 0, "value": 0, "member": 1 };
                            } else {
                                distillationProcess["sensors"][key] = { "name": name, "value": 0, "member": 1 };
                            }
                        }
                    });
                    distillationProcess["transitionTemperature"] = Number($("#transitionTemperature").val());
                    $(this).closest(".modal").modal("hide");
                    $.fn.pasteDistillationSensors(true);
                }
            },
                { id: "modal_sensors_select" }
            );
        }
    }

    $(document).on('click', '#distillation_sensors input[type=checkbox]', function () {
        let checked = !$(this).prop("checked");
        let radio_cutoff = $("#cutoff_" + $(this).data("sensor"));
        radio_cutoff.prop("disabled", checked);
        if (checked) {
            radio_cutoff.prop("checked", false);
        }
    });

    $.fn.pasteDistillationSensors = function (sensors_select) {
        if ($.fn.objIsEmpty(globalSensorsJson, false) && countError < 10) {
            setTimeout(function () {
                //console.log("distillationTemplate",globalSensorsJson);
                $.fn.pasteDistillationSensors(false);
            }, 1000);
        }
        let sensorsDistillationSend = {
            "t1": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t2": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t3": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t4": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t5": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t6": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t7": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
            "t8": { "name": "", "cutoff": 0, "color": 0, "member": 0, "priority": 0, "allertValue": 0 },
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
            "transitionTemperature": 0
        };
        let distillationTemplate = '';
        let tpl_devices_body = '';
        let tpl_safety_body = '';
        if (!sensors_select && $.fn.objIsEmpty(distillationProcess["sensors"], false)) {
            $.ajax({
                url: ajax_url_debug + 'distillationSensorsGetTpl',
                data: {},
                type: 'GET',
                dataType: 'json',
                success: function (msg) {
                    distillationProcess["sensors"] = msg;
                    distillationProcess["powerHigh"] = Number(msg["powerHigh"]);
                    distillationProcess["powerLower"] = Number(msg["powerLower"]);
                    //console.log('distillationSensorsGetTpl',distillationProcess["sensors"]);
                    if (!$.fn.objIsEmpty(distillationProcess["sensors"], false)) {
                        $.fn.pasteDistillationSensors(false);
                    }
                },
                error: function (err, exception) {
                    alertAjaxError(err, exception, $("#error_distillation"));
                }
            });
        }
        if (!$.fn.objIsEmpty(distillationProcess["sensors"], false)) {
            let tpl_cutoff_thead =
                '<div class="row-xs clearfix">' +
                '<div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-4 text-center text-middle text-primary">Значение</div>' +
                '<div class="col-xs-4 col-xs-offset-3 col-sm-3 col-sm-offset-2 text-center text-middle text-primary">Отсечка</div>' +
                '</div>';
            let tpl_cutoff_body = '';
            let tpl_all_body = '';
            sensorsDistillationSend["transitionTemperature"] = distillationProcess["transitionTemperature"];
            $.each(distillationProcess["sensors"], function (i, e) {
                //console.log(i,e);
                let sensor_key = i;
                //let name_sensor = e["name"];
                if (e.hasOwnProperty("name") && sensorsDistillationSend[sensor_key].hasOwnProperty("name")) {
                    sensorsDistillationSend[sensor_key]["name"] = e["name"];
                }
                if (re_t.test(sensor_key) && Number(e["member"]) !== 0) {
                    sensorsDistillationSend[sensor_key]["color"] = e["color"];
                    sensorsDistillationSend[sensor_key]["member"] = 1;

                    let tpl_cutoff = '';
                    if (e["cutoff"]) {
                        sensorsDistillationSend[sensor_key]["cutoff"] = 1;
                        tpl_cutoff = returnTplHtml([{ id: "distillation_cutoff_" + sensor_key, value: e["allertValue"], min: '0', max: '105', step: '0.5' }], deltaTempl);
                        tpl_cutoff_body +=
                            '<div class="row row-striped">' + tpl_cutoff_thead +
                            '<div id="distillation_alert_bg_' + sensor_key + '" class="pt-10 pb-10 clearfix">' +
                            '<div id="distillation_alert_text_' + sensor_key + '" class="col-xs-12 col-sm-4 text-middle text-center-xs text-strong">t&#176' + e["name"] + '</div>' +
                            '<div class="col-xs-4 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="distillation_' + sensor_key + '"></span><span' +
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
                            '<div class="col-xs-4 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="distillation_' + sensor_key + '"></span><span' +
                            ' class="hidden">&#176С</span></div>' +
                            '<div class="col-xs-3 col-sm-3"></div>' +
                            '<div class="col-xs-3 col-sm-3"></div>' +
                            '</div>' +
                            '</div>';
                    }
                }
                if (re_out.test(sensor_key) && Number(e["member"]) !== 0) {
                    sensorsDistillationSend[sensor_key]["member"] = 1;
                    tpl_devices_body += '<div class="row row-striped">' +
                        '<div class="pt-10 pb-10 clearfix">' +
                        '<div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">' + e["name"] + '</div>' +
                        '<div class="col-xs-5 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-strong">' +
                        '<span id="distillation_' + sensor_key + '" class="box-green hidden"><span class="glyphicon">✔</span></span></div>' +
                        '</div></div>';
                }
                if (re_in.test(sensor_key) && Number(e["member"]) !== 0) {
                    sensorsDistillationSend[sensor_key]["member"] = 1;
                    tpl_safety_body += '<div class="row row-striped">' +
                        '<div id="distillation_alert_bg_' + sensor_key + '" class="pt-10 pb-10 clearfix">' +
                        '<div id="distillation_alert_text_' + sensor_key + '" class="col-xs-12 col-sm-4 text-center-xs text-strong">' + e["name"] + '</div>' +
                        '<div class="col-xs-5 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong">' +
                        '<span id="distillation_' + sensor_key + '"></span> <span class="hidden"></span></div>' +
                        '</div></div>';
                }
            });
            if (tpl_cutoff_body !== '') {
                distillationTemplate += tpl_cutoff_thead + tpl_cutoff_body;
            }
            if (tpl_all_body !== '') {
                distillationTemplate += tpl_all_body;
            }
        }
        if (distillationTemplate !== '') {
            //console.log(sensorsDistillationSend);
            if (sensors_select) {
                sendRequest("distillationSensorsSetSave", sensorsDistillationSend, "json", false, false, $("#error_distillation"), false);
                //console.log("distillationSensorsSetSave",sensorsDistillationSend);
            }
            let timeStepTemplate = '<div class="row row-striped">' +
                '<div id="distillation_step" class="col-xs-12 col-md-6 text-center-xs text-middle text-strong hidden"></div>' +
                '<div id="distillation_time" class="col-xs-12 col-md-6 text-center-xs text-middle text-strong hidden"></div>' +
                '</div>';
            distillationTemplate = timeStepTemplate +
                returnTplHtml([{ id_value: "distillation_power_value", id_set: "distillation_power_set" }], powerTempl) +
                returnTplHtml([{ id_lower_set: "distillation_power_lower_set" }], powerLowerTempl) +
                distillationTemplate + tpl_devices_body + tpl_safety_body;
            $("#distillation_start_group_button").removeClass("hidden");
            $("#distillation_group_volume").removeClass("hidden");
            $("#distillation_volume").val(soundVolume);
        } else {
            $("#distillation_start_group_button").addClass("hidden");
            $("#distillation_group_volume").addClass("hidden");
            if (sensors_select) {
                distillationProcess["sensors"] = {};
                $.fn.pasteDistillationSensors(false);
            }
        }
        $("#distillation_process").html(distillationTemplate);
        $("#distillation_power_set").val(distillationProcess["powerHigh"]);
        $("#distillation_power_lower_set").val(distillationProcess["powerLower"]);

        if (distillationProcess["start"] === true) {
            //console.log('distillationProcess');
            getDistillation();
            $('#distillation_start').prop("disabled", true);
            $('#distillation_add_sensor').parent().addClass("hidden");
            // $('#distillation_add_sensor').prop("disabled", true);
        } else {
            $('#distillation_stop').prop("disabled", true);
            $('#distillation_add_sensor').parent().removeClass("hidden");
            // $('#distillation_add_sensor').prop("disabled", false);
        }
    };

    function launchDistillation() {
        curProcess = 1;
        countProcess = 0;
        distillationProcess["start"] = flagSendProcess = true;
        $('#distillation_start').prop("disabled", true);
        // $('#distillation_add_sensor').prop("disabled", true);
        $('#distillation_add_sensor').parent().addClass("hidden");
        $('#distillation_stop').prop("disabled", false);
        clearInterval(sensorsProcessId);
        stopInterval();
        localStorage.setObj('oldStartProcess', 1);
        // setDistillation();
        setTimeout(function () {
            setDistillation();
        }, 1000);
    }
    $(document).on('start-event', '#distillation_start', function (e) {
        console.log("start-event-Distillation");
        launchDistillation()
    });
    $(document).on('click', '#distillation_start', function () {
        $.fn.openModal('', '<p class="text-center text-danger text-strong">Будет запущен процесс дистилляции, убедитесь в том, что тэн залит жидкостью!</p>', "modal-sm", false, [{
            text: "Да",
            id: "return_restart",
            class: "btn btn-primary btn-sm",
            click: function () {
                $(this).closest(".modal").modal("hide");
                launchDistillation();
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
    $(document).on('click', '#distillation_stop', function () {
        $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите остановить процесс дистилляции?</p>', "modal-sm", false, [{
            text: "Да",
            id: "return_restart",
            class: "btn btn-primary btn-sm",
            click: function () {
                $(this).closest(".modal").modal("hide");
                stopDistillation()
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
    function stopDistillation() {
        $('#distillation_stop').prop("disabled", true);
        // $('#distillation_add_sensor').prop("disabled", false);
        $('#distillation_add_sensor').parent().removeClass("hidden");
        $('#distillation_start').prop("disabled", false);
        $("#svg_distillation_start").css('stroke', "#000000");
        $("#svg_distillation_alco_txt").hide();
        $("#svg_distillation_alco_val").hide().text("");
        $("#distillation_time").html('').addClass("hidden");
        $("#distillation_step").html('').addClass("hidden");
        $("#distillation_process").find("div.bg-danger").removeClass("bg-danger");
        $("#distillation_process").find("div.text-danger").removeClass("text-danger");
        clearInterval(sensorsProcessId);
        // clearInterval(sensorsIntervalId);
        stopInterval();
        flagSendProcess = true;
        globalSensorsJson["process"]["allow"] = 0;
        curProcess = 0;
        countProcess = 0;
        distillationProcess["start"] = false;
        setDistillation();
    }

    $(document).on('stop-event', '#distillation_stop', function (e) {
        stopDistillation()
    });

    //Установка значений для дистилляции
    function setDistillation() {
        console.log("setDistillation");
        if ($.fn.objIsEmpty(distillationProcess["sensors"], false)) {
            console.log("distillationProcess empty");
            setTimeout(function () {
                setDistillation();
            }, 1000);
        } else {
            let distillationSendData = {
                "process": { "allow": 0, "number": 0 },
                "t1": { "allertValue": 0 },
                "t2": { "allertValue": 0 },
                "t3": { "allertValue": 0 },
                "t4": { "allertValue": 0 },
                "t5": { "allertValue": 0 },
                "t6": { "allertValue": 0 },
                "t7": { "allertValue": 0 },
                "t8": { "allertValue": 0 },
                "powerHigh": 0,
                "powerLower": 0
            };
            //let flag_send = false;
            let power_set = $("#distillation_power_set");
            let power_lower_set = $("#distillation_power_lower_set");
            distillationSendData["process"]["allow"] = (distillationProcess["start"] ? 1 : 0);
            if (distillationProcess["powerHigh"] !== Number(power_set.val())) {
                flagSendProcess = true;
            }
            if (distillationProcess["powerLower"] !== Number(power_lower_set.val())) {
                flagSendProcess = true;
            }
            distillationSendData["powerHigh"] = distillationProcess["powerHigh"] = Number(power_set.val());
            distillationSendData["powerLower"] = distillationProcess["powerLower"] = Number(power_lower_set.val());

            $.each(distillationProcess["sensors"], function (i, e) {
                let sensor_key = i;
                let distillation_cutoff = $("#distillation_cutoff_" + sensor_key);
                if (distillation_cutoff.length) {
                    if (e["allertValue"] !== distillation_cutoff.val()) {
                        flagSendProcess = true;
                    }
                    distillationSendData[sensor_key]["allertValue"] = e["allertValue"] = distillation_cutoff.val();
                }
            });
            if (flagSendProcess) {
                flagSendProcess = false;
                clearInterval(sensorsProcessId);
                // clearInterval(sensorsIntervalId);
                stopInterval();
                sendRequest("SensorsIn", distillationSendData, "json", startDistillation, false, $("#error_distillation"), false);
            }
        }
    }
    // $(document).on('mousedown',"#distillation_process input", function () {
    // flagSendProcess = true;
    // flagButtonPress = true;
    // });
    $(document).on('change', "#distillation_process input",
        $.debounce(function () {
            flagButtonPress = false;
            // flagSendProcess = true;
            if (distillationProcess["start"] === true) {
                setDistillation();
            }
        }, 300)
    );
    function startDistillation() {
        console.log("startDistillation");
        setTimeout(function () {
            clearInterval(sensorsProcessId);
            // clearInterval(sensorsIntervalId);
            stopInterval();
            startInterval();
            // sensorsIntervalId = setInterval(getIntervalSensors, 1000);
            if (distillationProcess["start"] === true) {
                sensorsProcessId = setInterval(getDistillation, 2000);
            }
        }, 2000);
    }

    function getDistillation() {
        console.log(flagSendProcess, "getDistillation");
        //let sek= parseInt(+new Date()/1000);
        //console.log(flagSendProcess,"getDistillation"+sek);
        if (!$.fn.objIsEmpty(globalSensorsJson, false)) {
            let dtoJson = {};
            dtoJson["h"] = Number(globalSensorsJson["power"]);
            dtoJson["t"] = {};
            $.each(globalSensorsJson["sensors"], function (i, e) {
                let sensor_key = Object.keys(e).shift();
                if (re_t.test(sensor_key)) {
                    let sensor_value = Number(globalSensorsJson["sensors"][i][sensor_key]["value"]);
                    let alert_value = Number(globalSensorsJson["sensors"][i][sensor_key]["allertValue"]);
                    $.each(distillationProcess["sensors"], function (j, q) {
                        if (j === sensor_key && re_t.test(sensor_key)) {
                            q["value"] = sensor_value;
                            let color_value = q["color"];
                            let fillcolor = "#" + dec2hex(color_value);
                            if (alert_value > 0 && sensor_value >= alert_value) {
                                $("#distillation_alert_bg_" + sensor_key).addClass("bg-danger");
                                $("#distillation_alert_text_" + sensor_key).addClass("text-danger");
                            } else {
                                $("#distillation_alert_bg_" + sensor_key).removeClass("bg-danger");
                                $("#distillation_alert_text_" + sensor_key).removeClass("text-danger");
                            }
                            $("#svg_distillation_color_" + sensor_key).css('fill', colorPersent(fillcolor, sensor_value, alert_value));
                            if (Number(q["member"]) !== 0) {
                                dtoJson["t"][sensor_key] = sensor_value;
                            }

                            $("#distillation_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                            //убрал пока
                            if (!flagSendProcess && !flagButtonPress) {
                                if ($("#distillation_cutoff_" + sensor_key).length) {
                                    //console.log(countChange, $("#distillation_cutoff_" + sensor_key).val(), alert_value);
                                    if (Number($("#distillation_cutoff_" + sensor_key).val()) !== alert_value) {
                                        alertChange[sensor_key]++
                                    }
                                    if (alertChange[sensor_key] > 5) {
                                        $("#distillation_cutoff_" + sensor_key).val(alert_value);
                                        //$("#distillation_temperature_" + sensor_key).val(temperature);
                                        alertChange[sensor_key] = 0;
                                    }
                                }
                            }
                            let allertValue = alert_value;
                            allertValue = allertValue > 0 ? allertValue.toFixed(2) : "";
                            if (allertValue !== "") {
                                $("#distillation_cutoff_result_" + sensor_key).text(allertValue).parent().find(".hidden").removeClass("hidden").addClass("show");
                            } else {
                                $("#distillation_cutoff_result_" + sensor_key).text(allertValue).parent().find(".show").removeClass("show").addClass("hidden");
                            }
                            //svg
                            if (sensor_value < 150) {
                                $("#svg_distillation_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
                            } else {
                                $("#svg_distillation_" + sensor_key).text('');
                            }
                        }
                    });
                }
            });
            //Исполнительные устройства
            $.each(globalSensorsJson["devices"], function (i, e) {
                let sensor_key = Object.keys(e).shift();
                //console.log(i,e);
                $.each(distillationProcess["sensors"], function (j, q) {
                    if (j === sensor_key && re_out.test(sensor_key)) {
                        if (Number(distillationProcess["sensors"][sensor_key]["member"]) !== 0) {
                            if (Number(e[sensor_key]["allert"]) !== 0) {
                                $("#distillation_" + sensor_key).removeClass("hidden").addClass("show");
                            } else {
                                $("#distillation_" + sensor_key).removeClass("show").addClass("hidden");
                            }
                        }
                    }
                })
            });
            //Датчики безопасности
            $.each(globalSensorsJson["safety"], function (i, e) {
                let sensor_key = Object.keys(e).shift();
                $.each(distillationProcess["sensors"], function (j, q) {
                    if (j === sensor_key && re_in.test(sensor_key)) {
                        if (Number(distillationProcess["sensors"][sensor_key]["member"]) !== 0) {
                            if (Number(e[sensor_key]["allert"]) !== 0) {
                                $("#distillation_alert_bg_" + sensor_key).addClass("bg-danger");
                                $("#distillation_alert_text_" + sensor_key).addClass("text-danger");
                            } else {
                                $("#distillation_alert_bg_" + sensor_key).removeClass("bg-danger");
                                $("#distillation_alert_text_" + sensor_key).removeClass("text-danger");
                            }
                        }
                    }
                })
            });
            let power_value = Number(globalSensorsJson["power"]);
            //let power_higt_value = distillationProcess["powerHigh"];
            //let power_lower_value = distillationProcess["powerLower"];
            //заполнение поля регулировки тена и рабочей мощности
            if (!flagSendProcess && !flagButtonPress) {
                //$("#distillation_power_set").val(power_higt_value.toFixed(0));
                //$("#distillation_power_lower_set").val(power_lower_value.toFixed(0));

                if (Number($("#distillation_power_set").val()) !== Number(globalSensorsJson["powerHigh"]) ||
                    Number($("#distillation_power_lower_set").val()) !== Number(globalSensorsJson["powerLower"])
                ) {
                    powerChange++
                }
                if (powerChange > 5) {
                    $("#distillation_power_set").val(globalSensorsJson["powerHigh"].toFixed(0));
                    $("#distillation_power_lower_set").val(globalSensorsJson["powerLower"].toFixed(0));
                    powerChange = 0;
                }
            }
            $("#distillation_power_value").text(power_value.toFixed(0)).parent().find(".hidden").removeClass("hidden").addClass("show");

            if (globalSensorsJson["process"]["step"] !== "") {
                let stepProcess = globalSensorsJson["process"]["step"];
                $("#distillation_step").html('Текущая операция: <span class="text-primary">' + stepProcess + '</span>').removeClass("hidden");
            } else {
                $("#distillation_step").html('').addClass("hidden");
            }
            if (Number(globalSensorsJson["process"]["time"]) > 0) {
                let timeProcess = secToTime(Number(globalSensorsJson["process"]["time"]));
                $("#distillation_time").html('Прошло времени: <span class="text-primary">' + timeProcess + '</span>').removeClass("hidden");
            } else {
                $("#distillation_time").html('').addClass("hidden");
            }

            $("#svg_distillation_ten_t").text(power_value.toFixed(0) + "%");
            $("#svg_distillation_color_ten").css('fill', colorPersent("#FF0000", power_value.toFixed(0), 100));
            $("#view_reflux_chart").html("");
            $("#view_mashing_chart").html("");
            $("#view_pid_chart").html("");
            if (!$.fn.objIsEmpty(dtoJson["t"], false) && drowChart) {
                dtoReceiver.start(dtoJson, 'view_distillation_chart');
            }
        }
        if (distillationProcess["start"] === true) {
            $("#svg_distillation_start").css('stroke', "#02b500");
            if (Number(globalSensorsJson["cubeAlcohol"]) > 0) {
                $("#svg_distillation_alco_txt").show();
                $("#svg_distillation_alco_val").show().text(globalSensorsJson["cubeAlcohol"] + "%");
            } else {
                $("#svg_distillation_alco_txt").hide();
                $("#svg_distillation_alco_val").hide().text("");
            }
        }
    }
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->

<div class="container tab-pane theme_grey swipe-tab-content active">
    <div class="row">
        <div id="error_distillation" class="col-md-offset-2 col-md-8" />
    </div>
    <div class="row">
        <div class="col-md-12 fill-height">
            <div class="row mt-10">
                <div class="col-xs-offset-3 col-xs-6 col-sm-3 col-sm-offset-0 svg-container">
                    <DistSVG />
                </div>
                <div class="col-xs-12 col-sm-9">
                    <div id="distillation_process" />
                    <div class="form-group pt-10 clearfix">
                        <button id="distillation_add_sensor" type="button" class="btn btn-primary btn-sm noSwipe" on:click="{add_sensor}">
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
