let globalSensorsJson = {};

/**
	 * Проверка объекта на пустоту
	 * @param {object} obj - Объект
	 * @param {boolean} key - Проверять ключи в объекте
	 * @returns {boolean}
	 */
function objIsEmpty(obj, key) {
	if (key) {
		for (let k in obj) {
			if (obj.hasOwnProperty(k) && obj[k] !== "") {
				return false;
			}
		}
	} else {
		for (let i in obj) {
			if (obj.hasOwnProperty(i)) {
				return false;
			}
		}
	}
	return true;
}

function alertAjaxError(err, exception, container) {
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
	let error_alert = '<div>' +
		'<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
		'<span aria-hidden="true">&times;</span>' +
		'</button>' +
		'<span class="text-strong">' + msg + '</span>' +
		'</div>';
	container.html(error_alert);
	//alert(msg);
}

//Рендер HTML шаблонов
function renderTpl(props) {
	return function (tok, i) {
		return (i % 2) ? props[tok] : tok;
	};
}

function returnTplHtml(ar_props, tpl) {
	return (ar_props.map(function (item) {
		return tpl.split(/\$\{(.+?)\}/g).map(renderTpl(item)).join('');
	}));
}

/**
 * Убирает повторяющиеся значения из массива
 * @param arr
 * @returns {Array}
 */
function arrayUnique(arr) {
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
function duplicateValues(arr) {
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
function arrayUnset(arr, value) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === value) {
			arr.splice(i, 1);
			break;
		}
	}
	return arr;
};

/**
 * Заполнение селекта
 * @param select
 * @param dataArray
 * @param optgroup
 */
function fillSelect(select, dataArray, optgroup) {
	if (optgroup === undefined) { optgroup = false }

	if (select.prop('tagName') === 'SELECT') {
		if (!optgroup) {
			$.each(dataArray, function (index, value) {
				let option_text = "";
				let option_val = "";
				$.each(value, function (key, val) {
					//console.log(key, val);
					if (key === "text") {
						option_text = val;
					} else {
						option_val += " " + key + "=\"" + val + "\"";
					}
				});
				let option = "<option" + option_val + ">" + option_text + "</option>";
				select.append($(option)
					//.attr("value", value.id)
					//.text(value.name)
					//.attr("data-"+value.data[0],value.data[1])
				);
			});
		} else {
			let opt_group = $('<optgroup label="' + optgroup + '">');
			$.each(dataArray, function (index, value) {
				let option_text = "";
				let option_val = "";
				$.each(value, function (key, val) {
					//console.log(key, val);
					if (key === "text") {
						option_text = val;
					} else {
						option_val += " " + key + "=\"" + val + "\"";
					}
				});
				let option = "<option" + option_val + ">" + option_text + "</option>";
				opt_group.append($(option)
					//.attr("value", value.id)
					//.text(value.name)
				);
			});
			opt_group.appendTo(select);
		}
	}
};
/**
 * Очистка селекта
 * @param select
 */
