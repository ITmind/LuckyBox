#include "sensors.h"

#if defined Pressure_BMP085 || defined Pressure_BMP180
Adafruit_BMP085 bmp;
#elif defined Pressure_BMP280
Adafruit_BMP280 bmp;
#elif defined Pressure_BME280
Adafruit_BME280 bmp;
#endif

OneWire ds(DS_Pin);
byte data[9];

#define Lo(num1) (num1 & 0xFF)
#define Hi(num2) ((num2 & 0xFF00) >> 8)

void initPressureSensor()
{
	pressureSensor.status = 0;
#if defined Pressure_BMP085 || defined Pressure_BMP180
	if (!bmp.begin(BMP085_STANDARD)) Serial.println("Ooops, no Pressure sensor BMP085 detected ... Check your wiring or I2C Addres!");
	else pressureSensor.status = 1;
#elif defined Pressure_BMP280
	if (!bmp.begin(0x76, 0x58))	Serial.println("Ooops, no Pressure sensor BMP280 detected ... Check your wiring or I2C Addres!");
	else pressureSensor.status = 1;
#elif defined Pressure_BME280
	if (!bmp.begin(0x76))	Serial.println("Ooops, no Pressure sensor BME280 detected ... Check your wiring or I2C Addres!");
	else pressureSensor.status = 1;
#endif
}

void pressureRead()
{
#if defined Pressure_BMP085 || defined Pressure_BMP180 || defined Pressure_BMP280 || defined Pressure_BME280
	if (pressureSensor.status) pressureSensor.data = bmp.readPressure() / 133.3;
#endif
}

void senseWebInit() {
	// инициализация Web и чтение из памяти ранее запомненных датчиков
	HTTP.on("/sensorsInSet", sensorsUserSetInWeb);    // прием и сохранение параметров датчиков
	HTTP.on("/sensorsOutSet", sensorsUserSetOutWeb);  // отправка параметров датчиков
	HTTP.on("/SensorsOut", handleProcessSensorOut);		// отправка всех датчиков и входов выходов для индикации в процессе рект.
	HTTP.on("/SensorsIn", handleProcessModeIn);			// прием старт, стоп, уставок для всех процессов
	HTTP.on("/resetData", handleResetDataEeprom);		// очистка сохраненной структуры датчиков
}

