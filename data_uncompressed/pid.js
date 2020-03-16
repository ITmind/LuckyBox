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