function clearSelect(select) {
	if (select.prop('tagName') === 'SELECT') {
		select.prop('options').length = 0;
	}
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

//Преобразование секунд во время
function secToTime(sec) {
	let dt = new Date();
	dt.setTime(sec * 1000);
	let hours = dt.getUTCHours();
	let minutes = dt.getUTCMinutes();
	// let seconds = dt.getUTCSeconds();
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
let ajax_url_debug = '';//'http://192.168.0.190/';
function sendRequest(url, data, success_action, error_target) {
	const response =  await fetch(ajax_url_debug + url, {
		method: 'GET',
		body: data,
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!responce.ok) {
		alertAjaxError(response, response.text(), error_target);
	}

	if (success_action !== false) {
		success_action(response.json());
	}
}

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

function Init() {
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

	

	//Запуск аудио
	let audio = document.getElementById("alert_audio");
	let playAudio = false;
	function stopSound() {
		audio.loop = false;
		audio.pause();
		if (isMobile && window.navigator && window.navigator.vibrate) {
			window.navigator.vibrate(0);
		}
		// audio.currentTime = 0;
		playAudio = false;
	}
	function playSound() {
		if (!playAudio && audio !== undefined) {
			//audio.pause();
			//audio.currentTime = 0;
			audio.load();

			playAudio = true;
			audio.loop = true;
			audio.play();
			// Вибрация поддерживается
			if (isMobile && window.navigator && window.navigator.vibrate) {
				navigator.vibrate(1000);
			}
			setTimeout(function () {
				audio.currentTime = 0;
				stopSound();
			}, 5000);
		}
	}

	//Кнопки + и -
	let flagSendProcess = false;
	let flagButtonPress = false;
	let timeout = false;
	let timeMouse = false;
	function f(n) {
		n = (typeof n === 'string') ? n : n.toString();
		if (n.indexOf('e') !== -1) return parseInt(n.split('e')[1]) * -1;
		let separator = (1.1).toString().split('1')[1];
		let parts = n.split(separator);
		return parts.length > 1 ? parts[parts.length - 1].length : 0;
	}
	// TODO не работает в ИЕ
	/*function f(x) {
		return x.toString().includes('.') ? x.toString().split('.').pop().length : 0;
	}*/
	$(document).on('mousedown', '.minus', function (e) {
		e.preventDefault();
		flagButtonPress = true;
		// flagSendProcess = false;
		let _this = $(this);
		let count_interval = 0;
		let time = 500;
		let $input = _this.parent().find('input');
		let step = Number($input.attr("step"));
		let min = Number($input.attr("min"));
		timeout = setInterval(function () {
			count_interval++;
			let fixed = 0;
			if (typeof min === typeof undefined && min === false) {
				min = 0;
			}
			if (typeof step !== typeof undefined && step !== false) {
				step = parseFloat(step);
				fixed = f(step);
			} else {
				step = 1;
			}
			if (count_interval > 3) {
				time = time / 2;
				step = step * 2;
				count_interval = 0;
			}
			let count = Number($input.val()) - step;
			count = count < min ? min : count;
			if (count > min) {
				count = count.toFixed(fixed);
			}
			//console.log(count,step);
			$input.val(count);
		}, time);
	});
	$(document).on('mouseup', '.minus', function (e) {
		e.preventDefault();
		let $input = $(this).parent().find('input');
		// $input.change();
		clearInterval(timeout);
		clearTimeout(timeMouse);
		timeMouse = setTimeout(function () { $input.change(); /*flagSendProcess = true;*/ }, 1000);
	});
	$(document).on('click', '.minus', function (e) {
		e.preventDefault();
		let $input = $(this).parent().find('input');
		let step = Number($input.attr("step"));
		let min = Number($input.attr("min"));
		let fixed = 0;
		// const f = x => ((x.toString().includes('.')) ? (x.toString().split('.').pop().length) : (0));
		if (typeof min === typeof undefined && min === false) {
			min = 0;
		}
		if (typeof step !== typeof undefined && step !== false) {
			step = parseFloat(step);
			fixed = f(step);
		} else {
			step = 1;
		}
		let count = Number($input.val()) - step;
		count = count < min ? min : count;
		if (count > min) {
			count = count.toFixed(fixed);
		}
		$input.val(count);
		//$input.change();
	});
	$(document).on('mousedown', '.plus', function (e) {
		//$(".plus").on('mouseup',function(e) {
		e.preventDefault();
		flagButtonPress = true;
		// flagSendProcess = true;
		let _this = $(this);
		let count_interval = 0;
		let time = 500;
		let $input = _this.parent().find('input');
		let step = Number($input.attr("step"));
		let max = Number($input.attr("max"));
		timeout = setInterval(function () {
			count_interval++;
			let fixed = 0;
			// const f = x => ((x.toString().includes('.')) ? (x.toString().split('.').pop().length) : (0));
			if (typeof max === typeof undefined && max === false) {
				max = 100;
			}
			if (typeof step !== typeof undefined && step !== false) {
				step = parseFloat(step);
				fixed = f(step);
			} else {
				step = 1;
			}
			if (count_interval > 3) {
				time = time / 2;
				step = step * 2;
				count_interval = 0;
			}
			//console.log(time,step);
			let count = Number($input.val()) + step;
			count = count > max ? max : count;
			count = count.toFixed(fixed);

			$input.val(count);//
			//$input.change();
			//return false;
		}, time);
	});
	$(document).on('mouseup', '.plus', function (e) {
		e.preventDefault();
		let $input = $(this).parent().find('input');

		clearInterval(timeout);
		clearTimeout(timeMouse);
		timeMouse = setTimeout(function () {/*flagSendProcess = true;*/$input.change(); }, 1000);
	});
	$(document).on('click', '.plus', function (e) {
		e.preventDefault();
		let $input = $(this).parent().find('input');
		let step = Number($input.attr("step"));
		let max = Number($input.attr("max"));
		let fixed = 0;
		// const f = x => ((x.toString().includes('.')) ? (x.toString().split('.').pop().length) : (0));
		if (typeof max === typeof undefined && max === false) {
			max = 100;
		}
		if (typeof step !== typeof undefined && step !== false) {
			step = parseFloat(step);
			fixed = f(step);
		} else {
			step = 1;
		}
		let count = Number($input.val()) + step;
		count = count > max ? max : count;
		//console.log(count,step,fixed);
		count = count.toFixed(fixed);
		$input.val(count);
		//$input.change();
	});
	$(document).on("change", ".number-group input.input-number", function () {
		let $input = $(this);
		let val = Number($input.val());
		let min = Number($input.attr("min"));
		let max = Number($input.attr("max"));
		if (val < min) {
			$input.val(parseFloat(min));
		} else if (val > max) {
			$input.val(parseFloat(max));
		} else {
			$input.val(parseFloat(val));
		}
	});

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

	

	//Шаблоны
	const pressureTemplate =
		'<div>' +
		'<div>' +
		'<div>Атмосферное давление</div>' +
		'<div ><span id="reflux_pressure"></span> <span class="hidden">мм рт.ст.</span></div>' +
		'</div>' +
		'<div >' +
		'<div >t&#176 кипения спирта при данном давлении</div>' +
		'<div ><span id="reflux_alco_boil"></span><span class="hidden">&#176С</span></div>' +
		'</div>' +
		'</div>';
	const deltaTempl =
		'<div>' +
		'<span>' +
		'<button type="button" class="btn btn-danger btn-number noSwipe" data-type="minus" data-field="count">' +
		'<span class="glyphicon glyphicon-minus"></span>' +
		'</button>' +
		'</span>' +
		'<input id="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}" size="4">' +
		'<span class="input-group-btn plus">' +
		'<button type="button" data-type="plus" data-field="count">' +
		'<span class="glyphicon glyphicon-plus"></span>' +
		'</button>' +
		'</span>' +
		'</div>';
	const powerTempl =
		'<div>' +
		'<div>' +
		'<div>Мощность тена</div>' +
		'<div><span id="${id_value}"></span><span class="hidden">%</span></div>' +
		'<div>' +
		returnTplHtml([{ id: "${id_set}", value: '0', min: '0', max: '100', step: '1' }], deltaTempl) +
		'</div>' +
		'</div>' +
		'</div>';
	const powerLowerTempl =
		'<div>' +
		'<div>' +
		'<div>Рабочая мощность после прогрева куба</div>' +
		'<div></div>' +
		'<div>' +
		returnTplHtml([{ id: "${id_lower_set}", value: '0', min: '0', max: '100', step: '1' }], deltaTempl) +
		'</div>' +
		'</div>' +
		'</div>';
	const pauseTempl =
		'<div class="row row-striped">' +
		'<div class="row-xs clearfix">${pause_thead}</div>' +
		'<div id="${id_step_bg}" class="pt-10 pb-10 clearfix">' +
		'<div id="${id_step_text}" class="col-xs-12 col-sm-3 text-center-xs text-middle text-strong">${pause_name}</div>' +
		'<div class="col-xs-5 col-xs-offset-0 col-sm-3 col-sm-offset-0 col-centered">' +
		returnTplHtml([{ id: "${id_time}", value: "${value_time}", min: '0', max: '360', step: '1' }], deltaTempl) +
		'</div>' +
		'<div class="col-xs-5 col-xs-offset-0 col-sm-3 col-sm-offset-0 col-centered">' +
		returnTplHtml([{ id: "${id_temperature}", value: "${value_temperature}", min: '0', max: '100', step: '1' }], deltaTempl) +
		'</div>' +
		'<div class="col-xs-2 col-xs-offset-0 col-sm-3 col-sm-offset-0 text-center text-middle">' +
		'<label class="checkbox-inline"><input class="noSwipe" ${checked_stop} id="${id_stop}" type="checkbox" value="Y"></label>' +
		'</div>' +
		'</div></div>'
		;
	
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

}