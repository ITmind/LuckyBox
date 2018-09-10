//   Проект центра открытого проектирования у Счастливчика https://LuckyCenter.ru
#ifndef _HTTP_CONFIG_h
#define _HTTP_CONFIG_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "Arduino.h"
#else
	#include "WProgram.h"
#endif

#include "setting.h"
#include "file_config.h"
#include "time_config.h"
#include <ArduinoJson.h>

extern void initHTTP(void);
extern void handleSetSSDP();
extern void handleSetSSID();
extern void handleSetSSIDAP();
extern void handleRestart();
extern void handleConfigJSON();
//TODO этот лишний?
//extern String getConfigJSON();
//TODO разбираемся с рефлексией )))
//extern String getDto();

#endif
