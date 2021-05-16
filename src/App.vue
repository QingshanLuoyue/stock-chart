<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <stock-chart></stock-chart>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import stockChart from './components/stock-chart'

export default {
    name: 'App',
    components: {
        HelloWorld,
        stockChart
    }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
