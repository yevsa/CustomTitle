<template>
  <button
    class="button"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot></slot>
  </button>
</template>

<script>
  export default {
    name: 'ButtonSimple'
  };
</script>

<style lang="scss" scoped>
  .button {
    border-radius: 0;
    height: min-content;
    white-space: nowrap;
    
    padding: .3rem .4rem;
    margin: .1rem .2rem;
    
    &.clean {
      padding: 0;
      background-color: transparent;
      border: none;
    }
    
    &.icon-plus {
      font-size: 1.1rem;
    }
    
    &.icon-normal {
      font-size: 1.45em;
      margin: .1rem .3rem;
    }
  }
</style>
