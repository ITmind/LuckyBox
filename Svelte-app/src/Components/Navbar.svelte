<style>
    .app-bar {
        display: flex;
        align-items: center;
        height: 48px;
        color: #fff;
        background: #888;
        font-size: 18px;
        line-height: 1;
        min-width: inherit;
        padding: 0 4px 0 6px;
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        z-index: 20;
    }
    .mainmenu {
        display: flex;
        align-items: center;
        height: 40px;
        color: #fff;
        background: rgb(129, 69, 69);
        font-size: 18px;
        line-height: 1;
        min-width: inherit;
        padding: 0 4px 0 6px;
        position: fixed;
        left: 0;
        top: 49px;
        right: 0;
        z-index: 20;
    }
    nav > p {
        margin: 0px 20px;
    }
</style>

<script>
    import { Icon, Button, Sidepanel } from "svelte-mui";
    import Settings from "./Settings.svelte";
    import Distillation from "./Distillation.svelte";
    import Reflux from "./Reflux.svelte";
    import Pid from "./Pid.svelte";
    import Mashing from "./Mashing.svelte";
    import Sensors from "./Sensors.svelte";

    let selected_page;

    let pages=[
      {name : "Дистилляция", component : Distillation},
      {name : "Ректификация", component : Reflux},
      {name : "Затирание", component : Mashing},
      {name : "Датчики", component : Sensors},
      {name : "ПИД регулировка", component : Pid}
    ];
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<nav class="app-bar">
    <Button icon color="white">
        <Icon path="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </Button>
    <p>Электросэм</p>
</nav>
<nav class="mainmenu">
    <ul>
    {#each pages as page}
        <li>
            <a on:click={e => (selected_page = Distillation)}>{page.name}</a>
        </li>
        {/each}
    </ul>
</nav>

<Sidepanel left>
    <div class="logo" style="padding-left: 1rem;">Help</div>
    <p>
        <i style="padding: 12px;">Blank</i>
    </p>
</Sidepanel>