void dallSearch()
{
	uint16_t index = 1;
	int i, k, t;
	bool newDS;
	EEPROM.begin(2048);
	if (EEPROM.read(0) != 0xFF) {
		// датчики температуры
		for (i = 0; i < 8; i++) {
			for (k = 0; k < 8; k++) { temperatureSensor[i].addr[k] = EEPROM.read(index); index++; }
			temperatureSensor[i].num = EEPROM.read(index);  index++;
			temperatureSensor[i].color = EEPROM.read(index);  temperatureSensor[i].color <<= 8;  index++;  temperatureSensor[i].color += EEPROM.read(index);  index++;
			for (k = 0; k < 60; k++) { temperatureSensor[i].name[k] = EEPROM.read(index);  index++; }
		}
		// датчик давления
		pressureSensor.color = EEPROM.read(index);  pressureSensor.color <<= 8;  index++;  pressureSensor.color += EEPROM.read(index);  index++;
		pressureSensor.member = EEPROM.read(index);
		// out
		for (i = 0; i < 8; i++) {
			for (k = 0; k < 60; k++) { pwmOut[i].name[k] = EEPROM.read(index);  index++; }
		}
		// in
		for (i = 0; i < 4; i++) {
			for (k = 0; k < 60; k++) { adcIn[i].name[k] = EEPROM.read(index);  index++;	}
		}
	}
	else {
		// датчики температуры
		for (i = 0; i < 8; i++) {
			temperatureSensor[i].num = 0;
			temperatureSensor[i].color = 0;
			temperatureSensor[i].name[0] = 0;
		}
		// датчик давления
		pressureSensor.color = 0;
		pressureSensor.member = 0;
		// out
		for (i = 0; i < 8; i++) {
			pwmOut[i].name[0] = 0;
		}
		// in
		for (i = 0; i < 4; i++) {
			adcIn[i].name[0] = 0;
		}
	}

	// поиск датчиков, определение их количества и сохранение их адресов
	for (i = 0; i < DS_Cnt; i++) {
		if (!ds.search(temperatureSensor[i].addrSearch)) break;
		if (ds.crc8(temperatureSensor[i].addrSearch, 7) != temperatureSensor[i].addrSearch[7]) break;
	}
	DS_Count = i;
	for (k = i; k < DS_Cnt; k++) { temperatureSensor[k].data = 150.0; }
	// проверим соответствие расстановки датчиков
	for (i = 0; i < DS_Count; i++) {
		newDS = true;
		for (k = 0; k < DS_Cnt; k++) {
			// нашли уже прописанный датчик
			if (temperatureSensor[i].addrSearch[0] == temperatureSensor[k].addr[0] && temperatureSensor[i].addrSearch[1] == temperatureSensor[k].addr[1]
				&& temperatureSensor[i].addrSearch[2] == temperatureSensor[k].addr[2] && temperatureSensor[i].addrSearch[3] == temperatureSensor[k].addr[3]
				&& temperatureSensor[i].addrSearch[4] == temperatureSensor[k].addr[4] && temperatureSensor[i].addrSearch[5] == temperatureSensor[k].addr[5]
				&& temperatureSensor[i].addrSearch[6] == temperatureSensor[k].addr[6] && temperatureSensor[i].addrSearch[7] == temperatureSensor[k].addr[7]) {
					// i = найденный датчик, k = прописанный в EEPROM датчик
					temperatureSensor[i].allert = temperatureSensor[k].allert;
					temperatureSensor[i].color = temperatureSensor[k].color;
					temperatureSensor[i].member = temperatureSensor[k].member;
					temperatureSensor[i].num = temperatureSensor[k].num;
					temperatureSensor[i].priority = temperatureSensor[k].priority;
					for (t = 0; t < 8; t++) { temperatureSensor[i].addr[t] = temperatureSensor[i].addrSearch[t]; }
					for (t = 0; t < 60; t++) { temperatureSensor[i].name[t] = temperatureSensor[k].name[t]; }
					newDS = false;

					if (temperatureSensor[i].num == 1) DS_Cube = i;
					else if (temperatureSensor[i].num == 2) DS_Tube = i;
					else if (temperatureSensor[i].num == 3) DS_Out = i;
					else if (temperatureSensor[i].num == 4) DS_Def = i;
					else if (temperatureSensor[i].num == 5) DS_Res1 = i;
					else if (temperatureSensor[i].num == 6) DS_Res2 = i;
					else if (temperatureSensor[i].num == 7) DS_Res3 = i;
					else if (temperatureSensor[i].num == 8) DS_Res4 = i;
			}
		}
		// иначе датчик отсутствует в нашем списке
		if (newDS == true) {
			temperatureSensor[i].allert = 0;
			temperatureSensor[i].color = 0;
			temperatureSensor[i].member = 0;
			temperatureSensor[i].num = 0;
			temperatureSensor[i].priority = 0;
			for (t = 0; t < 8; t++) { temperatureSensor[i].addr[t] = temperatureSensor[i].addrSearch[t]; }
			temperatureSensor[i].name[0] = 0;
		}
	}
#if defined Debug_en
	Serial.println("До сортировки:");
	Serial.println(temperatureSensor[0].num);
	Serial.println(temperatureSensor[1].num);
	Serial.println(temperatureSensor[2].num);
	Serial.println(temperatureSensor[3].num);
	Serial.println(temperatureSensor[4].num);
	Serial.println(temperatureSensor[5].num);
	Serial.println(temperatureSensor[6].num);
	Serial.println(temperatureSensor[7].num);
#endif
	// проверим нумерацию
	byte n1, n2, n3, n4, n5, n6, n7, n8;
	for (i = 0; i < DS_Cnt; i++) {
		n1 = temperatureSensor[0].num;
		n2 = temperatureSensor[1].num;
		n3 = temperatureSensor[2].num;
		n4 = temperatureSensor[3].num;
		n5 = temperatureSensor[4].num;
		n6 = temperatureSensor[5].num;
		n7 = temperatureSensor[6].num;
		n8 = temperatureSensor[7].num;
		// датчик не имеет номер 1 - 8
		if (temperatureSensor[i].num < 1 || temperatureSensor[i].num > 8) {
			if (n1 != 1 && n2 != 1 && n3 != 1 && n4 != 1 && n5 != 1 && n6 != 1 && n7 != 1 && n8 != 1) temperatureSensor[i].num = 1;
			else if (n1 != 2 && n2 != 2 && n3 != 2 && n4 != 2 && n5 != 2 && n6 != 2 && n7 != 2 && n8 != 2) temperatureSensor[i].num = 2;
			else if (n1 != 3 && n2 != 3 && n3 != 3 && n4 != 3 && n5 != 3 && n6 != 3 && n7 != 3 && n8 != 3) temperatureSensor[i].num = 3;
			else if (n1 != 4 && n2 != 4 && n3 != 4 && n4 != 4 && n5 != 4 && n6 != 4 && n7 != 4 && n8 != 4) temperatureSensor[i].num = 4;
			else if (n1 != 5 && n2 != 5 && n3 != 5 && n4 != 5 && n5 != 5 && n6 != 5 && n7 != 5 && n8 != 5) temperatureSensor[i].num = 5;
			else if (n1 != 6 && n2 != 6 && n3 != 6 && n4 != 6 && n5 != 6 && n6 != 6 && n7 != 6 && n8 != 6) temperatureSensor[i].num = 6;
			else if (n1 != 7 && n2 != 7 && n3 != 7 && n4 != 7 && n5 != 7 && n6 != 7 && n7 != 7 && n8 != 7) temperatureSensor[i].num = 7;
			else if (n1 != 8 && n2 != 8 && n3 != 8 && n4 != 8 && n5 != 8 && n6 != 8 && n7 != 8 && n8 != 8) temperatureSensor[i].num = 8;
		}
	}
#if defined Debug_en
	Serial.println("После сортировки:");
	Serial.println(temperatureSensor[0].num);
	Serial.println(temperatureSensor[1].num);
	Serial.println(temperatureSensor[2].num);
	Serial.println(temperatureSensor[3].num);
	Serial.println(temperatureSensor[4].num);
	Serial.println(temperatureSensor[5].num);
	Serial.println(temperatureSensor[6].num);
	Serial.println(temperatureSensor[7].num);
#endif
	for (i = 0; i < DS_Cnt; i++) {
		temperatureSensor[i].dataT[0] = 150.0;
		temperatureSensor[i].dataT[1] = 150.0;
		temperatureSensor[i].dataT[2] = 150.0;
		temperatureSensor[i].dataT[3] = 150.0;
	}
	
	// установим разрядность, и пропустим симофоры
	for (i = 0; i < DS_Count; i++) {
		ds.reset(); // запрос шины 1-Wire
		ds.select(temperatureSensor[i].addrSearch); // выбор нашего DS18B20
		ds.write(0x4E); // запись в  scratchPad
		ds.write(0x00); // User byte 0 - Unused
		ds.write(0x00); // User byte 1 - Unused
		ds.write(0x7F); // выставляем 12 бит (0x7F)
	}
	ds.reset(); // сбрасываем 1-Wire

#if defined Debug_en
	Serial.print("Temperature sensor found: ");
	Serial.println(DS_Count);
	Serial.println("......");
#endif
	EEPROM.end();
}

