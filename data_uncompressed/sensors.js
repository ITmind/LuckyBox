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