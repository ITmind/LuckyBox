<script>
    import Button, { Label } from "@smui/button";
</script>

<style global type="text/scss">
    /* button {
        background-color: gold;
    } */
    @import '@smui/button/mixins';
    $color: gold;
  
    @include smui-button__group-mdc-button--raised_($color); 
</style>

<div>
    <p>hh</p>
    <Button variant="unelevated" color="light">
        <Label>Do Something</Label>
    </Button>
    <button class="blue">click</button>
</div>