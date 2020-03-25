import { sendRequest, objIsEmpty } from "./../utils.js";

//общие данные всего приложения
export const globalSensorsJson = writable({});
let tmpTime = 0;
let stopTime = 10;
let openModalError = false;
let curProcess = 0;
let countProcess = 0;
let countIntervalError = 0;
let secondInterval = 1000;

function getIntervalSensors() {
    let error = "";
    //получаем один раз
    if (objIsEmpty(get(globalSensorsJson))) {
        console.log('SensorsOut');    
        sendRequest(ajax_url_debug + 'SensorsOut', {}, msg => globalSensorsJson.set(msg), error);
    }
    if (!error) {
        return;
    }

    //получаем каждую секунду
    sendRequest(ajax_url_debug + 'SensorsValue', {}, success, error);

    function success(msg) {
        globalSensorsJson.update(n => {
            msg.sensors.forEach((element, i) => n.sensors[i].value = element.value);
            msg.devices.forEach((element, i) => n.devices[i].value = element.value);
            msg.safety.forEach((element, i) => n.safety[i].value = element.value);
            return n;
        });

        startInterval();
    }

}

export function startInterval() {
    sensorsIntervalId = setTimeout(
        function () {
            getIntervalSensors()
        },
        secondInterval
    );
}
export function stopInterval() {
    clearTimeout(sensorsIntervalId);
}