void dallRead(uint8_t numTerm) {
	int i = DS_Count;
	float dt1, dt2, dt3, dt4;
	float TiCube;
	//byte ii;

	if (numTerm > DS_Count) {
		while (i) {
			ds.reset();
			ds.select(temperatureSensor[i-1].addrSearch);
			ds.write(0xBE); //Считывание значения с датчика
			temperatureSensor[i-1].dataT[3] = temperatureSensor[i-1].dataT[2];
			temperatureSensor[i-1].dataT[2] = temperatureSensor[i-1].dataT[1];
			temperatureSensor[i-1].dataT[1] = temperatureSensor[i-1].dataT[0];
			temperatureSensor[i-1].dataT[0] = (short)(ds.read() | ds.read() << 8);
			temperatureSensor[i-1].dataT[0] *= 0.0625;
			temperatureSensor[i-1].dataT[0] *= 100;
			temperatureSensor[i-1].dataT[0] = floor(temperatureSensor[i-1].dataT[0] + 0.5);
			temperatureSensor[i-1].dataT[0] /= 100;

			// вычислим ближайший к текущему значению результат
			dt1 = abs(temperatureSensor[i-1].dataT[0] - temperatureSensor[i-1].data);
			dt2 = abs(temperatureSensor[i-1].dataT[1] - temperatureSensor[i-1].data);
			dt3 = abs(temperatureSensor[i-1].dataT[2] - temperatureSensor[i-1].data);
			dt4 = abs(temperatureSensor[i-1].dataT[3] - temperatureSensor[i-1].data);
			if (dt1 <= dt2 && dt1 <= dt3 && dt1 <= dt4 && temperatureSensor[i-1].dataT[0] > 0) temperatureSensor[i-1].data = temperatureSensor[i-1].dataT[0];
			else if (dt2 <= dt1 && dt2 <= dt3 && dt2 <= dt4 && temperatureSensor[i-1].dataT[1] > 0) temperatureSensor[i-1].data = temperatureSensor[i-1].dataT[1];
			else if (dt3 <= dt1 && dt3 <= dt2 && dt3 <= dt4 && temperatureSensor[i-1].dataT[2] > 0) temperatureSensor[i-1].data = temperatureSensor[i-1].dataT[2];
			else if (dt4 <= dt1 && dt4 <= dt2 && dt4 <= dt3 && temperatureSensor[i-1].dataT[3] > 0) temperatureSensor[i-1].data = temperatureSensor[i-1].dataT[3];
			i--;
		}
		ds.reset();
		ds.write(0xCC); //Обращение ко всем датчикам
		ds.write(0x44); //Команда на конвертацию
	}
	else {
		i = numTerm;
		switch (byteDsRead)	{
			case 0: {
				ds.reset();
				ds.select(temperatureSensor[i].addrSearch);
				ds.write(0xBE);
				data[byteDsRead] = ds.read();
				break;
			}
			case 1:	data[byteDsRead] = ds.read(); break;
			case 2:	data[byteDsRead] = ds.read(); break;
			case 3:	data[byteDsRead] = ds.read(); break;
			case 4:	data[byteDsRead] = ds.read(); break;
			case 5:	data[byteDsRead] = ds.read(); break;
			case 6:	data[byteDsRead] = ds.read(); break;
			case 7:	data[byteDsRead] = ds.read(); break;
			case 8: {
				data[byteDsRead] = ds.read();

				temperatureSensor[i].dataT[3] = temperatureSensor[i].dataT[2];
				temperatureSensor[i].dataT[2] = temperatureSensor[i].dataT[1];
				temperatureSensor[i].dataT[1] = temperatureSensor[i].dataT[0];
				if (ds.crc8(data, 8) == data[8]) {
					temperatureSensor[i].dataT[0] = (short)(data[0] | data[1] << 8);
					temperatureSensor[i].timeErr = 0;
					temperatureSensor[i].dataT[0] *= 0.0625;
					temperatureSensor[i].dataT[0] *= 100;
					temperatureSensor[i].dataT[0] = floor(temperatureSensor[i].dataT[0] + 0.5);
					temperatureSensor[i].dataT[0] /= 100;
				}
				else {
					if (temperatureSensor[i].timeErr < 15) temperatureSensor[i].timeErr++;  // 15 секунд - допуск на ошибку
					else temperatureSensor[i].dataT[0] = 150;
				}
				// вычислим ближайший к текущему значению результат
				dt1 = abs(temperatureSensor[i].dataT[0] - temperatureSensor[i].data);
				dt2 = abs(temperatureSensor[i].dataT[1] - temperatureSensor[i].data);
				dt3 = abs(temperatureSensor[i].dataT[2] - temperatureSensor[i].data);
				dt4 = abs(temperatureSensor[i].dataT[3] - temperatureSensor[i].data);
				if (dt1 <= dt2 && dt1 <= dt3 && dt1 <= dt4 && temperatureSensor[i].dataT[0] > 0) temperatureSensor[i].data = temperatureSensor[i].dataT[0];
				else if (dt2 <= dt1 && dt2 <= dt3 && dt2 <= dt4 && temperatureSensor[i].dataT[1] > 0) temperatureSensor[i].data = temperatureSensor[i].dataT[1];
				else if (dt3 <= dt1 && dt3 <= dt2 && dt3 <= dt4 && temperatureSensor[i].dataT[2] > 0) temperatureSensor[i].data = temperatureSensor[i].dataT[2];
				else if (dt4 <= dt1 && dt4 <= dt2 && dt4 <= dt3 && temperatureSensor[i].dataT[3] > 0) temperatureSensor[i].data = temperatureSensor[i].dataT[3];
				break;
			}
		}
	}

	// расчет остатка спирта в кубе
	if (temperatureSensor[DS_Cube].data > 80) {
		TiCube = ((temperatureSensor[DS_Cube].data + ((760 - pressureSensor.data) * 0.037)) - 89) / 6.49;
		temperatureCubeAlcohol = 17.26 - TiCube * (18.32 - TiCube * (7.81 - TiCube * (1.77 - TiCube * (4.81 - TiCube * (2.95 + TiCube * (1.43 - TiCube * (0.8 + 0.05 * TiCube)))))));
	}
	else temperatureCubeAlcohol = 100;
}
// прием и сохранение параметров датчиков
void sensorsUserSetInWeb() {
	String arg, name;
	uint16_t index = 0;
	int i, k;
	// парсим ответ от браузера в переменные
	StateDsReset = 0;
	for (i = 0; i < 8; i++) {
		arg = "t" + String(i + 1);
		temperatureSensor[i].num = HTTP.arg(arg + "[number]").toInt();
		name = HTTP.arg(arg + "[name]");
		strcpy(temperatureSensor[i].name, name.c_str());
		temperatureSensor[i].color = HTTP.arg(arg + "[color]").toInt();
	}
	pressureSensor.color = HTTP.arg("p1[color]").toInt();
	for (i = 0; i < 8; i++) {
		arg = "out" + String(i + 1);
		name = HTTP.arg(arg + "[name]");
		strcpy(pwmOut[i].name, name.c_str());
	}
	for (i = 0; i < 4; i++) {
		arg = "in" + String(i + 1);
		name = HTTP.arg(arg + "[name]");
		strcpy(adcIn[i].name, name.c_str());
	}

	// сохраним в EEPROM
	EEPROM.begin(2048);
	EEPROM.write(index, DS_Count); index++; // кол-во датчиков и признак что данные в EEPROM были сохранены
	for (i = 0; i < 8; i++) {
		for (k = 0; k < 8; k++) { EEPROM.write(index, temperatureSensor[i].addr[k]); index++; }
		EEPROM.write(index, temperatureSensor[i].num);  index++;
		if (temperatureSensor[i].num == 1) DS_Cube = i;
		else if (temperatureSensor[i].num == 2) DS_Tube = i;
		else if (temperatureSensor[i].num == 3) DS_Out = i;
		else if (temperatureSensor[i].num == 4) DS_Def = i;
		else if (temperatureSensor[i].num == 5) DS_Res1 = i;
		else if (temperatureSensor[i].num == 6) DS_Res2 = i;
		else if (temperatureSensor[i].num == 7) DS_Res3 = i;
		else if (temperatureSensor[i].num == 8) DS_Res4 = i;

		EEPROM.write(index, Hi(temperatureSensor[i].color));  index++; EEPROM.write(index, Lo(temperatureSensor[i].color));  index++;
		for (k = 0; k < 60; k++) { EEPROM.write(index, temperatureSensor[i].name[k]);  index++; }
	}
	EEPROM.write(index, Hi(pressureSensor.color));  index++;  EEPROM.write(index, Lo(pressureSensor.color));  index++;
	EEPROM.write(index, pressureSensor.member);
	for (i = 0; i < 8; i++) {
		for (k = 0; k < 60; k++) { EEPROM.write(index, pwmOut[i].name[k]);  index++; }
	}
	for (i = 0; i < 4; i++) {
		for (k = 0; k < 60; k++) { EEPROM.write(index, adcIn[i].name[k]);  index++; }
	}

	delay(250);
	EEPROM.end();
	HTTP.send(200, "text/json", "{\"result\":\"ok\"}");
	// перераспредилим датчики сразу
	dallSearch();
	dallRead(10);
}
// отправка параметров датчиков
void sensorsUserSetOutWeb() {
	int i, k;//, l;
	String dataForWeb = "{";
	// датчики температуры упорядоченные по полям num
	for (i = 1; i <= DS_Cnt; i++) {
		k = 0;
		while (1) {
			if (temperatureSensor[k].num == i) {
				dataForWeb += "\"t" + String(i) + "\":{\"value\":" + String(temperatureSensor[k].data);
				dataForWeb += ",\"name\":\"" + String(temperatureSensor[k].name) + "\",\"color\":" + String(temperatureSensor[k].color) + "},";
				break;
			}
			if (k < 7) k++;
			else break;
		}
	}
	// датчик давления
	dataForWeb += "\"p1\":{\"value\":" + String(pressureSensor.data) + ",\"color\":" + String(pressureSensor.color) + "},";
	// выходы ШИМ
	for (i = 0; i < 8; i++) {
		dataForWeb += "\"out" + String(i + 1) + "\":{\"value\":" + String(pwmOut[i].data) + ",\"name\":\"" + String(pwmOut[i].name) + "\"},";
	}
	// входы АЦП
	dataForWeb += "\"in1\":{\"value\":" + String(adcIn[0].data) + ",\"name\":\"" + String(adcIn[0].name) + "\"},";
	dataForWeb += "\"in2\":{\"value\":" + String(adcIn[1].data) + ",\"name\":\"" + String(adcIn[1].name) + "\"},";
	dataForWeb += "\"in3\":{\"value\":" + String(adcIn[2].data) + ",\"name\":\"" + String(adcIn[2].name) + "\"},";
	dataForWeb += "\"in4\":{\"value\":" + String(adcIn[3].data) + ",\"name\":\"" + String(adcIn[3].name) + "\"}}";
	HTTP.send(200, "text/json", dataForWeb);
}

