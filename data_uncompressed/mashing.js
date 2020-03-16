function refluxPageLoadComplite() {
    setTimeout(function () {
        pasteMashingSensors(false);
    }, 1000);
}

function pasteMashingSensors(sensors_select) {
    if (objIsEmpty(globalSensorsJson, false) && countError < 10) {
        setTimeout(function () {
            pasteMashingSensors(false);
        }, 1000);
    }
    let sensorsMashingSend = {
        "t1": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t2": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t3": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t4": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t5": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t6": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t7": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "t8": { "name": "", "color": 0, "member": 0, "priority": 0 },
        "pause1": { "name": "", "time": 0, "temperature": 0, "stop": 0 },
        "pause2": { "name": "", "time": 0, "temperature": 0, "stop": 0 },
        "pause3": { "name": "", "time": 0, "temperature": 0, "stop": 0 },
        "pause4": { "name": "", "time": 0, "temperature": 0, "stop": 0 },
        "pause5": { "name": "", "time": 0, "temperature": 0, "stop": 0 }
    };
    let mashingTemplate = '';
    let tpl_pause_body = '';
    let pause_thead = '<div class="col-xs-5 col-xs-offset-0 col-sm-3 col-sm-offset-3 text-center text-middle text-primary">Время паузы</div>' +
        '<div class="col-xs-5 col-xs-offset-0 col-sm-3 col-sm-offset-0 text-center text-middle text-primary">Температура паузы</div>' +
        '<div class="col-xs-2 col-xs-offset-0 col-sm-3 col-sm-offset-0 text-center text-middle text-primary">Стоп в конце</div>';
    let tpl_timer_body = '<div class="row row-striped">' +
        '<div class="pt-10 pb-10 clearfix">' +
        '<div class="col-xs-12 col-sm-4 text-center-xs text-strong">Время до конца паузы</div>' +
        '<div class="col-xs-3 col-xs-offset-1 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="mashing_timer_text"></span><span class="hidden">&nbsp;мин.</span></div>' +
        '<div class="col-xs-3 col-sm-3"></div>' +
        '<div class="col-xs-4 col-sm-3"></div>' +
        '</div>' +
        '</div>';
    if (!sensors_select && objIsEmpty(mashingProcess["sensors"], false)) {
        $.ajax({
            url: ajax_url_debug + 'mashingSensorsGetTpl',
            data: {},
            type: 'GET',
            dataType: 'json',
            success: function (msg) {
                mashingProcess["sensors"] = msg;
                if (!objIsEmpty(mashingProcess["sensors"], false)) {
                    pasteMashingSensors(false);
                }
            },
            error: function (err, exception) {
                alertAjaxError(err, exception, $("#error_mashing"));
            }
        });
    }
    if (!objIsEmpty(mashingProcess["sensors"], false)) {
        let tpl_all_body = '';
        $.each(mashingProcess["sensors"], function (i, e) {
            let sensor_key = i;
            let name_sensor = e["name"];
            if (sensor_key === "t2") {
                name_sensor = "Датчик в струе";
            }
            let stop = Number(e["stop"]);
            let time = e["time"];
            let temperature = e["temperature"];
            $.each(globalSensorsJson["mashing"], function (j, q) {
                let pause_key = Object.keys(q).shift();
                if (sensor_key === pause_key) {
                    stop = e["stop"] = Number(q[pause_key]["stop"]);
                    time = e["time"] = Number(q[pause_key]["time"]);
                    temperature = e["temperature"] = Number(q[pause_key]["temperature"]);
                }
            });
            if (sensorsMashingSend[sensor_key].hasOwnProperty("name")) {
                sensorsMashingSend[sensor_key]["name"] = name_sensor;
            }
            if (re_t.test(sensor_key) && Number(e["member"]) !== 0) {
                sensorsMashingSend[sensor_key]["color"] = e["color"];
                sensorsMashingSend[sensor_key]["member"] = 1;
                sensorsMashingSend[sensor_key]["priority"] = e["priority"];
                tpl_all_body += '<div class="row row-striped">' +
                    '<div class="pt-10 pb-10 clearfix">' +
                    '<div class="col-xs-12 col-sm-4 text-center-xs text-strong" id="mashing_step_text_' + sensor_key + '">t&#176' + name_sensor + '</div>' +
                    '<div class="col-xs-12 col-xs-offset-0 col-sm-3 col-sm-offset-0 text-center text-middle text-strong"><span id="mashing_' + sensor_key + '"></span><span' +
                    ' class="hidden">&#176С</span></div>' +
                    '<div class="col-xs-0 col-sm-3"></div>' +
                    '<div class="col-xs-0 col-sm-3"></div>' +
                    '</div>' +
                    '</div>';
            }
            if (re_pause.test(sensor_key)) {
                tpl_pause_body += returnTplHtml([{ pause_thead: pause_thead, pause_name: name_sensor, id_stop: "mashing_stop_" + sensor_key, checked_stop: (stop === 1 ? "checked" : ''), id_time: "mashing_time_" + sensor_key, value_time: time, id_temperature: "mashing_temperature_" + sensor_key, value_temperature: temperature, id_step_bg: "mashing_step_bg_" + sensor_key, id_step_text: "mashing_step_text_" + sensor_key }], pauseTempl);
                pause_thead = '';
            }
        });
        if (tpl_all_body !== '') {
            mashingTemplate += tpl_all_body;
        }
    }
    if (mashingTemplate !== '') {
        if (sensors_select) {
            sendRequest("mashingSensorsSetSave", sensorsMashingSend, "json", false, false, $("#error_mashing"), false);
        }
        mashingTemplate = mashingTemplate + tpl_timer_body + tpl_pause_body;
        $("#mashing_start_group_button").removeClass("hidden");
        $("#mashing_group_volume").removeClass("hidden");
        $("#mashing_volume").val(soundVolume);
    } else {
        $("#mashing_start_group_button").addClass("hidden");
        $("#mashing_group_volume").addClass("hidden");
        if (sensors_select) {
            mashingProcess["sensors"] = {};
            $.fn.pasteMashingSensors(false);
        }
    }
    $("#mashing_process").html(mashingTemplate);
    if (mashingProcess["start"] === true) {
        getMashing();
        $('#mashing_start').prop("disabled", true);
        $('#mashing_add_sensor').parent().addClass("hidden");
        // $('#mashing_add_sensor').prop("disabled", true);
    } else {
        $('#mashing_stop').prop("disabled", true);
        $('#mashing_add_sensor').parent().removeClass("hidden");
        // $('#mashing_add_sensor').prop("disabled", false);
    }
}

