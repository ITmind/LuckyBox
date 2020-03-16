<script>
    let error = "";
    let scoops = 1;
    let upd_filename = "";
    let changed = false;

    let settings = {
        ssdp: "",
        ssid: "",
        ssid_pass: "",
        ssidap: "",
        ssid_passap: "",
        timezone: "",
        tft_rotate: false,
        touchpad_rotate: false,
        power_block: ""
    };

    let power_block_type = [
        { id: 1, text: `На твердотельных элементах` },
        { id: 2, text: `С плавной регулировкой` }
    ];

    function btnSaveClick() {
        error = "Сохранение...";
    }

    function btnRestartClick() {
        error = "Перезагрузка...";
    }

    let first = true;

    $: {
        if (!first) {
            changed = true;
            console.log(`${settings.ssdp}`);
        }
        else {
            first = false;
        }
    }

</script>

<style>
    #settings {
        font-size: 1em;
    }

    #error_settings {
        color: red;
    }
</style>

<div id="settings">

    <div id="error_settings">{error}</div>

    <h4>Обновление прошивки</h4>

    <form id="firmware_update" method="POST" enctype="multipart/form-data">
        <div>
            <input bind:value={upd_filename} type="file" name="update" size="40" />
            <button id="settings_update" type="submit" disabled>Загрузить</button>
        </div>
    </form>

    <h4>Имя устройства</h4>
    <div>
        <input id="settings_ssdp" bind:value={settings.ssdp} pattern="[0-9a-zA-Zа-яА-Я. ]{(1, 20)}" placeholder="Имя устройства" size="40" />
    </div>

    <h4>WiFi</h4>
    <label>
        <input type="radio" bind:group={scoops} value={1} />
        Подключение к WiFi роутеру
    </label>
    <label>
        <input type="radio" bind:group={scoops} value={2} />
        Точка доступа
    </label>

    <div>
        <input bind:value={settings.ssid} placeholder="Имя WiFi сети" size="40" />
    </div>
    <div>
        <input bind:value={settings.ssid_pass} type="password" placeholder="Пароль не менее 8 символов" size="40" />
    </div>

    <h4>Часовой пояс</h4>
    <div>
        <input bind:value={settings.timezone} pattern="[0-9]{(1, 3)}" size="3" />
        <button id="settings_auto_timezone" type="button">
            Авто определение и сохранение зоны
        </button>
    </div>

    <h4>Настройки TFT экрана</h4>
    <div>
        <label>
            <input bind:checked={settings.tft_rotate} type="checkbox" />
            Развернуть TFT экран на 180°
        </label>
        <label>
            <input bind:checked={settings.touchpad_rotate} type="checkbox" />
            Развернуть сенсорную панель на 180°
        </label>
    </div>

    <h4>Тип силового блока</h4>
    <div>
        <select bind:value={settings.power_block}>
            {#each power_block_type as type}
        <option value={type.id}>{type.text}</option>
      {/each}
    </select>
  </div>

  <button type="button" on:click={btnSaveClick} disabled = {!changed}>Сохранить</button>
  <button type="button" on:click={btnRestartClick}>Перезагрузить</button>

</div>