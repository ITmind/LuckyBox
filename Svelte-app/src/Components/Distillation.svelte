<script>

  import DistSVG from "./DistSVG.svelte";

  let distillation_volume = 0;
  let isStart = false;

  function volumeUp() {
    distillation_volume++;
    if (distillation_volume > 100) distillation_volume = 100;
  }

  function volumeDown() {
    distillation_volume--;
    if (distillation_volume < 0) distillation_volume = 0;
  }

  function saveVolume() {}

  function startStop() {
    isStart = !isStart;
  }
</script>

<style>
  button {
    background-color: blue;
  }
</style>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->

<div class="container tab-pane theme_grey swipe-tab-content active">
  <div class="row">
    <div id="error_distillation" class="col-md-offset-2 col-md-8" />
  </div>
  <div class="row">
    <div class="col-md-12 fill-height">
      <div class="row mt-10">
        <div
          class="col-xs-offset-3 col-xs-6 col-sm-3 col-sm-offset-0 svg-container">
          <DistSVG />
        </div>
        <div class="col-xs-12 col-sm-9">
          <div id="distillation_process" />
          <div class="form-group pt-10 clearfix">
            <button
              id="distillation_add_sensor"
              type="button"
              class="btn btn-primary btn-sm noSwipe">
              Добавить датчики для процесса
            </button>
          </div>
          <div id="distillation_group_volume" class="row row-striped pb-10">
            <div
              class="col-xs-12 col-sm-4 text-middle text-center-xs text-strong">
              Громкость звукового сигнала
            </div>
            <div class="col-xs-6 col-sm-3">
              <div class="input-group input-group-sm number-group">
                <span class="input-group-btn minus">
                  <button
                    type="button"
                    class="btn btn-danger btn-number noSwipe"
                    on:click={volumeDown}>
                    <span class="glyphicon glyphicon-minus" />
                  </button>
                </span>
                <input
                  bind:value={distillation_volume}
                  class="form-control input-number noSwipe"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  size="3" />
                <span class="input-group-btn plus">
                  <button
                    type="button"
                    class="btn btn-success btn-number noSwipe"
                    on:click={volumeUp}>
                    <span class="glyphicon glyphicon-plus" />
                  </button>
                </span>
              </div>
            </div>
            <div class="col-xs-6 col-sm-2 text-left">
              <button
                on:click={saveVolume}
                type="button"
                class="btn btn-success btn-sm noSwipe">
                Сохранить
              </button>
            </div>
          </div>

          <div
            class="form-group pt-10 pb-10 clearfix"
            id="distillation_start_group_button">

            <button
              on:click={startStop}
              type="button"
              class="btn btn-danger btn-sm pull-left noSwipe"
              class:hide={!isStart}>
              СТОП
            </button>
            <button
              on:click={startStop}
              type="button"
              class="btn btn-success btn-sm noSwipe"
              class:hide={isStart}>
              СТАРТ
            </button>
          </div>
        </div>

        <div class="col-xs-12">
          <div class="bg-info noSwipe" id="view_distillation_chart" />
        </div>
      </div>
    </div>
  </div>
</div>
