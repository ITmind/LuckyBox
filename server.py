from flask import Flask, escape, request, send_from_directory, render_template
import os
import json


app = Flask(__name__,
            static_folder=os.path.join('.', 'data_uncompressed'))


@app.route('/')
def root():
    return send_from_directory('data_uncompressed', 'index.htm')


@app.route('/SensorsOut')
def SensorsOut():
    print('SensorsOut')
    data = {
        "process": {
            "allow": True, "number": 1, "step": 1, "time": 1, "timeStart": 1,
            "sensors": [
                {"t1": {"value": 20, "name": "t1", "color": "red",
                        "member": "member", "priority": 1, "allertValue": 30}},
                {"p1": {"value": 20, "color": "red", "member": "member"}}
            ],
            "mashing": [
                {"pause1": {"time": 1, "name": "Кислотная пауза",
                            "temperature": 20, "stop": 30, "step": 2}},
                {"pause2": {"time": 1, "name": "Кислотная пауза",
                            "temperature": 20, "stop": 30, "step": 2}},
                {"pause3": {"time": 1, "name": "Кислотная пауза",
                            "temperature": 20, "stop": 30, "step": 2}},
                {"pause4": {"time": 1, "name": "Кислотная пауза",
                            "temperature": 20, "stop": 30, "step": 2}},
                {"pause5": {"time": 1, "name": "Кислотная пауза",
                            "temperature": 20, "stop": 30, "step": 2}},
            ],
            "devices": [
                {"out1": {"value": 1, "member": "member", "allert": 2}}
            ],
            "valwe": [
                {"head": {"timeCycle": 2, "timeOn": 3}},
                {"headSteam": {"percent": 2}},
                {"body": {"timeCycle": 2, "timeOn": 3, "decline": 1}},
                {"bodyPrima": {"percentStart": 2, "percentStop": 3, "decline": 1}}
            ],
            "safety": [
                {"in1": {"value": 1, "member": "member", "allert": 2}}
            ],
            "pid": [
                {"Kp": {"userSetValue": 2}},
                {"Ki": {"userSetValue": 2}},
                {"Kd": {"userSetValue": 2}},
                {"t1": {"userSetValue": 2}}
            ],
            "version": "1.0", "power": 220, "powerHigh": 250, "powerLower": 200, "temperatureAlcoholBoil": 20, "cubeAlcohol": 5, "delta": 220, "sound": 250, "answer": 200
        }
    }
    return json.dumps(data)


@app.route('/distillationSensorsGetTpl')
def distillationSensorsGetTpl():
    print('distillationSensorsGetTpl')
    data = {
        "t1": {"value": 20, "name": "t1", "color": "red",
               "member": "member", "priority": 1, "allertValue": 30},
        "t2": {"value": 20, "name": "t1", "color": "red",
               "member": "member", "priority": 1, "allertValue": 30},

        "out1": {"value": 1, "member": "member", "name": "nameout"},
        "in1": {"value": 1, "member": "member", "name": "namein"},
        "in2": {"value": 1, "member": "member", "name": "namein"},
        "in3": {"value": 1, "member": "member", "name": "namein"},
        "in4": {"value": 1, "member": "member", "name": "namein"},
        "number": 1, "powerHigh": 250, "powerLower": 200
    }
    return json.dumps(data)


@app.route('/configs.json')
def congigjson():
    data = {
        "version": "1.0",
        "SSDP": "1.0",
        "ssidAP": "1.0",
        "ssid": "1.0",
        "powerblock": "1.0",
        "volume": 2,
        "timezone": "+10",
    }
    return json.dumps(data)


@app.route('/refluxSensorsSetLoad')
def refluxSensorsSetLoad():
    data = {
        "t1": {"value": 20, "name": "t1", "color": "red",
               "member": "member", "priority": 1, "allertValue": 30},
        "t2": {"value": 20, "name": "t1", "color": "red",
               "member": "member", "priority": 1, "allertValue": 30},

        "out1": {"value": 1, "member": "member", "name": "nameout"},
        "in1": {"value": 1, "member": "member", "name": "namein"},
        "in2": {"value": 1, "member": "member", "name": "namein"},
        "in3": {"value": 1, "member": "member", "name": "namein"},
        "in4": {"value": 1, "member": "member", "name": "namein"},
        "number": 1, "powerHigh": 250, "powerLower": 200
    }
    return json.dumps(data)


app.run(debug=True)
