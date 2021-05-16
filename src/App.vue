<template>
  <div id="app">
    <stock-chart></stock-chart>
  </div>
</template>

<script>
import stockChart from './components/stock-chart'

export default {
    name: 'App',
    components: {
        stockChart
    }
}
</script>

<style lang="scss">
@import './assets/common.scss';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
