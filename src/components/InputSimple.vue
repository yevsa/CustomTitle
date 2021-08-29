<template>
  <input
    class="input"
    :style="{ width: resizedWidth }"
    v-bind="$attrs"
    v-on="listeners"
  >
</template>

<script>
  const minLength = 12;
  
  export default {
    name: 'InputSimple',
    computed: {
      listeners() {
        const that = this;
        return {
          ...this.$listeners,
          input(event) {
            that.$emit('input', event.target.value);
          }
        };
      },
      resizedWidth() {
        if (this.$attrs.resizable !== false) {
          const len = this.$attrs.value?.length || 0;
          if (len < minLength) return minLength + 'ch';
          return len + 1.3 + 'ch';
        } else {
          return '10ch';
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .input {
    height: 2rem;
    padding: .2rem .3rem;
    margin: .1rem .2rem;
    max-width: 30ch;
    
    background-color: transparent;
    border: none;
    border-bottom: 1px solid black;
    
    &:focus {
      border: none;
      border-bottom: 1px solid black;
      outline: none;
    }
  }
</style>
