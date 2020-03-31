<script>
    export let reflux_pressure ="";
    export let reflux_alco_boil ="";
</script>

<div class="row row-striped">
    <div class="pt-10 clearfix">
        <div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">Атмосферное давление</div>
        <div class="col-xs-12 col-sm-3 text-center text-middle text-strong">
            <span>{reflux_pressure}</span>
            <span class="hidden">мм рт.ст.</span>
        </div>
    </div>

    <div class="pb-10 clearfix">
        <div class="col-xs-12 col-sm-4 text-center-xs text-middle text-strong">t&#176 кипения спирта при данном давлении</div>
        <div class="col-xs-12 col-sm-3 text-center text-middle text-strong">
            <span>{reflux_alco_boil}</span>
            <span class="hidden">&#176С</span>
        </div>
    </div>
</div>