// Отправка всех датчиков и входов выходов для интикации в процессе рект./дист./затир./пив.
void handleProcessSensorOut() {
	int i, k;
	float cubeAlcohol;
	if (temperatureCubeAlcohol <= 50 && temperatureCubeAlcohol > 0) cubeAlcohol = temperatureCubeAlcohol;
	else cubeAlcohol = 0;
	temperatureAlcoholBoil = 78.91 - (780 - pressureSensor.data)*0.038; // расчет температуры кипения спирта при данном давлении
	settingColumnShow = settingColumn + (temperatureAlcoholBoil - temperatureStartPressure); // расчет уставки при изменившемся атмосферном давлении
	String dataForWeb = "{\"process\":{\"allow\":" + String(processMode.allow) + ",\"number\":" + String(processMode.number);
	dataForWeb += ",\"step\":\"" + String(nameProcessStep) + "\",\"time\":" + String(processMode.timeStep) + ",\"timeStart\":" + String(processMode.timeStart) + "},\"sensors\":[";
	// датчики температуры
	for (i = 1; i <= DS_Cnt; i++) {
		k = 0;
		while (1) {
			if (temperatureSensor[k].num == i) {
				dataForWeb += "{\"t" + String(i) + "\":{\"value\":" + String(temperatureSensor[k].data);
				dataForWeb += ",\"name\":\"" + String(temperatureSensor[k].name) + "\",\"color\":" + String(temperatureSensor[k].color);
				dataForWeb += ",\"member\":" + String(temperatureSensor[k].member) + ",\"priority\":" + String(temperatureSensor[k].priority);
				//dataForWeb += ",\"member\":" + String(temperatureSensor[k].member); // без приоритета
				dataForWeb += ",\"allertValue\":" + String(temperatureSensor[k].allertValue) + "}},";
				break;
			}
			if (k < 7) k++;
			else break;
		}
	}
	dataForWeb += "{\"p1\":{\"value\":" + String(pressureSensor.data) + ",\"color\":" + String(pressureSensor.color);
	dataForWeb += ",\"member\":" + String(pressureSensor.member) + "}}],";
	// mashing
	dataForWeb += "\"mashing\":[";
	dataForWeb += "{\"pause1\":{\"time\":" + String(processMashing[0].time) + ",\"name\":\"Кислотная пауза\",\"temperature\":";
	dataForWeb += String(processMashing[0].temperature) + ",\"stop\":" + String(processMashing[0].stop) + ",\"step\":" + String(processMashing[0].step) + "}},";
	dataForWeb += "{\"pause2\":{\"time\":" + String(processMashing[1].time) + ",\"name\":\"Белковая пауза\",\"temperature\":";
	dataForWeb += String(processMashing[1].temperature) + ",\"stop\":" + String(processMashing[1].stop) + ",\"step\":" + String(processMashing[1].step) + "}},";
	dataForWeb += "{\"pause3\":{\"time\":" + String(processMashing[2].time) + ",\"name\":\"Мальтозная пауза\",\"temperature\":";
	dataForWeb += String(processMashing[2].temperature) + ",\"stop\":" + String(processMashing[2].stop) + ",\"step\":" + String(processMashing[2].step) + "}},";
	dataForWeb += "{\"pause4\":{\"time\":" + String(processMashing[3].time) + ",\"name\":\"Осахаривание\",\"temperature\":";
	dataForWeb += String(processMashing[3].temperature) + ",\"stop\":" + String(processMashing[3].stop) + ",\"step\":" + String(processMashing[3].step) + "}},";
	dataForWeb += "{\"pause5\":{\"time\":" + String(processMashing[4].time) + ",\"name\":\"Мэш аут\",\"temperature\":";
	dataForWeb += String(processMashing[4].temperature) + ",\"stop\":" + String(processMashing[4].stop) + ",\"step\":" + String(processMashing[4].step) + "}}],";
	// brewing
	// ...
	// devices
	dataForWeb += "\"devices\":[";
	for (i = 0; i < PWM_Cnt; i++) {
		dataForWeb += "{\"out" + String(i + 1) + "\":{\"value\":" + String(pwmOut[i].data) + ",\"member\":" + String(pwmOut[i].member) + ",\"allert\":" + String(pwmOut[i].allert);
		if (i < (PWM_Cnt - 1)) dataForWeb += "}},";
	}
	// импульсный режим на клапана
	dataForWeb += "}}],\"valwe\":[";
	dataForWeb += "{\"head\":{\"timeCycle\":" + String(headTimeCycle) + ",\"timeOn\":" + String(headtimeOn) + "}},";
	dataForWeb += "{\"headSteam\":{\"percent\":" + String(headSteamPercent) + "}},";
	dataForWeb += "{\"body\":{\"timeCycle\":" + String(bodyTimeCycle) + ",\"timeOn\":" + String(bodytimeOn) + ",\"decline\":" + String(decline) + "}},";
	dataForWeb += "{\"bodyPrima\":{\"percentStart\":" + String(bodyPrimaPercentStart) + ",\"percentStop\":" + String(bodyPrimaPercentStop) + ",\"decline\":" + String(bodyPrimaDecline);
	// АЦП
	dataForWeb += "}}],\"safety\":[";
	for (i = 0; i < ADC_Cnt; i++) {
		dataForWeb += "{\"in" + String(i + 1) + "\":{\"value\":" + String(adcIn[i].data) + ",\"member\":" + String(adcIn[i].member) + ",\"allert\":" + String(adcIn[i].allert);
		if (i < (ADC_Cnt - 1)) dataForWeb += "}},";
	}
	// калибровка PID
	dataForWeb += "}}],\"pid\":[{\"Kp\":{\"userSetValue\":" + String(Kp) + "}},";
	dataForWeb += "{\"Ki\":{\"userSetValue\":" + String(Ki) + "}},";
	dataForWeb += "{\"Kd\":{\"userSetValue\":" + String(Kd) + "}},";
	dataForWeb += "{\"t1\":{\"userSetValue\":" + String(setTempForPID) + "}}]";
	// power & other
	dataForWeb += ",\"version\":" + String(versionForWeb) + ",\"power\":" + String(power.heaterPower) + ",\"powerHigh\":" + String(power.inPowerHigh) + ",\"powerLower\":" + String(power.inPowerLow) + ",\"temperatureAlcoholBoil\":" + String(temperatureAlcoholBoil);
	//dataForWeb += ",\"temperatureStartPressure\":" + String(settingColumnShow) + ",\"cubeAlcohol\":" + String(cubeAlcohol) + ",\"sound\":" + String(settingAlarm) + ",\"answer\":" + String(answer) + "}";
	dataForWeb += ",\"cubeAlcohol\":" + String(cubeAlcohol) + ",\"sound\":" + String(settingAlarm) + ",\"answer\":" + String(answer) + "}";

	HTTP.send(200, "text/json", dataForWeb);
}
// Прием старт, стоп, уставок и отсечек.
void handleProcessModeIn() {
	String arg;
	float tmpAllertValue;
	int i;
	byte n;
	float allertReadTmp;
	//commandWriteSD = "WebSend: ";
	bool allertSave = false;
	EEPROM.begin(2048);
	// парсим ответ от браузера в переменные
	uint8_t processModeOld = processMode.allow;
	processMode.allow = HTTP.arg("process[allow]").toInt();
	processMode.number = HTTP.arg("process[number]").toInt();

	// проверим выбраны ли датчики для процесса
	if (processMode.allow == 1 && EEPROM.read(1300) != 1) {
		processMode.allow = 0;
		processMode.number = 0;
	}
	else if (processMode.allow == 2 && EEPROM.read(1400) != 2) {
		processMode.allow = 0;
		processMode.number = 0;
	}
	else if (processMode.allow == 3 && EEPROM.read(1500) != 3) {
		processMode.allow = 0;
		processMode.number = 0;
	}

	if (processMode.allow < 3) {
#if defined Debug_en
		Serial.println(""); Serial.println("Прием уставок:");
#endif
		for (i = 0; i < DS_Cnt; i++) {
			n = temperatureSensor[i].num - 1;
			arg = "t" + String(n + 1);
			tmpAllertValue = HTTP.arg(arg + "[allertValue]").toFloat();
			
			if (temperatureSensor[i].num != 2) {
				if (tmpAllertValue > 10) temperatureSensor[i].allertValue = tmpAllertValue;
				else temperatureSensor[i].allertValue = 0;
			}
			else {
				if (tmpAllertValue > 0 && tmpAllertValue != temperatureSensor[i].allertValueIn) {
					reSetTemperatureStartPressure = true;
					commandWriteSD = "WebSend: Смена уставки";
					commandSD_en = true;
				}
				else if (tmpAllertValue == 0 && tmpAllertValue != temperatureSensor[i].allertValueIn) {
					commandWriteSD = "WebSend: Отмена уставки";
					commandSD_en = true;
				}
			}
			temperatureSensor[i].allertValueIn = tmpAllertValue;

			// Запишем значение введенных отсечек или уставок в EEPROM
			if (processMode.allow == 1) {
				allertReadTmp = EEPROM_float_read(1303 + i * 7);
				if (allertReadTmp != tmpAllertValue) { // дистилляция
					EEPROM_float_write((1303 + i * 7), temperatureSensor[i].allertValueIn);
					allertSave = true;
				}
			}
			//else if (processMode.allow == 2 && processMode.number > 0) {
			else if (processMode.allow == 2) {
				allertReadTmp = EEPROM_float_read(1403 + i * 8);
				if (allertReadTmp != tmpAllertValue) { // ректификация
					EEPROM_float_write((1403 + i * 8), temperatureSensor[i].allertValueIn);
					allertSave = true;
				}
			}
#if defined Debug_en
			Serial.print(n); Serial.print(" Номер: ");  Serial.println(temperatureSensor[i].num);
			Serial.print("Получили уставку: ");  Serial.println(tmpAllertValue);
			Serial.print("Member: ");  Serial.println(temperatureSensor[i].member);
			Serial.print("Уставка: ");  Serial.println(temperatureSensor[i].allertValue);
#endif
		}
	}

	if (processMode.allow == 1) {
		// запись в EEPROM параметров мощности для дистилляции
		power.inPowerHigh = HTTP.arg("powerHigh").toInt();
		if (power.inPowerHigh > 100) power.inPowerHigh = 100;
		if (power.inPowerHigh != EEPROM.read(1397)) {
			EEPROM.write(1397, power.inPowerHigh);
			allertSave = true;
		}
		power.inPowerLow = HTTP.arg("powerLower").toInt();
		if (power.inPowerLow > 100) power.inPowerLow = 100;
		if (power.inPowerLow != EEPROM.read(1398)) {
			EEPROM.write(1398, power.inPowerLow);
			allertSave = true;
		}
	}
	else if (processMode.allow == 2) {
		// запись в EEPROM параметров мощности для ректификации
		power.inPowerHigh = HTTP.arg("powerHigh").toInt();
		if (power.inPowerHigh > 100) power.inPowerHigh = 100;
		if (power.inPowerHigh != EEPROM.read(1497)) {
			EEPROM.write(1497, power.inPowerHigh);
			allertSave = true;
		}
		power.inPowerLow = HTTP.arg("powerLower").toInt();
		if (power.inPowerLow > 100) power.inPowerLow = 100;
		if (power.inPowerLow != EEPROM.read(1498)) {
			EEPROM.write(1498, power.inPowerLow);
			allertSave = true;
		}
		if (processMode.number != EEPROM.read(1499)) {
			EEPROM.write(1499, processMode.number);
			allertSave = true;
		}
		// параметры для клапанов и шарового крана + запись в EEPROM
		if (processMode.number == 1 || processMode.number == 3) {					// головы = Прима и РК по жиже
			headTimeCycle = HTTP.arg("head[timeCycle]").toInt();
			if (headTimeCycle > 30) headTimeCycle = 30;
			headtimeOn = HTTP.arg("head[timeOn]").toFloat();
			if (headtimeOn > 100) headtimeOn = 100;
			if (headTimeCycle != EEPROM.read(1477)) {
				EEPROM.write(1477, headTimeCycle);
				allertSave = true;
			}
			if (headtimeOn != EEPROM_float_read(1478)) {
				EEPROM_float_write(1478, headtimeOn);
				allertSave = true;
			}
		}
		if (processMode.number == 3) {												// тело = РК по жиже
			bodyTimeCycle = HTTP.arg("body[timeCycle]").toInt();
			if (headTimeCycle > 30) headTimeCycle = 30;
			bodytimeOn = HTTP.arg("body[timeOn]").toFloat();
			if (headtimeOn > 100) headtimeOn = 100;
			decline = HTTP.arg("body[decline]").toInt();
			if (decline > 30) decline = 30;
			if (bodyTimeCycle != EEPROM.read(1482)) {
				EEPROM.write(1482, bodyTimeCycle);
				allertSave = true;
			}
			if (bodytimeOn != EEPROM_float_read(1483)) {
				EEPROM_float_write(1483, bodytimeOn);
				allertSave = true;
			}
			if (decline != EEPROM.read(1487)) {
				EEPROM.write(1487, decline);
				allertSave = true;
			}
		}
		if (processMode.number == 2) {												// головы = По пару
			headSteamPercent = HTTP.arg("headSteam[percent]").toInt();
			if (headSteamPercent > 100) headSteamPercent = 100;
			if (headSteamPercent != EEPROM.read(1490)) {
				EEPROM.write(1490, headSteamPercent);
				allertSave = true;
			}
		}
		if (processMode.number == 1 || processMode.number == 2) {					// тело = Прима и По пару
			bodyPrimaPercentStart = HTTP.arg("bodyPrima[percentStart]").toInt();
			if (bodyPrimaPercentStart > 100) bodyPrimaPercentStart = 100;
			bodyPrimaPercentStop = HTTP.arg("bodyPrima[percentStop]").toInt();
			if (bodyPrimaPercentStop > 100) bodyPrimaPercentStop = 100;
			bodyPrimaDecline = HTTP.arg("bodyPrima[decline]").toInt();
			if (bodyPrimaDecline > 30) bodyPrimaDecline = 30;
			if (bodyPrimaPercentStart != EEPROM.read(1491)) {
				EEPROM.write(1491, bodyPrimaPercentStart);
				allertSave = true;
			}
			if (bodyPrimaPercentStop != EEPROM.read(1492)) {
				EEPROM.write(1492, bodyPrimaPercentStop);
				allertSave = true;
			}
			if (bodyPrimaDecline != EEPROM.read(1493)) {
				EEPROM.write(1493, bodyPrimaDecline);
				allertSave = true;
			}
		}
	}
	else if (processMode.allow == 3) {
		for (i = 0; i < 5; i++) {
			arg = "pause" + String(i + 1);
			processMashing[i].time = HTTP.arg(arg + "[time]").toInt();
			processMashing[i].temperature = HTTP.arg(arg + "[temperature]").toFloat();
			processMashing[i].stop = HTTP.arg(arg + "[stop]").toInt();
		}
	}

	stepNext = HTTP.arg("stepNext").toInt();
	answer = HTTP.arg("answer").toInt();

	// для записи лога на SD
	if (processModeOld != processMode.allow && processMode.allow < 4) {
		if (processMode.allow == 0) {
			commandWriteSD = "WebSend: Стоп";
			stopInfoOutScreen = true;
			touchScreen = 0;
		}
		else commandWriteSD = "WebSend: Старт";
		commandSD_en = true;
	}

	if (processModeOld != 0 && processMode.allow == 0) {
		processMode.step = 0;
	}
	else if (processModeOld == 0 && processMode.allow != 0) {
		processMode.step = 0;
	}
	if (allertSave == true) EEPROM.commit();
	allertSave = false;
	EEPROM.end();
	delay(500);

	HTTP.send(200, "text/json", "{\"result\":\"ok\"}");
}

