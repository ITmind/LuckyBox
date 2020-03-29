
$(function () {
    // Функция записи в LocalStorage
    if (!Storage.prototype.setObj) {
		/**
		 *
		 * @param key - string
		 * @param obj - object
		 * @returns {*}
		 */
        Storage.prototype.setObj = function (key, obj) {
            try {
                return this.setItem(key, JSON.stringify(obj));
            } catch (e) {
                if (isQuotaExceeded(e)) {
                    $.fn.openModal('', '<p class="text-center text-danger text-strong">Превышен лимит localStorage, данные графиков переполнили память браузера</p>', "modal-sm", false, [
                        {
                            text: "Закрыть",
                            id: "return_tab",
                            class: "btn btn-primary btn-sm",
                            click: function () {
                                $(this).closest(".modal").modal("hide");
                            }
                        },
                        {
                            text: "Удалить графики",
                            id: "del_graf",
                            class: "btn btn-danger btn-sm",
                            click: function () {
                                $(this).closest(".modal").modal("hide");
                                clearChart();
                            }
                        }], { buttons: "replace" });
                }
                return null;
            }
        }
    }
    // Функция чтения из LocalStorage
    if (!Storage.prototype.getObj) {
        Storage.prototype.getObj = function (key) {
            return JSON.parse(this.getItem(key));
        }
    }

    

    

    //загружаем контент во вкладки
    $('li.swipe-tab a').on('show.bs.tab', function (e) {
        let url = $(this).attr("href");
        let target = $(this).data("target");
        let tab = $(this);
        if ($.trim($(target).html()) === '') {
            $(target).ajaxLoading();
            $(target).load(url, function (response, status, xhr) {
                console.log("tabs");
                if (status === "error") {
                    $.fn.openModal('', '<p class="text-center text-danger text-strong">Ошибка загрузки вкладки</p><p>' + xhr.status + ' ' + xhr.statusText + '</p>', "modal-sm", false, true);
                }
                $(target).ajaxLoading('stop');
                tab.tab('show');
            });
        } else {
            switch (target) {
                case "#distillation":
                    distillationProcess["sensors"] = {};
                    $.fn.pasteDistillationSensors(false);
                    break;
                case "#reflux":
                    refluxProcess["sensors"] = {};
                    $.fn.pasteRefluxSensors(false);
                    break;
                case "#mashing":
                    mashingProcess["sensors"] = {};
                    $.fn.pasteMashingSensors(false);
                    break;
            }
        }
    });
    $('li.swipe-tab a:first').tab('show');

    

	

    //поиск нужного значения в датчиках
    function getSensorValue(key) {
        let keyData = $.map(globalSensorsJson["sensors"], function (e) {
            return e[key]
        });
        return keyData[0];
    }

    //////////////////////////////////////////////////////////////////////////
    //Определение датчиков
    let sensorsJson = {};
    let globalSensorsJson = {};
    let sensorsIntervalId = 0;
    //Флаг отправки данных процесса в МК
    //let flagSendProcess = false;
    //Интервал запуска процесса
    let sensorsProcessId = 0;
    //количество ошибок при запросе
    let countError = 0;
    //громкость звука
    let soundVolume = 0;
    //изменение данных со стороны контроллера (считаем каунт 5)
    let deltaChange = 0;
    let alertChange = {
        "t1": 0,
        "t2": 0,
        "t3": 0,
        "t4": 0,
        "t5": 0,
        "t6": 0,
        "t7": 0,
        "t8": 0,
    };
    let powerChange = 0;
    let mashingChange = 0;
    let algorithmChange = 0;
    let pidChange = 0;
    //регекспы для датчиков
    const re_p = new RegExp(/p1/);
    const re_t = new RegExp(/^t/);
    const re_out = new RegExp(/^out/);
    const re_in = new RegExp(/^in/);
    const re_pause = new RegExp(/^pause/);
    const re_Kp = new RegExp(/Kp/);
    const re_Ki = new RegExp(/Ki/);
    const re_Kd = new RegExp(/Kd/);
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
    //Глобальный объект dtoReceiver служит для опроса МК.
    let dtoReceiver = {
        dtos: [],                               // Контейнер состояний в ОЗУ
        frequencyRecordingToLocalStorage: 5,    // Частота архивации (Через сколько опросов осуществляется запись в localStorage)
        reqestDelayDefalt: 1000,

        dtoGet: function (json, target) {
            const self = dtoReceiver;  // Для доступа к this в jquery
            let requestCounter = 0;    // Счётчик запросов, служит для записи в localStorage каждые frequencyRecordingToLocalStorage раз

            self.dtoCurrent = json;
            self.dtoContainer = target;
            self.dtoCurrent.d = (new Date()).getTime();  // Пользуемся временем клиента, для несчастных без доступа к NTP

            // Считывание предыдущих сохранённых значений
            this.dtos = localStorage.getObj('dtos');

            // Проверка на существование сохранённых значений
            if (this.dtos == null) {
                this.dtos = [];
            }

            self.dtos.push(self.dtoCurrent);

            // Запись в хранилище
            if ((requestCounter++ % self.frequencyRecordingToLocalStorage) === 0) {
                localStorage.setObj('dtos', self.dtos);
            }

            // Вызов события что данные получены
            $(document).trigger('newDTOreceived', [self.dtoCurrent, self.dtoContainer]);
        },

        // Очистка LocalStorage
        clearDeviceConditions: function () {
            this.dtos = [];
            localStorage.removeItem('dtos');
        },
        // Запуск опроса ESP
        start: function (dtoJson, target) {
            //console.log("startChart",target);
            this.dtoGet(dtoJson, target);
        }
    };

    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        lang: {
            loading: 'Загрузка...',
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            shortMonths: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
            exportButtonTitle: "Экспорт",
            printButtonTitle: "Печать",
            rangeSelectorFrom: "С",
            rangeSelectorTo: "По",
            rangeSelectorZoom: "Период",
            downloadPNG: 'Скачать PNG',
            downloadJPEG: 'Скачать JPEG',
            downloadPDF: 'Скачать PDF',
            downloadSVG: 'Скачать SVG',
            printChart: 'Напечатать график'
        }
    });

    let plot = {};
    let drowChart = false;
    function startChart() {
        drowChart = true;
        $(document).one("newDTOreceived", function (e) {
            //console.log(e,dtoReceiver.dtoContainer);
            let process = Number(globalSensorsJson["process"]["allow"]);
            if (process !== 0) {
                plot = getPlot();
            }
        });
    }

    function clearChart() {
        drowChart = false;
        $(document).off("newDTOreceived");
        plot = {};
        //console.log("clearChart");
        dtoReceiver.clearDeviceConditions();
        if (plot.hasOwnProperty("series")) {
            plot.series.forEach(function (s) {
                s.setData([])
            });
            plot.redraw();
        }
    }

    function getPlot() {
        console.log("Запуск графиков!");
        let jsonPlot = {
            chart: {},
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: "%e. %b",
                    month: "%b '%y",
                    year: "%Y"
                }
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}°C',
                    style: {
                        color: 'black'
                    }
                },
                title: {
                    text: 'Температура',
                    style: {
                        color: 'black'
                    }
                }
            }
            ],
            series: [],
            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1M'
                }, {
                    count: 5,
                    type: 'minute',
                    text: '5M'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 2
            },
            title: {
                text: 'Данные датчиков'
            },
            legend: {
                enabled: true
            },
            exporting: {
                enabled: true
            },
            plotOptions: {
                series: {
                    showInNavigator: true
                }
            },
        };
        if (globalSensorsJson["process"]["allow"] !== 4) {
            jsonPlot.yAxis[1] = { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Мощность',
                    style: {
                        color: 'black'
                    }
                },
                labels: {
                    format: '{value} %',
                    style: {
                        color: 'black'
                    },
                    align: 'left',
                    x: 0,
                },
                max: 100,
                opposite: false
            };
            jsonPlot.series[0] = {
                name: "Мощность", yAxis: 1, type: "area", step: 'left', fillOpacity: 0.05, color: "#f00000", lineWidth: 1, showInLegend: true,
                data: dtoReceiver.dtos.map(function (dc) {
                    return [dc.d, dc.h]
                })
            };
        }

        if (globalSensorsJson["process"]["allow"] === 2) {
            jsonPlot.yAxis[2] = { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Атм. давление',
                    style: {
                        color: 'black'
                    }
                },
                labels: false,
                max: 800,
                opposite: false
            };
            jsonPlot.series[1] = {
                name: "Атмосферное давление", yAxis: 2, type: "area", step: 'left', fillOpacity: 0.05, color: "#00e4f0", lineWidth: 1, showInLegend: true,
                data: dtoReceiver.dtos.map(function (dc) {
                    return [dc.d, dc.p]
                })
            };
        }

        let view_chart = dtoReceiver.dtoContainer;
        let plotNew = Highcharts.stockChart(view_chart, jsonPlot);

        //console.log("plot",dtoReceiver.dtos[0].temperatures);
        $.each(dtoReceiver.dtos[0].t, function (key, t) {
            // console.log("plot", key, t);
            if (re_t.test(key)) {
                let sensorData = getSensorValue(key);
                if (globalSensorsJson["process"]["allow"] === 3 && key === "t2") {
                    sensorData["name"] = "В струе";
                }
                plotNew.addSeries({
                    name: sensorData["name"],
                    color: "#" + dec2hex(sensorData["color"]),
                    data: dtoReceiver.dtos.map(function (dc) {
                        return [dc.d, dc.t[key]]
                    })
                });
            }
        });

        $(document).on("newDTOreceived", function (e, dto) {
            if (plot.hasOwnProperty("series")) {
                let count = 0;
                let process = Number(globalSensorsJson["process"]["allow"]);
                if (process !== 4) {
                    plot.series[0].addPoint([dto.d, dto.h], false);
                }
                if (process === 4) {
                    count = -1;
                }
                if (process === 2) {
                    plot.series[1].addPoint([dto.d, dto.p], false);
                    count = 1;
                }
                //console.log("newDTOreceived", dto.temperatures);
                $.each(dto.t, function (key, t) {
                    //console.log("plot", key, t);
                    if (re_t.test(key)) {
                        plotNew.series[count + 1].addPoint([dto.d, t], false);
                        count++;
                    }
                });
            }
            plotNew.redraw();
        });

        return plotNew;
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
            $.fn.openModal('', '<p class="text-center text-danger text-strong">Заполните названия подключенных датчиков</p>', "modal-sm", true, false);
        } else {
            //console.log(sensorsJson,sensorsSend);
            sendRequest("sensorsInSet", sensorsSend, "json", setSensors, _this, $("#error_sensors"), false);
        }
    });

    function setSensors(data) {
        //console.log(data);
        sendRequest("sensorsOutSet", {}, "json", getSensors, $('#get_sensors'), $("#error_sensors"), '<p class="text-center text-success  text-strong">Настройки датчиков сохранены</p>');
        //$.fn.openModal('', '<p class="text-center text-success text-strong">Тестовое сообщение, УРА!</p>', "modal-sm", true, false);
        //localStorage.setObj('sensors', sensorsJson);
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
    $.fn.pasteMashingSensors = function (sensors_select) {
        if ($.fn.objIsEmpty(globalSensorsJson, false) && countError < 10) {
            setTimeout(function () {
                $.fn.pasteMashingSensors(false);
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
        if (!sensors_select && $.fn.objIsEmpty(mashingProcess["sensors"], false)) {
            $.ajax({
                url: ajax_url_debug + 'mashingSensorsGetTpl',
                data: {},
                type: 'GET',
                dataType: 'json',
                success: function (msg) {
                    mashingProcess["sensors"] = msg;
                    if (!$.fn.objIsEmpty(mashingProcess["sensors"], false)) {
                        $.fn.pasteMashingSensors(false);
                    }
                },
                error: function (err, exception) {
                    alertAjaxError(err, exception, $("#error_mashing"));
                }
            });
        }
        if (!$.fn.objIsEmpty(mashingProcess["sensors"], false)) {
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
    };
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
    //настройка ПИД
    let pidProcess = { "pid": {}, "start": false };
    function launchPid() {
        curProcess = 4;
        countProcess = 0;
        pidProcess["start"] = flagSendProcess = true;
        $('#pid_start').prop("disabled", true);
        $('#pid_stop').prop("disabled", false);
        $('#set_pid').prop("disabled", true);
        clearInterval(sensorsProcessId);
        stopInterval();
        localStorage.setObj('oldStartProcess', 4);
        setTimeout(function () {
            setPid();
        }, 1000);
    }
    $(document).on('start-event', '#pid_start', function (e) {
        console.log("start-event-Pid");
        launchPid()
    });
    $(document).on('click', '#pid_start', function () {
        $.fn.openModal('', '<p class="text-center text-danger text-strong">Будет запущен процесс ПИД регулировки, убедитесь в том, что тэн залит жидкостью!</p>', "modal-sm", false, [{
            text: "Да",
            id: "return_restart",
            class: "btn btn-primary btn-sm",
            click: function () {
                $(this).closest(".modal").modal("hide");
                launchPid();
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
    $(document).on('click', '#pid_stop', function () {
        $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите остановить процесс регулировки ПИД?</p>', "modal-sm", false, [{
            text: "Да",
            id: "return_restart",
            class: "btn btn-primary btn-sm",
            click: function () {
                $(this).closest(".modal").modal("hide");
                stopPid()
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
    function stopPid() {
        $('#pid_stop').prop("disabled", true);
        $('#pid_start').prop("disabled", false);
        $('#set_pid').prop("disabled", false);
        clearInterval(sensorsProcessId);
        flagSendProcess = true;
        globalSensorsJson["process"]["allow"] = 0;
        curProcess = 0;
        countProcess = 0;
        pidProcess["start"] = false;
        setPid();
    }
    $(document).on('stop-event', '#pid_stop', function (e) {
        stopPid()
    });
    $(document).on('click', '#set_pid', function (e) {
        e.preventDefault();
        let _this = $(this);
        let pidSend = { "save": 1 };

        if (!$.fn.objIsEmpty(pidProcess["pid"], false)) {
            $.each(pidProcess["pid"], function (j, q) {
                let pid_value = Number($("#pid_" + j).val());
                pidSend[j] = { "userSetValue": pid_value }
            });
        }
        if (!$.fn.objIsEmpty(pidSend, false)) {
            sendRequest("pidMashingSet", pidSend, "json", false, _this, $("#error_pid"), false);
        }
    });
    $.fn.pastePidSensors = function (sensors_select) {
        if ($.fn.objIsEmpty(globalSensorsJson, false) && countError < 10) {
            setTimeout(function () {
                $.fn.pastePidSensors(false);
            }, 1000);
        }
        $.each(globalSensorsJson["pid"], function (i, e) {
            let pid_key = Object.keys(e).shift();
            pidProcess["pid"][pid_key] = globalSensorsJson["pid"][i][pid_key];
        });
        $("#pid_start_group_button").removeClass("hidden");
        if (pidProcess["start"] === true) {
            getPid();
            $('#pid_start').prop("disabled", true);
            $('#set_pid').prop("disabled", true);
        } else {
            $('#pid_stop').prop("disabled", true);
            $('#set_pid').prop("disabled", false);
        }
    };
    //Установка значений для ПИД
    function setPid() {
        console.log("setPid");
		/*if (setPid.caller == null) {
			console.log('Эта функция была вызвана из верхнего уровня!');
		} else {
			console.log('Эта функция была вызвана из ' + setPid.caller);
		}*/
        if ($.fn.objIsEmpty(pidProcess["pid"], false)) {
            setTimeout(function () {
                setPid();
            }, 1000);
        } else {
            let pidSendData = {
                "process": { "allow": 0 },
                "Kp": { "userSetValue": 0 },
                "Ki": { "userSetValue": 0 },
                "Kd": { "userSetValue": 0 },
                "t1": { "userSetValue": 0 }
            };
            pidSendData["process"]["allow"] = (pidProcess["start"] ? 4 : 0);

            $.each(pidProcess["pid"], function (i, e) {
                let sensor_key = i;
                let pid_val = $("#pid_" + sensor_key);
                if (pid_val.length) {
                    if (Number(e["userSetValue"]) !== Number(pid_val.val())) {
                        flagSendProcess = true;
                    }
                    pidSendData[sensor_key]["userSetValue"] = e["userSetValue"] = Number(pid_val.val());
                }
            });
            if (flagSendProcess) {
                flagSendProcess = false;
                clearInterval(sensorsProcessId);
                // clearInterval(sensorsIntervalId);
                stopInterval();
                sendRequest("pidMashingSet", pidSendData, "json", startPid, false, $("#error_pid"), false);
            }
        }
    }
    // $(document).on('mousedown',"#pid_process input", function () {
    // 	flagSendProcess = true;
    // });
    $(document).on('change', "#pid_process input",
        $.debounce(function () {
            flagButtonPress = false;
            // flagSendProcess = true;
            if (pidProcess["start"] === true) {
                setPid();
            }
        }, 300)
    );
    function startPid(request) {
        flagSendProcess = false;
        console.log("startPid");
        setTimeout(function () {
            clearInterval(sensorsProcessId);
            // clearInterval(sensorsIntervalId);
            stopInterval();
            startInterval();
            // sensorsIntervalId = setInterval(getIntervalSensors, 1000);
            if (pidProcess["start"] === true) {
                if (!$.fn.objIsEmpty(request, false)) {
                    $.each(request["settings"], function (j, q) {
                        let pid_key = Object.keys(q).shift();
                        pidProcess["pid"][pid_key] = request["settings"][j][pid_key];
                    });
                }
                sensorsProcessId = setInterval(getPid, 2000);
            }
        }, 2000);
    }
    function getPid() {
        // let sek= parseInt(+new Date()/1000);
        //console.log(flagSendProcess,"getPid "+sek);
        // console.log(pidProcess);
        if (!$.fn.objIsEmpty(globalSensorsJson, false)) {
            let dtoJson = {};
            dtoJson["t"] = {};
            if (!$.fn.objIsEmpty(pidProcess, false)) {
                $.each(pidProcess["pid"], function (pid_key, q) {
                    if (!re_t.test(pid_key)) {
                        if (pidProcess["pid"][pid_key].hasOwnProperty("deviceOutValue")) {
                            let pid_device_value = Number(pidProcess["pid"][pid_key]["deviceOutValue"]);
                            if (pid_device_value > 0) {
                                if (pid_key === "Ki") {
                                    $(".pid_device_" + pid_key).text(pid_device_value.toFixed(2));
                                } else {
                                    $(".pid_device_" + pid_key).text(pid_device_value.toFixed(0));
                                }
                            }
                        }
                        //убрал пока
						/*if(pidProcess["pid"][pid_key].hasOwnProperty("userSetValue")) {
							let pid_value = Number(pidProcess["pid"][pid_key]["userSetValue"]);
							if (!flagSendProcess) {
								$("#pid_" + pid_key).val(pid_value);
							}
						}*/
                    }
                });
            }
            let sensor_value = Number(globalSensorsJson["sensors"][0]['t1']["value"]);
            $("#pid_value_t1").text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
            if (pidProcess["start"] === true) {
                dtoJson["t"]['t1'] = sensor_value;
            }
            $("#view_reflux_chart").html("");
            $("#view_distillation_chart").html("");
            $("#view_mashing_chart").html("");
            if (!$.fn.objIsEmpty(dtoJson["t"], false) && drowChart) {
                dtoReceiver.start(dtoJson, 'view_pid_chart');
            }
            $.each(globalSensorsJson["pid"], function (i, e) {
                let pid_key = Object.keys(e).shift();
                let pid_value = Number(globalSensorsJson["pid"][i][pid_key]["userSetValue"]);
                if (!flagSendProcess && !flagButtonPress) {
                    if (pid_value !== Number($("#pid_" + pid_key).val())) {
                        pidChange++;
                    }
                    if (pidChange > 5) {
                        if (pid_value !== Number($("#pid_" + pid_key).val())) {
                            $("#pid_" + pid_key).val(pid_value);
                        }
                    }
                }
            });
        }
    }


    //заполнение разных полей данными датчиков
    function fillSensorsData() {
        if (!$.fn.objIsEmpty(globalSensorsJson, false)) {
            if (pidProcess["start"] !== true) {
                $.each(globalSensorsJson["pid"], function (j, q) {
                    let pid_key = Object.keys(q).shift();
                    let user_value = Number(globalSensorsJson["pid"][j][pid_key]["userSetValue"]);
                    if (user_value > 0 && Number($("#pid_" + pid_key).val()) === 0) {
                        if (pid_key === "Ki") {
                            $("#pid_" + pid_key).val(user_value.toFixed(2));
                        } else {
                            $("#pid_" + pid_key).val(user_value.toFixed(0));
                        }
                    }
                });
            }
            let process = Number(globalSensorsJson["process"]["allow"]);
            if (process !== 0) {
                $("a#toggle_settings").addClass("disabled").css('cursor', 'not-allowed');
                $("#nav-tabs li a").addClass("disabled").css('cursor', 'not-allowed');

                switch (process) {
                    case 1:
                        $('#nav-tabs li a[data-target="#distillation"]').css('cursor', 'pointer');
                        break;
                    case 2:
                        $('#nav-tabs li a[data-target="#reflux"]').css('cursor', 'pointer');
                        break;
                    case 3:
                        $('#nav-tabs li a[data-target="#mashing"]').css('cursor', 'pointer');
                        break;
                    case 4:
                        $('#nav-tabs li a[data-target="#pid"]').css('cursor', 'pointer');
                        break;

                }
            } else {
                $("a#toggle_settings").removeClass("disabled").css('cursor', 'pointer');
                $("#nav-tabs li a").removeClass("disabled").css('cursor', 'pointer');
            }

            $.each(globalSensorsJson["sensors"], function (i, e) {
                let sensor_key = Object.keys(e).shift();
                //заполнение вкладки датчики
                let sensor_value = Number(globalSensorsJson["sensors"][i][sensor_key]["value"]);

                if ($("#sensor_val_" + sensor_key).length && sensor_value < 150) {
                    $("#sensor_val_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    $("#svg_sensor_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
                }
                if (sensor_key === "p1") {
                    $("#sensor_val_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                }
                //заполнение процесса дистилляции
                if (distillationProcess["start"] !== true) {
                    $("#distillation_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    $("#distillation_power_value").text(Number(globalSensorsJson["power"]).toFixed(0)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    if (sensor_value < 150) {
                        $("#svg_distillation_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
                    } else {
                        $("#svg_distillation_" + sensor_key).text('');
                    }
                    $("#svg_distillation_ten_t").text(Number(globalSensorsJson["power"]).toFixed(0) + '%');
                }

                //console.log('fillSensorsData', sensor_key, sensor_value, $("#distillation_" + sensor_key).text());

                //заполнение процесса ректификации
                if (refluxProcess["start"] !== true) {
                    $("#reflux_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    if (sensor_key === "p1") {
                        $("#reflux_pressure").text(globalSensorsJson["sensors"][i]["p1"]["value"].toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                        $("#reflux_alco_boil").text(globalSensorsJson["temperatureAlcoholBoil"].toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                        $("#reflux_power_value").text(Number(globalSensorsJson["power"]).toFixed(0)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    }

                    if (sensor_value < 150) {
                        $("#svg_reflux_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
                    } else {
                        $("#svg_reflux_" + sensor_key).text('');
                    }
                    $("#svg_reflux_ten_t").text(Number(globalSensorsJson["power"]).toFixed(0) + '%');
                }
                //заполнение процесса затирания
                if (mashingProcess["start"] !== true) {
                    $("#mashing_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                    if (sensor_value < 150) {
                        $("#svg_mashing_" + sensor_key).text(sensor_value.toFixed(1) + '°С');
                    } else {
                        $("#svg_mashing_" + sensor_key).text('');
                    }
                    $("#svg_mashing_ten_t").text(Number(globalSensorsJson["power"]).toFixed(0) + '%');
                }
                //заполнение ПИД регулировки
                if (pidProcess["start"] !== true) {
                    $("#pid_value_" + sensor_key).text(sensor_value.toFixed(2)).parent().find(".hidden").removeClass("hidden").addClass("show");
                }
            });
            let active_tabs = $("#nav-tabs li.active a");

            // console.log('active_tabs',active_tabs);
            // $('#nav-tabs li a').on('shown.bs.tab', function (tab) {
            // 	console.log('active_tabs',tab.target); // activated tab
            // 	// tab.relatedTarget // previous tab
            // });
            //старт/стоп дистилляции
            if (distillationProcess["start"] !== true && process === 1) {
                if (active_tabs.data('target') === "#distillation") {
                    distillationProcess["sensors"] = {};
                    $.fn.pasteDistillationSensors(false);
                } else {
                    $('#nav-tabs li a[data-target="#distillation"]').tab('show');
                }
                $("#distillation_start").trigger("start-event");
            }
            if (distillationProcess["start"] === true && process !== 1) {
                $("#distillation_stop").trigger("stop-event");
            }
            //старт/стоп ректификации
            if (refluxProcess["start"] !== true && process === 2) {
                if (active_tabs.data('target') === "#reflux") {
                    refluxProcess["sensors"] = {};
                    $.fn.pasteRefluxSensors(false);
                } else {
                    $('#nav-tabs li a[data-target="#reflux"]').tab('show');
                }
                $("#reflux_start").trigger("start-event");
            }
            if (refluxProcess["start"] === true && process !== 2) {
                $("#reflux_stop").trigger("stop-event");
            }
            //старт/стоп затирания
            if (mashingProcess["start"] !== true && process === 3) {
                // $('#nav-tabs li a[data-target="#mashing"]').tab('show');
                if (active_tabs.data('target') === "#mashing") {
                    mashingProcess["sensors"] = {};
                    $.fn.pasteMashingSensors(false);
                } else {
                    $('#nav-tabs li a[data-target="#mashing"]').tab('show');
                }
                $("#mashing_start").trigger("start-event");
            }
            if (mashingProcess["start"] === true && process !== 3) {
                $("#mashing_stop").trigger("stop-event");
            }
            //старт/стоп ПИД
            if (pidProcess["start"] !== true && process === 4) {
                $('#nav-tabs li a[data-target="#pid"]').tab('show');
                $("#pid_start").trigger("start-event");
            }
            if (pidProcess["start"] === true && process !== 4) {
                $("#pid_stop").trigger("stop-event");
            }
            //очистка данных графиков и запуск
            let oldTimeStart = Number(localStorage.getObj('timeStartProcess'));
            //console.log(oldTimeStart);
            if (oldTimeStart !== Number(globalSensorsJson["process"]["timeStart"])) {
                localStorage.setObj('timeStartProcess', globalSensorsJson["process"]["timeStart"]);
                //очищаем графики
                clearChart();
            }
            let oldStartProcess = Number(localStorage.getItem('oldStartProcess'));
            if (process > 0 && oldStartProcess !== process) {
                //очищаем графики
                clearChart();
            }
            if (process > 0 && !drowChart && Number(globalSensorsJson["process"]["timeStart"]) > 0) {
                startChart();
            }
            if (Number(globalSensorsJson["sound"]) > 0) {
                playSound();
            }
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
    
    ////////////////////////////////////////////////////////////////


    //Свойства TODO - переделать все свойства в один запрос
    function getSettings() {
        $.ajax({
            url: ajax_url_debug + 'configs.json',
            data: {},
            type: 'GET',
            dataType: 'json',
            success: function (msg) {
                // console.log('Settings', msg);
                $("#settings_ssdp").val(msg["SSDP"]);
                $("#settings_ssid").val(msg["ssid"]);
                $("#version").text("v." + msg["version"]);
                // $("#settings_password").val(msg["password"]);
                $("#settings_ssidap").val(msg["ssidAP"]);
                // $("#settings_passwordap").val(msg["passwordAP"]);
                $("#settings_timezone").val(msg["timezone"]);
                soundVolume = msg["volume"];
                $("#distillation_volume").val(soundVolume);
                $("#reflux_volume").val(soundVolume);
                $("#mashing_volume").val(soundVolume);
                $("#power_block").val(msg["powerblock"]).change();
            }
        });
    }

    setTimeout(getSettings, 2000);

    //Обновление прошивки
    $("#file_update").on("change", function () {
        let fileLength = $(this)[0].files.length;
        let fileName = $(this)[0].files[0].name;
        // LuckyBox.ino.bin - файл обновления ПО
        // LuckyBox.spiffs.bin - файл обновления web
        console.log(fileName);
        if (fileName !== "LuckyBox.ino.bin" && fileName !== "LuckyBox.spiffs.bin") {
            $.fn.openModal('',
                '<p id="modal_text_info" class="text-center text-danger text-strong">Не корректное имя файла обновления прошивки</p>' +
                '<p>Файлы обновления должны иметь названия:</p>' +
                '<p><strong>LuckyBox.ino.bin</strong> - файл обновления ПО</p>' +
                '<p><strong>LuckyBox.spiffs.bin</strong> - файл обновления web</p>'
            );
        } else {
            if (fileLength !== 0) {
                $("#settings_update").prop("disabled", false);
            }
        }
    });

    let modal_interval = 0;

    $("form#firmware_update").submit(function (e) {
        e.preventDefault();
        // clearInterval(sensorsIntervalId);
        stopInterval();
        let formData = new FormData();
        formData.append('update', $('#file_update')[0].files[0]);
        //console.log(formData,$('#file_update')[0].files[0]);
        $.ajax({
            url: ajax_url_debug + 'update',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            dataType: 'json',
            enctype: 'multipart/form-data',
            processData: false,
            beforeSend: function () {
                console.log("beforeSend");
                $("#settings_update").ajaxLoading({ disabled: true });
                $.fn.openModal('',
                    '<p id="modal_text_info" class="text-center text-danger text-strong">Происходит загрузка файла в контроллер, пожалуйста дождитесь окончания загрузки</p>' +
                    '<p class="text-center text-strong" id="modal_time_out"></p>',
                    "modal-sm", false, [{
                        text: "Закрыть",
                        id: "modal_update_close",
                        class: "btn btn-primary btn-sm hidden",
                        click: function () {
                            $(this).closest(".modal").modal("hide");
                        }
                    }], { buttons: "replace", id: "modal_update", data: { backdrop: 'static' } });
            },
            success: function (msg) {
                if (msg.hasOwnProperty('update') && msg['update'] === 'ok') {
                    setTimeout(function () {
                        clearInterval(modal_interval);
                        $("#modal_text_info").html('Файл обновления успешно загружен, контроллер будет перезагружен.<br><br>Страница будет автоматически обновлена, через 1 минуту').removeClass('text-danger').addClass('text-success');
                        // console.log("success", msg);
                        tmpTime = 0;
                        modal_interval = setInterval(function () {
                            tmpTime++;
                            $("#modal_time_out").text((tmpTime) + ' сек.');
                            if (tmpTime >= 60) {
                                location.reload(true)
                            }
                        }, 1000)
                    }, 1000);
                }
                if (msg.hasOwnProperty('update') && msg['update'] === 'err') {
                    setTimeout(function () {
                        $("#modal_text_info").html('Ошибка обновления прошивки, попробуйте загрузить файл еще раз');
                        $("#modal_update_close").removeClass('hidden');
                        // console.log("success", msg);
                    }, 1000);
                }

            },
            error: function (err, exception) {
                setTimeout(function () {
                    $("#modal_text_info").html('Ошибка обновления прошивки, попробуйте загрузить файл еще раз');
                    $("#modal_update_close").removeClass('hidden');
                    // console.log("success", msg);
                }, 1000);
                // console.log("error", err, exception);
                // alertAjaxError(err, exception, $("#error_settings"));
            },
            complete: function () {
                // console.log("complete", msg);
                $("#settings_update").ajaxLoading('stop').prop("disabled", false);
            }
        });
        //return false;
    });

    $(document).on("focus", "#settings_password, #settings_passwordap", function () {
        $(this).prop("type", "text");
    });
    $(document).on("blur", "#settings_password, #settings_passwordap", function () {
        $(this).prop("type", "password");
    });
    $("#settings_set_ssdp").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        let ssdp = $("#settings_ssdp").val();
        if (ssdp !== "") {
            sendRequest("ssdp", { "ssdp": ssdp }, "text", false, _this, $("#error_settings"), false);
        } else {
            $.fn.openModal('', '<p class="text-center text-danger text-strong">Заполните поле</p>', "modal-sm", true, false);
        }
    });
    $("#settings_set_ssid").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        let ssid = $("#settings_ssid").val();
        let pass = $("#settings_password").val();
        if (ssid !== "" && pass.length >= 8) {
            sendRequest("ssid", {
                "ssid": ssid,
                "password": pass
            }, "text", false, _this, $("#error_settings"), '<p class="text-center text-success text-strong">Изменения вступят в силу после перезагрузки. Пожалуйста перезагрузите устройство.</p>');
        } else {
            $.fn.openModal('', '<p class="text-center text-danger text-strong">Заполните поля, пароль не может быть меньше 8 знаков</p>', "modal-sm", true, false);
        }
    });
    $("#settings_set_ssidap").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        let ssidap = $("#settings_ssidap").val();
        let pass = $("#settings_passwordap").val();
        if (ssidap !== "" && pass.length >= 8) {
            sendRequest("ssidap", {
                "ssidAP": ssidap,
                "passwordAP": pass
            }, "text", false, _this, $("#error_settings"), '<p class="text-center text-success text-strong">Изменения вступят в силу после перезагрузки. Пожалуйста перезагрузите устройство.</p>');
        } else {
            $.fn.openModal('', '<p class="text-center text-danger text-strong">Заполните поля, пароль не может быть меньше 8 знаков</p>', "modal-sm", true, false);
        }
    });
    $("#settings_auto_timezone").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        let date = new Date();
        let timezone = Math.abs(date.getTimezoneOffset() / 60);
        $("#settings_timezone").val(timezone);
        sendRequest("TimeZone", { "timezone": timezone }, "text", false, _this, $("#error_settings"), '<p class="text-center text-success text-strong">Изменения временной зоны сохранены</p>');


    });
    $("#settings_set_timezone").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        let timezone = $("#settings_timezone").val();
        if (timezone !== "") {
            sendRequest("TimeZone", { "timezone": timezone }, "text", false, _this, $("#error_settings"), '<p class="text-center text-success text-strong">Изменения временной зоны сохранены</p>');
        } else {
            $.fn.openModal('', '<p class="text-center text-danger text-strong">Заполните поле</p>', "modal-sm", true, false);
        }
    });
    $("#settings_restart").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        $.fn.openModal('', '<p class="text-center text-danger text-strong">Вы действительно хотите перезагрузить устройство?</p>', "modal-sm", false, [{
            text: "Да",
            id: "return_restart",
            class: "btn btn-primary btn-sm",
            click: function () {
                $(this).closest(".modal").modal("hide");
                sendRequest("restart", { "device": "ok" }, "text", false, _this, false, false);
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
    //Поворот экрана
    $("#settings_set_rotate").on("click", function (e) {
        e.preventDefault();
        let _this = $(this);
        let tft_rotate = ($("#tft_rotate").prop("checked") ? 1 : 0);
        let touchpad_rotate = ($("#touchpad_rotate").prop("checked") ? 1 : 0);
        sendRequest("rotate", {
            "tft_rotate": tft_rotate,
            "touchpad_rotate": touchpad_rotate
        }, "text", false, _this, $("#error_settings"), false);
    });
    //Громкость дистилляция
    $(document).on("click", "#distillation_set_volume", function (e) {
        e.preventDefault();
        let _this = $(this);
        let sound_volume = $("#distillation_volume").val();
        soundVolume = sound_volume;
        sendRequest("volume", {
            "value": sound_volume
        }, "text", false, _this, $("#error_settings"), false);
    });
    //Громкость ректификация
    $(document).on("click", "#reflux_set_volume", function (e) {
        e.preventDefault();
        let _this = $(this);
        let sound_volume = $("#reflux_volume").val();
        soundVolume = sound_volume;
        sendRequest("volume", {
            "value": sound_volume
        }, "text", false, _this, $("#error_settings"), false);
    });
    //Громкость затирание
    $(document).on("click", "#mashing_set_volume", function (e) {
        e.preventDefault();
        let _this = $(this);
        let sound_volume = $("#mashing_volume").val();
        soundVolume = sound_volume;
        sendRequest("volume", {
            "value": sound_volume
        }, "text", false, _this, $("#error_settings"), false);
    });
    // Настройки блока питания
    $(document).on("click", "#settings_power_block", function (e) {
        e.preventDefault();
        let _this = $(this);
        let power_block_val = $("#power_block").val();
        sendRequest("powerblock", {
            "value": power_block_val
        }, "text", false, _this, $("#error_settings"), false);
    });
	
});