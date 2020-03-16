//запрос постоянно всех датчиков
let tmpTime = 0;
let stopTime = 10;
let openModalError = false;
let secondInterval = 1000;
let curProcess = 0;
let countProcess = 0;
let countIntervalError = 0;

function sensorsPageLoadComplite() {
    InitSensors();
}

function InitSensors() {
    fillSensors('#t_sensors', '.t_sensor', 't', 8);
    fillSensors('#out_sensors', '.out_sensor', 'out', 4);
    fillSensors('#in_sensors', '.in_sensor', 'in', 4);
}

function fillSensors(containerName, elementName, name, num) {
    t_sensors = document.querySelector(containerName);
    t_sensor = document.querySelector(elementName);
    sensorHTML = t_sensor.innerHTML;
    for (let index = 2; index <= num; index++) {
        newNode = t_sensor.cloneNode(false);
        newNode.innerHTML = sensorHTML;
        var re = new RegExp(name + '1', 'g');
        newNode.innerHTML = newNode.innerHTML.replace(re, name + index);
        t_sensors.appendChild(newNode);
    }
}

function countTimeError() {
    $("#modal_time_out").text('Запрос датчиков прекратится через ' + (stopTime - tmpTime) + ' сек.');
    tmpTime++;
    if (tmpTime > stopTime) {
        $("#modal_time_out").text('Запрос датчиков остановлен');
        $("#return_interval").removeClass("hidden");
        // clearInterval(sensorsIntervalId);
        stopInterval();
        clearInterval(sensorsProcessId);
        tmpTime = 0;
        openModalError = false;
        clearInterval(countIntervalError);
    }
}
function getIntervalSensors() {
    $.ajax({
        url: ajax_url_debug + 'SensorsOut',
        data: {},
        type: 'GET',
        dataType: 'json',
        timeout: 3000,
        success: function (msg) {
            //clearInterval(sensorsIntervalId);
            startInterval();
            countError = 0;
            //console.log('Sensors',msg);
            countProcess++;
            globalSensorsJson = msg;
            if (countProcess > 2 && curProcess !== globalSensorsJson["process"]["allow"]) {
                curProcess = globalSensorsJson["process"]["allow"];
                // console.log('curProcess',curProcess);
            }
            // console.log('countProcess',countProcess);

            if (countProcess > 2) {
                countProcess = 0;
            }
            globalSensorsJson["process"]["allow"] = curProcess;
            fillSensorsData();
            tmpTime = 0;
            if (openModalError) {
                $('.modal').modal('hide');
            }
            openModalError = false;
        },
        error: function (err, exception) {
            countError++;
            if (countError > 10) {
                globalSensorsJson = {};
                if (!openModalError) {
                    openModalError = true;
                    $.fn.openModal('',
                        '<p class="text-center text-danger text-strong">Ошибка загрузки данных датчиков, проверьте питание контроллера и обновите страницу</p>' +
                        '<p class="text-center text-strong" id="modal_time_out"></p>',
                        "modal-sm", false, {
                        text: "Запустить",
                        id: "return_interval",
                        class: "btn btn-success hidden",
                        click: function () {
                            $(this).closest(".modal").modal("hide");
                            stopInterval();
                            startInterval();
                            openModalError = false;
                            // sensorsIntervalId = setInterval(getIntervalSensors, 1000);
                        }
                    });
                    countIntervalError = setInterval(countTimeError, secondInterval)
                }
                /*$("#modal_time_out").text('Запрос датчиков прекратится через ' + (stopTime - tmpTime) + ' сек.');
                tmpTime++;
                if (tmpTime > stopTime) {
                    $("#modal_time_out").text('Запрос датчиков остановлен');
                    $("#return_interval").removeClass("hidden");
                    // clearInterval(sensorsIntervalId);
                    stopInterval();
                    clearInterval(sensorsProcessId);
                    tmpTime = 0;
                    openModalError = false;
                }*/
            } else {
                startInterval();
            }
        },
    });
    //if(tmpTime<100 && refluxProcess["start"] === true)
    //tmpTime ++;
}

function startInterval() {
    sensorsIntervalId = setTimeout(
        function () {
            getIntervalSensors()
        },
        secondInterval
    );
    // sensorsIntervalId = setInterval(getIntervalSensors, secondInterval);
}
function stopInterval() {
    console.log("stopInterval");
    clearTimeout(sensorsIntervalId);
    // clearInterval(sensorsIntervalId);
}

