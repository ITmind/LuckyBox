import { writable, get } from 'svelte/store';
import { sendRequest, objIsEmpty } from "./utils.js";

//общие данные всего приложения
export const globalSensorsJson = writable({});
let tmpTime = 0;
let stopTime = 10;
let openModalError = false;
let curProcess = 0;
let countProcess = 0;
let countIntervalError = 0;
let secondInterval = 5000;
let sensorsIntervalId = 0;

function getIntervalSensors() {
    let error = "";
    //получаем один раз
    let gl = get(globalSensorsJson);
    if (gl.sensors == undefined) {
        sendRequest('SensorsOut', null, msg => globalSensorsJson.set(msg), error);
        startInterval();
    }
    else{
        sendRequest('SensorsValue', null, success, error);
    }
    if (error!="") {
        console.log('Error ' + error);
        return;
    }

    function test(msg) {
        msg.then(x => {
            console.log(x);
            globalSensorsJson.set(x);
        }
        );

    }

    //получаем каждую секунду
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