//Привязка датчиков к процессу затирания, и запуск
let mashingProcess = { "sensors": {}, "power": 0, "start": false };
$(document).on('click', '#mashing_add_sensor', function (e) {
    e.preventDefault();
    let _this = $(this);
    sendRequest("mashingSensorsSetLoad", {}, "json", selectSensorsMashing, _this, $("#error_mashing"), false);
});

//Запрос датчиков для затирания и вывод их в диалоговое окно
function selectSensorsMashing(data) {
    let sensors = data;
    //console.log(sensors);
    if (sensors !== null) {
        let section = '<section id="mashing_sensors" class="table-responsive"><table class="table table-noborder">';
        let tpl_temperature = '';
        for (let key in sensors) {
            if (sensors.hasOwnProperty(key)/* && key !== "p1"*/) {
                let sensor_name = (sensors[key].hasOwnProperty("name") ? sensors[key]["name"] : "");
                if (sensor_name !== "") {
                    if (re_t.test(key)) {
                        let sensor_priority = '<label class="checkbox-inline"><input disabled id="priority_' + key + '" name="mashing_radio[]" type="radio" value="Y">Приоритет</label>';
                        let jscolor = sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF";

                        tpl_temperature += '<tr><td>' +
                            '<div class="input-group input-group-sm">' +
                            '<span class="input-group-addon" style="background-color: #' + jscolor + '">' + key + '</span>' +
                            '<input readonly id="mashing_name_' + key + '" class="form-control input-sm" type="text" value="' + sensor_name + '">' +
                            '<input type="hidden" id="mashing_color_' + key + '" value="' + jscolor + '">' +
                            '</div></td>' +
                            '<td><input data-sensor="' + key + '" type="checkbox" value="' + key + '"></td>' +
                            '<td>' + sensor_priority + '</td>' +
                            '</tr>';
                    }
                }
            }
        }
        if (tpl_temperature !== '') {
            section += '<tr><td colspan="4" class="text-center text-strong">Датчики температуры</td></tr>' + tpl_temperature;
        }
        section += '</table></section>';
        $.fn.openModal('Выбор датчиков для затирания', section, "modal-md", false, {
            text: "Выбрать",
            id: "sensors_select",
            class: "btn btn-success",
            click: function () {
                mashingProcess["sensors"] = {};
                let sensors_select = $('#mashing_sensors input[type=checkbox]');
                $.map(sensors_select, function (e) {
                    if ($(e).is(":checked")) {
                        let key = $(e).data("sensor");
                        let tmp = false;
                        if (re_t.test(key)) {
                            tmp = true;
                        }
                        let name = $("#mashing_name_" + key).val();
                        let val_color = (tmp ? $("#mashing_color_" + key).val() : "");
                        let color = (val_color !== "FFFFFF" && val_color !== "") ? Number(hex2dec(val_color)) : 0;
                        let priority = (tmp ? $("#priority_" + key).prop("checked") : false);

                        mashingProcess["sensors"][key] = {};
                        if (tmp) {
                            if (key === "t2") {
                                name = "Датчик в струе";
                            }
                            mashingProcess["sensors"][key] = { "name": name, "priority": (priority ? 1 : 0), "color": color, "member": 1 };
                        }
                    }
                });
                if (!$.fn.objIsEmpty(mashingProcess["sensors"], false)) {
                    mashingProcess["sensors"]["pause1"] = { "name": "Кислотная пауза", "time": 20, "temperature": 40, "stop": 0 };
                    mashingProcess["sensors"]["pause2"] = { "name": "Белковая пауза", "time": 20, "temperature": 55, "stop": 0 };
                    mashingProcess["sensors"]["pause3"] = { "name": "Осахаривание", "time": 30, "temperature": 63, "stop": 0 };
                    mashingProcess["sensors"]["pause4"] = { "name": "Осахаривание", "time": 60, "temperature": 67, "stop": 0 };
                    mashingProcess["sensors"]["pause5"] = { "name": "Мэш аут", "time": 10, "temperature": 78, "stop": 0 };

                }
                $(this).closest(".modal").modal("hide");
                $.fn.pasteMashingSensors(true);
            }
        },
            { id: "modal_sensors_select" }
        );
    }
}

