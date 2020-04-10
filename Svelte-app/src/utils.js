export default class{
    ftest(){
        console.log('test ok');
    }
    ftest2(){
        console.log('r2');
    }

}
/**
	 * <b>Отправка данных на сервер</b>
	 * @param {string} url - адрес
	 * @param {object} data - данные
	 * @param {string} dataType - тип передаваемых данных "text","json","html"...
	 * @param {function|boolean} success_action - действия после успешного отправления данных
	 * @param {object|boolean} load_target - елемент «отправитель» (для лоадера)
	 * @param {object|boolean} error_target - контейнер для вывода ошибок
	 * @param {string|boolean} success_text - текстовое сообщение в диалоговое окно при успешной отправке данных
	 */

export async function sendRequest(url, data, success_action, error) {
    error = null;
    let ajax_url_debug = 'https://pyserver.azurewebsites.net/';
    console.log(ajax_url_debug + url);
    
    const response = await fetch(ajax_url_debug + url, {
        method: 'GET',
        mode: 'cors', 
        body: data,
        headers: {
            'Content-Type': 'text/plain'
        }
    });

    if (response.ok) {
        if (success_action !== false) {
            // let packet = response.json();
            response.json().then(msg => success_action(msg));
        }
    }
    else{
        response.text().then(msg => error = msg);
        // error = alertAjaxError(response, );
    }
}

function alertAjaxError(err, exception) {
    //console.log(err,exception);
    let msg = '';

    if (err.status === 0) {
        msg = 'Нет подключения. Проверьте сеть.';
    } else if (err.status === 404) {
        msg = 'Такой страницы не существует. [404]';
    } else if (err.status === 500) {
        msg = 'Внутренняя ошибка сервера [500].';
    } else if (exception === 'parsererror') {
        msg = 'Ошибка парсинга JSON параметров.';
    } else if (exception === 'timeout') {
        msg = 'Ошибка тайм-аута (превышено время ожидания ответа).';
    } else if (exception === 'abort') {
        msg = 'Запрос Ajax прерван.';
    } else {
        msg = 'Неизвестная ошибка.' + err.responseText;
    }
    
    return msg;
}

// decimal to hex
function dec2hex(num) {
    let hexColor = convertBase(num).from(10).to(16).toUpperCase();
    return hexColor.length === 6 ? hexColor : rgb2to3(hexColor);
}

// hex to decimal
function hex2dec(hex) {
    //console.log(hex);
    let hexColor = hex.length === 4 ? hex : rgb3to2(hex);
    return convertBase(hexColor).from(16).to(10);
}

/**
 * заливка svg цветом, в зависимости от параметров датчиков
 * @param {string} color  - hex цвет
 * @param {number} current - текущее значение датчика
 * @param {number} max - максимально возможное значение датчика
 * @returns {string}
 */
function colorPersent(color, current, max) {
    let rgb = hexToRgb(color);
    let alpha = 1;
    if (Number(max) > 0) {
        alpha = ((current * 100) / max) / 100
    }
    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
    //return "#FF0000";
}

//Преобразование секунд во время
export function secToTime(sec) {
    let dt = new Date();
    dt.setTime(sec * 1000);
    let hours = dt.getUTCHours();
    let minutes = dt.getUTCMinutes();
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
}

/**
 * Проверка на мобильную версию
 * @returns {boolean}
 */
function isMobile() {
    try {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobile|Kindle|Windows Phone|PSP|AvantGo|Atomic Web Browser|Blazer|Chrome Mobile|Dolphin|Dolfin|Doris|GO Browser|Jasmine|MicroB|Mobile Firefox|Mobile Safari|Mobile Silk|Motorola Internet Browser|NetFront|NineSky|Nokia Web Browser|Obigo|Openwave Mobile Browser|Palm Pre web browser|Polaris|PS Vita browser|Puffin|QQbrowser|SEMC Browser|Skyfire|Tear|TeaShark|UC Browser|uZard Web|wOSBrowser|Yandex.Browser mobile/i.test(navigator.userAgent)) {
            console.log("Is isMobile");
            return true;
        }
        return false
    }
    catch (e) {
        console.log("Error in isMobile");
        return false;
    }
}

/**
	 * Проверка объекта на пустоту
	 * @param {object} obj - Объект
	 * @param {boolean} key - Проверять ключи в объекте
	 * @returns {boolean}
	 */
export function objIsEmpty(obj, key) {
    if (key) {
        for (let k in obj) {
            if (obj.hasOwnProperty(k) && obj[k] !== "") {
                return false;
            }
        }
    } else {
        for (let i in obj) {
            if(i=="set" || i=="update"||i=="subscribe"){
                continue;
            }

            if (obj.hasOwnProperty(i)) {
                return false;
            }
        }
    }
    return true;
};
/**
 * Убирает повторяющиеся значения из массива
 * @param arr
 * @returns {Array}
 */
export function arrayUnique(arr) {
    let uniHash = {}, outArr = [], i = arr.length;
    while (i--) {
        uniHash[arr[i]] = i
    }
    for (let j in uniHash) {
        outArr.push(j)
    }
    return outArr
};
/**
 * Проверка массива на одинаковые значения (возвращает массив дублей)
 * @param arr
 * @returns {Array}
 */
export function duplicateValues(arr) {
    let arr_res = [];
    arr.sort();
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[i - 1]) {
            let is_unique = true;
            for (let k = 0; k < arr_res.length; k++) {
                if (arr_res[k] === arr[i]) {
                    is_unique = false;
                    break;
                }
            }
            if (is_unique) {
                arr_res.push(arr[i]);
            }
        }
    }
    return arr_res;
};
/**
 * Удаление элемента из массива
 * @param arr
 * @param value
 * @returns {Array}
 */
export function arrayUnset(arr, value) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
};

// Функция проверки заполнения LocalStorage
function isQuotaExceeded(e) {
    let quotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014:
                    // Firefox
                    if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                        quotaExceeded = true;
                    }
                    break;
            }
        } else if (e.number === -2147024882) {
            // Internet Explorer 8
            quotaExceeded = true;
        }
    }
    return quotaExceeded;
}

//Преобразование цвета hex <-> десятичные
function convertBase(num) {
    return {
        from: function (baseFrom) {
            return {
                to: function (baseTo) {
                    return parseInt(num, baseFrom).toString(baseTo);
                }
            };
        }
    };
}

//Преобразование RGB888 <-> RGB565
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function numToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgb3to2(rgb3) {
    let rgb = hexToRgb(rgb3);

    let r = (0x1f * rgb.r / 0xff) & 0x1f;
    let g = (0x3f * rgb.g / 0xff) & 0x3f;
    let b = (0x1f * rgb.b / 0xff) & 0x1f;

    let result = b & 0x1f;
    result += ((g & 0x3f) << 5);
    result += (r & 0x1f) << 11;

    return (numToHex((result >> 8) & 0xff) + numToHex(result & 0xff)).toUpperCase();
}

function rgb2to3(rgb2) {
    let color = parseInt(rgb2, 16);
    let r = ((color >> 11) & 0x1F) * 0xff / 0x1F;
    let g = ((color >> 5) & 0x3F) * 0xff / 0x3F;
    let b = ((color) & 0x1F) * 0xff / 0x1F;

    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);

    return (numToHex(r) + numToHex(g) + numToHex(b)).toUpperCase();
}
