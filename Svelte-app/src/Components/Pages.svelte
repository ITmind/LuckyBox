<style>

</style>

<script>
    import Settings from "./Settings.svelte";
    import Distillation from "./Distillation.svelte";
    import Reflux from "./Reflux.svelte";
    import Pid from "./Pid.svelte";
    import Mashing from "./Mashing.svelte";
    import Sensors from "./Sensors.svelte";


    let selected_component = Sensors;
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<div>
    <div class="main-tabs fill">
        <div class="container-fluid">
            <div class="tab-content">
                <div class="tab-pane active" id="home">
                    <div class="row">
                        <div class="section section_navtabs">
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="wrapper-nav">
                                            <ul id="nav-tabs" class="nav nav-tabs list-tab swipe-tabs">
                                                <li class="theme_grey swipe-tab">
                                                    <a href="#" on:click={e => (selected_component = Distillation)}>Дистилляция</a>
                                                </li>
                                                <li class="theme_grey swipe-tab">
                                                    <a on:click={e => (selected_component = Reflux)}>Ректификация</a>
                                                </li>
                                                <li class="theme_grey swipe-tab">
                                                    <a on:click={e => (selected_component = Mashing)}>Затирание</a>
                                                </li>
                                                <!--<li class="theme_grey swipe-tab"><a href="brewing.htm" data-target="#brewing" aria-controls="brewing" role="tab" data-toggle="tab">Затирание</a></li>-->
                                                <li class="theme_grey swipe-tab">
                                                    <a on:click={e => (selected_component = Sensors)}>Датчики</a>
                                                </li>
                                                <li class="theme_grey swipe-tab">
                                                    <a on:click={e => (selected_component = Pid)}>ПИД регулировка</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-content list-tab-content swipe-tabs-container">
                            <svelte:component this={selected_component} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