void handleResetDataEeprom() {
	if (HTTP.arg("reset").toInt() == 1) {
		EEPROM.begin(2048);
		for (int i = 0; i < 1600; i++) {
			EEPROM.write(i, 0xFF);
		}
		StateDsReset = 0xFF;
		EEPROM.end();
		delay(250);
		HTTP.send(200, "text/json", "{\"result\":\"ok\"}");
		dallSearch();
		dallRead(10);
	}
	else HTTP.send(200, "text/json", "{\"result\":\"err\"}");
}

void sensorLoop() {


	if (sensorNumberRead >= DS_Count) {
		sensorNumberRead = 0;
		ds.reset();
		ds.write(0xCC); //Обращение ко всем датчикам
		ds.write(0x44); //Команда на конвертацию
		timeSecDsRead = millis() + 1000;
	}
	else if (millis() >= timeSecDsRead) {
		dallRead(sensorNumberRead);
		byteDsRead++;
		if (byteDsRead >= 9) {
			sensorNumberRead++;
			byteDsRead = 0;
		}
	}

	if (millis() >= timeSec) {

		if (RX_Pause > 4) RX_Pause = 0;
		else if (RX_Pause != 0) RX_Pause++;

		timeSec = millis() + 1000;
		processMode.timeStep++;

		// Пищалка для WEB
		if (settingAlarm == true && BuzzerVolumeLevel > 0) {
			setPWM(BUZ_VOL, 0, BuzzerVolumeLevel);
			initBuzzer(500);
		}
		else {
			setPWM(BUZ_VOL, 0, 650);
			deinitBuzzer();
		}

		// опрос датчиков
		pressureRead();

		/*
		if (sensorNumberRead >= DS_Count) sensorNumberRead = 0;
		//dallRead(10);
		dallRead(sensorNumberRead);
		sensorNumberRead++;
		*/

		// Отладочная информация
#if defined Debug_en
		Serial.print("Temperature 1: ");
		Serial.println(temperatureSensor[DS_Cube].data);

		Serial.print("Temperature 2: ");
		Serial.println(temperatureSensor[DS_Tube].data);

		Serial.print("Temperature 3: ");
		Serial.println(temperatureSensor[DS_Out].data);

		Serial.print("Temperature 4: ");
		Serial.println(temperatureSensor[DS_Def].data);

		Serial.print("Temperature 5: ");
		Serial.println(temperatureSensor[DS_Res1].data);

		Serial.print("Temperature 6: ");
		Serial.println(temperatureSensor[DS_Res2].data);

		Serial.print("Temperature 7: ");
		Serial.println(temperatureSensor[DS_Res3].data);

		Serial.print("Temperature 8: ");
		Serial.println(temperatureSensor[DS_Res4].data);

		Serial.print("TPressure: ");
		Serial.println(pressureSensor.data);

		Serial.print("Client's AP: ");
		Serial.println(WiFi.softAPgetStationNum());

		Serial.print("Status STA: ");
		Serial.println(WiFi.status());

		Serial.println("......");

#endif
	}
}