$(document).on('click', '#mashing_sensors input[type=checkbox]', function () {
    let checked = !$(this).prop("checked");
    let radio_priority = $("#priority_" + $(this).data("sensor"));
    radio_priority.prop("disabled", checked);
    if (checked) {
        radio_priority.prop("checked", false);
    }
});

function launchMashing() {
    curProcess = 3;
    countProcess = 0;
    mashingProcess["start"] = flagSendProcess = true;
    $('#mashing_start').prop("disabled", true);
    $('#mashing_add_sensor').parent().addClass("hidden");
    // $('#mashing_add_sensor').prop("disabled", true);
    $('#mashing_stop').prop("disabled", false);
    clearInterval(sensorsProcessId);
    stopInterval();
    localStorage.setObj('oldStartProcess', 3);
    setTimeout(function () {
        setMashing();
    }, 1000);
}
$(document).on('start-event', '#mashing_start', function (e) {
    console.log("start-event-Mashing");
    launchMashing()
});
$(document).on('click', '#mashing_start', function () {
    $.fn.openModal('', '<p class="text-center text-danger text-strong">Будет запущен процесс затирания, убедитесь в том, что тэн залит жидкостью!</p>', "modal-sm", false, [{
        text: "Да",
        id: "return_restart",
        class: "btn btn-primary btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
            launchMashing();
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
$(document).on('click', '#mashing_stop', function () {
    $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите остановить процесс затирания?</p>', "modal-sm", false, [{
        text: "Да",
        id: "return_restart",
        class: "btn btn-primary btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
            stopMashing()
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
function stopMashing() {
    $('#mashing_stop').prop("disabled", true);
    $('#mashing_add_sensor').parent().removeClass("hidden");
    // $('#mashing_add_sensor').prop("disabled", false);
    $('#mashing_start').prop("disabled", false);
    $("#svg_mashing_start").css('stroke', "#000000");
    clearInterval(sensorsProcessId);
    // clearInterval(sensorsIntervalId);
    stopInterval();
    flagSendProcess = true;
    globalSensorsJson["process"]["allow"] = 0;
    curProcess = 0;
    countProcess = 0;
    mashingProcess["start"] = false;
    setMashing();
}

$(document).on('stop-event', '#mashing_stop', function (e) {
    stopMashing()
});

//Установка значений для затирания
function setMashing() {
    console.log("setMashing");
    if ($.fn.objIsEmpty(mashingProcess["sensors"], false)) {
        setTimeout(function () {
            setMashing();
        }, 1000);
    } else {
        let mashingSendData = {
            "process": { "allow": 0, "number": 0 },
            "pause1": { "time": 0, "temperature": 0, "stop": 0 },
            "pause2": { "time": 0, "temperature": 0, "stop": 0 },
            "pause3": { "time": 0, "temperature": 0, "stop": 0 },
            "pause4": { "time": 0, "temperature": 0, "stop": 0 },
            "pause5": { "time": 0, "temperature": 0, "stop": 0 }
            //,"power": 0
        };
        mashingSendData["process"]["allow"] = (mashingProcess["start"] ? 3 : 0);

        $.each(globalSensorsJson["mashing"], function (i, e) {
            let sensor_key = Object.keys(e).shift();
            let mashing_time = $("#mashing_time_" + sensor_key);
            let mashing_temperature = $("#mashing_temperature_" + sensor_key);
            let mashing_stop = $("#mashing_stop_" + sensor_key);
            if (mashing_time.length) {
                if (e["time"] !== mashing_time.val()) {
                    flagSendProcess = true;
                }
                mashingSendData[sensor_key]["time"] = mashing_time.val();
            }
            if (mashing_temperature.length) {
                if (e["temperature"] !== mashing_temperature.val()) {
                    flagSendProcess = true;
                }
                mashingSendData[sensor_key]["temperature"] = mashing_temperature.val();
            }
            if (mashing_stop.length) {
                let stop = Number(mashing_stop.prop("checked"));
                if (e["stop"] !== stop) {
                    flagSendProcess = true;
                }
                mashingSendData[sensor_key]["stop"] = stop;
            }
        });
        if (flagSendProcess) {
            console.log(mashingProcess);
            flagSendProcess = false;
            clearInterval(sensorsProcessId);
            // clearInterval(sensorsIntervalId);
            stopInterval();
            sendRequest("SensorsIn", mashingSendData, "json", startMashing, false, $("#error_mashing"), false);

        }
    }
}
// $(document).on('mousedown',"#mashing_process input", function () {
// 	flagSendProcess = true;
// });
$(document).on('change', "#mashing_process input",
    $.debounce(function () {
        flagButtonPress = false;
        // flagSendProcess = true;
        if (mashingProcess["start"] === true) {
            setMashing();
            console.log("debounce input")
        }
    }, 300)
);
function startMashing() {
    flagSendProcess = false;
    console.log("startMashing");
    setTimeout(function () {
        clearInterval(sensorsProcessId);
        // clearInterval(sensorsIntervalId);
        stopInterval();
        startInterval();
        // sensorsIntervalId = setInterval(getIntervalSensors, 1000);
        if (mashingProcess["start"] === true) {
            sensorsProcessId = setInterval(getMashing, 2000);
        }
    }, 2000);
}
function getMashing() {
    //let sek= parseInt(+new Date()/1000);
    //console.log(flagSendProcess,"getMashing"+sek);
    if (!$.fn.objIsEmpty(globalSensorsJson, false)) {
        let dtoJson = {};
        dtoJson["h"] = Number(globalSensorsJson["power"]);
        dtoJson["t"] = {};
        $.each(globalSensorsJson["sensors"], function (i, e) {
            let sensor_key = Object.keys(e).shift();
            let sensor_value = Number(globalSensorsJson["sensors"][i][sensor_key]["value"]);
            $.each(mashingProcess["sensors"], function (j, q) {
                if (j === sensor_key && re_t.test(sensor_key)) {
                    q["value"] = sensor_value;
                    let color_value = q["color"];
                    let fillcolor = "#" + dec2hex(color_value);
                    $("#svg_mashing_color_" + sensor_key).css('fill', colorPersent(fillcolor, sensor_value, 0));
                    if (Number(q["member"]) !== 0) {
                        dtoJson["t"][sensor_key] = sensor_value;
                    }
                }
            });
            $("#mashing_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
            //svg
            if (sensor_value < 150) {
                $("#svg_mashing_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
            } else {
                $("#svg_mashing_" + sensor_key).text('');
            }
        });
        let time_cur_pause = 0;
        let step_pause = 0;
        let stop_pause = 0;
        $.each(globalSensorsJson["mashing"], function (i, e) {
            let pause_key = Object.keys(e).shift();
            let step = Number(e[pause_key]["step"]);
            let stop = Number(e[pause_key]["stop"]);
            let time = Number(e[pause_key]["time"]);
            if (step > 0) {
                time_cur_pause = time;
                step_pause = 1;
                if (stop > 0) {
                    stop_pause = 1;
                }
            }

            let temperature = Number(e[pause_key]["temperature"]);

            if (!flagSendProcess && !flagButtonPress) {
                //убрал пока
                // $("#mashing_time_" + pause_key).val(time);
                // $("#mashing_temperature_" + pause_key).val(temperature);
                // if (stop > 0) {
                // 	$("#mashing_stop_" + pause_key).prop("checked", true);
                // } else {
                // 	$("#mashing_stop_" + pause_key).prop("checked", false);
                // }
                let mashing_time = $("#mashing_time_" + pause_key);
                let mashing_temperature = $("#mashing_temperature_" + pause_key);
                let mashing_stop = $("#mashing_stop_" + pause_key);
                if (mashing_time.length && mashing_temperature.length && mashing_stop.length) {
                    if (time !== Number(mashing_time.val())) {
                        mashingChange++;
                    }
                    if (temperature !== Number(mashing_temperature.val())) {
                        mashingChange++;
                    }
                    if (stop !== Number(mashing_stop.prop("checked"))) {
                        mashingChange++;
                    }
                    if (mashingChange > 5) {
                        if (time !== Number(mashing_time.val())) {
                            mashing_time.val(time);
                        }
                        if (temperature !== Number(mashing_temperature.val())) {
                            mashing_temperature.val(temperature);
                            // mashingProcess["sensors"][]
                            // mashing_temperature.change();
                        }
                        if (stop !== Number(mashing_stop.prop("checked"))) {
                            if (stop > 0) {
                                mashing_stop.prop("checked", true);
                            } else {
                                mashing_stop.prop("checked", false);
                            }
                        }
                        mashingChange = 0;
                    }
                }

            }
            if (step > 0) {
                $("#mashing_step_bg_" + pause_key).addClass("bg-success");
                $("#mashing_step_text_" + pause_key).addClass("text-success");
            } else {
                $("#mashing_step_bg_" + pause_key).removeClass("bg-success");
                $("#mashing_step_text_" + pause_key).removeClass("text-success");
            }

        });
        let power_value = Number(globalSensorsJson["power"]);
        let global_time = (Number(globalSensorsJson["process"]["time"]) / 60).toFixed(1);
        let timer_value = (time_cur_pause - global_time).toFixed(1);
        if (time_cur_pause > 0 && step_pause > 0) {
            $("#mashing_timer_text").text(">" + time_cur_pause).parent().find(".hidden").removeClass("hidden").addClass("show");
        }
        if (timer_value > 0 && global_time > 0) {
            $("#mashing_timer_text").text(timer_value).parent().find(".hidden").removeClass("hidden").addClass("show");
        }
        if (step_pause > 0 && stop_pause > 0 && timer_value < 0) {
            $("#mashing_timer_text").text("Пауза").parent().find(".show").removeClass("show").addClass("hidden");
        }

        $("#svg_mashing_ten_t").text(power_value.toFixed(0) + "%");
        $("#svg_mashing_color_ten").css('fill', colorPersent("#FF0000", power_value.toFixed(0), 100));
        $("#view_reflux_chart").html("");
        $("#view_distillation_chart").html("");
        $("#view_pid_chart").html("");
        if (!$.fn.objIsEmpty(dtoJson["t"], false) && drowChart) {
            dtoReceiver.start(dtoJson, 'view_mashing_chart');
        }
    }
    if (mashingProcess["start"] === true) {
        $("#svg_mashing_start").css('stroke', "#02b500");
    }
}