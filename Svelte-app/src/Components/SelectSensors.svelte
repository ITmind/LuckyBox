<script>
import Delta from "./Templ/Delta.svelte";

 let key ="t1";
 let sensor_name = "датчик т";
</script>

<section id="distillation_sensors" class="table-responsive"><table class="table table-noborder">
<tr><td colspan="4" class="text-center text-strong">Датчики температуры</td></tr>
    <tr><td>
    <div class="input-group input-group-sm">
    <span class="input-group-addon" style="background-color: #{sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF"}">
    {key}
    </span>
<input readonly id="distillation_name_{key}" class="form-control input-sm" type="text" value="{sensor_name}">
    <input type="hidden" id="distillation_color_{key}" value="{sensors[key]["color"] > 0 ? dec2hex(sensors[key]["color"]) : "FFFFFF"}"></div></td>
    <td><input data-sensor="{key}" type="checkbox" value="{key}"></td><td>
    <label class="checkbox-inline"><input disabled id="cutoff_{key}" name="distillation_radio_{key}" type="radio" value="Y">Отсечка</label>
    </td>
    </tr>

    <tr><td>

    <tr><td colspan="4" class="text-center text-strong">Исполнительные устройства</td></tr>
<div class="input-group input-group-sm">
<span class="input-group-addon">{key}</span>
            <input readonly id="distillation_name_{key}" class="form-control input-sm" type="text" value="{sensor_name}">
            </div></td>
            <td><input data-sensor="{key}" type="checkbox" value="{key}"></td>
            <td></td>
            <td></td>
            </tr>

<tr><td colspan="4" class="text-center text-strong">Датчики безопасности</td></tr>
            <tr><td>
            <div class="input-group input-group-sm">
            <span class="input-group-addon">{key}"</span>
            <input readonly id="distillation_name_{key}" class="form-control input-sm" type="text" value="{sensor_name}">
            </div></td>
            <td><input data-sensor="{key}" type="checkbox" value="{key}"></td>
            <td></td>
            <td></td>
            </tr>


<tr><td colspan="4" class="text-center text-strong">Настройки колонны</td></tr>
                <tr>
                <td>Температура в кубе перехода на рабочую мощность</td>
                <td colspan="3" class="text-center">
                <Delta bind:value = {sensors[key]} min = {60}/>
                </td>
                </tr>



</table></section>
            <!-- $.fn.openModal(
                "Выбор датчиков для дистилляции",
                section,
                "modal-md",
                false,
                {
                    text: "Выбрать",
                    id: "sensors_select",
                    class: "btn btn-success",
                    click: function() {
                        distillationProcess["sensors"] = {};
                        let sensors_select = $("#distillation_sensors input[type=checkbox]");
                        $.map(sensors_select, function(e) {
                            if ($(e).is(":checked")) {
                                let key = $(e).data("sensor");
                                let tmp = false;
                                if (re_t.test(key)) {
                                    tmp = true;
                                }
                                let name = $("#distillation_name_" + key).val();
                                let val_color = tmp ? $("#distillation_color_" + key).val() : "";
                                let color = val_color !== "FFFFFF" && val_color !== "" ? Number(hex2dec(val_color)) : 0;
                                let cutoff = tmp ? Number($("#cutoff_" + key).prop("checked")) : 0;

                                distillationProcess["sensors"][key] = {};
                                if (tmp) {
                                    distillationProcess["sensors"][key] = {
                                        name: name,
                                        cutoff: cutoff,
                                        color: color,
                                        allertValue: 0,
                                        value: 0,
                                        member: 1
                                    };
                                } else {
                                    distillationProcess["sensors"][key] = { name: name, value: 0, member: 1 };
                                }
                            }
                        });
                        distillationProcess["transitionTemperature"] = Number($("#transitionTemperature").val());
                        $(this)
                            .closest(".modal")
                            .modal("hide");
                        $.fn.pasteDistillationSensors(true);
                    }
                },
                { id: "modal_sensors_select" }
            ); -->