<template lang="pug">
.k-line
    stockChart(
        v-if="!kLineGraph"
        :stock="$store.getters.stockId || "
        :stockDetail="stockDetail"
        chartId="kline1"
    )
</template>

<script>
export default {
    name: 'optional',
    data() {
        return {}
    }
}
</script>

<style lang="scss">

</style>
