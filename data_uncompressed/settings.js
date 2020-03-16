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