//опрос датчиков
$(document).on('click', '#get_sensors', function (e) {
    e.preventDefault();
    let _this = $(this);
    sendRequest("sensorsOutSet", {}, "json", getSensors, _this, $("#error_sensors"), false);
});
$(document).on('click', '#reset_sensors', function (e) {
    e.preventDefault();
    let _this = $(this);
    $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите сбросить все настройки?</p>', "modal-sm", false, [{
        text: "Да",
        id: "return_restart",
        class: "btn btn-primary btn-sm",
        click: function () {
            $(this).closest(".modal").modal("hide");
            sendRequest("resetData", { "reset": 1 }, "json", getSensors, _this, $("#error_sensors"), false);
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

//сортировка датчиков
$(document).on('change', "#sensors_settings select", function () {
    let arrSortSensors = [];
    $.each($('#sensors_settings select'), function (i, e) {
        if ($(e).val() !== "") {
            arrSortSensors.push($(e).val());
        }
    });
    $('#sensors_settings select option').show();
    $.each(arrSortSensors, function (i, e) {
        $.each($('#sensors_settings select'), function (j, s) {
            if ($(s).val() !== e) {
                $('option[value="' + e + '"]', $(s)).hide();
            }
        });
    });
});

//Заполнение вкладки датчики данными после запроса
function getSensors(data) {
    //console.log(data);
    $("#sensors_settings select").prop('selectedIndex', 0);
    sensorsJson = data;
    let sensors = data;
    for (let key in sensors) {
        if (sensors.hasOwnProperty(key)) {
            let sensor_value = sensors[key]["value"];
            if (re_p.test(key)) {
                let jscolor = sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF";
                $("#sensor_color_" + key).val(jscolor).next("button").css("background-color", "#" + jscolor);
                $("#sensor_val_" + key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
            }
            if (re_t.test(key)) {
                let jscolor = sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF";
                if (sensor_value < 150) {
                    $("#sensor_name_" + key).val(sensors[key]["name"]);
                    $("#sensor_color_" + key).val(jscolor).next("button").css("background-color", "#" + jscolor);
                    $("#sensor_val_" + key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    $("#svg_sensor_" + key).text(sensor_value.toFixed(1) + '°С');
                    $("#svg_sensor_color_" + key).css('fill', jscolor);
                } else {
                    if (!$.fn.objIsEmpty(sensors[key]["name"], false)) {
                        $("#sensor_name_" + key).val("");
                    }
                    $("#sensor_color_" + key).val(jscolor).next("button").css("background-color", "#" + jscolor);
                    $("#sensor_val_" + key).text("").parent().find(".show").removeClass("show").addClass("hidden");
                }
            }
            if (re_out.test(key)) {
                $("#device_name_" + key).val(sensors[key]["name"]);
            }
            if (re_in.test(key)) {
                $("#safety_name_" + key).val(sensors[key]["name"]);
            }
        }
    }
    //localStorage.setObj('sensors', sensorsJson);
}

//Сохранение датчиков и их сортировки
$(document).on('click', '#set_sensors', function (e) {
    e.preventDefault();
    let _this = $(this);
    let nameError = false;
    let arrSortSensors = [1, 2, 3, 4, 5, 6, 7, 8];
    let sensorsSend = {};
    for (let key in sensorsJson) {
        if (sensorsJson.hasOwnProperty(key)) {
            sensorsSend[key] = {};
            if (re_p.test(key)) {
                let color_val = $("#sensor_color_" + key).val();
                sensorsSend[key]["color"] = sensorsJson[key]["color"] = (color_val !== "FFFFFF" && color_val !== "") ? hex2dec(color_val) : 0;
                //console.log(key,color_val);
            }
            if (re_t.test(key)) {
                let color_val = $("#sensor_color_" + key).val();
                let sensor_val = $("#sensor_name_" + key).val();
                if (sensor_val === "" && sensorsJson[key]["value"] < 150) {
                    nameError = true;
                }
                sensorsSend[key]["name"] = sensorsJson[key]["name"] = sensor_val;
                //console.log(key,color_val);
                sensorsSend[key]["color"] = sensorsJson[key]["color"] = (color_val !== "FFFFFF" && color_val !== "") ? hex2dec(color_val) : 0;

                //if (key !== "p1") {
                let sort_number = Number($("#sensor_number_" + key).val());
                if (sort_number !== 0) {
                    $.fn.arrayUnset(arrSortSensors, sort_number);
                }
                sensorsSend[key]["number"] = sensorsJson[key]["number"] = sort_number;
                //}
            }
            if (re_out.test(key)) {
                sensorsSend[key]["name"] = sensorsJson[key]["name"] = $("#device_name_" + key).val();
            }
            if (re_in.test(key)) {
                sensorsSend[key]["name"] = sensorsJson[key]["name"] = $("#safety_name_" + key).val();
            }
        }
    }
    let count = 0;
    //console.log(arrSortSensors);
    if (arrSortSensors.length > 0) {
        for (let key in sensorsJson) {
            if (sensorsJson.hasOwnProperty(key) /*&& key !== "p1"*/) {
                if (sensorsSend[key]["number"] === 0) {
                    sensorsSend[key]["number"] = sensorsJson[key]["number"] = arrSortSensors[count];
                    count++;
                }
            }
        }
    }
    if (nameError) {
        $.fn.openModal('', '<p>Заполните названия подключенных датчиков</p>', "modal-sm", true, false);
    } else {
        sendRequest("sensorsInSet", sensorsSend, "json", setSensors, _this, $("#error_sensors"), false);
    }
});

function setSensors(data) {
    sendRequest("sensorsOutSet", {}, "json", getSensors, $('#get_sensors'), $("#error_sensors"), '<p>Настройки датчиков сохранены</p>');
}