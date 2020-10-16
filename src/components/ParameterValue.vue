<template>
  <div class="value">
    <label>
      <button
        class="add"
        :disabled="stub"
        @click="$emit('create')"
      >+
      </button>
      <input
        type="text"
        placeholder=""
        :disabled="stub"
        v-model="localData.name"
      >
    </label>
    <label>
      <input
        type="text"
        :disabled="stub"
        v-model="localData.text"
      >
      <button
        class="remove"
        :disabled="stub"
        @click="$emit('remove', data.name)"
      >
        🞨
      </button>
    </label>
  </div>
</template>

<script>
  export default {
    name: "ParameterValue",
    props: {
      data: {
        type: Object,
        default: () => {},
      },
      stub: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        localData: {},
      };
    },
    watch: {
      data: {
        handler(val) {
          this.localData = val;
        },
        deep: true,
        immediate: true,
      },
      localData: {
        handler(val) {
          this.$emit('update', val);
        },
        deep: true,
      },
    },
  }
</script>

<style lang="scss" scoped>
  .value {
    &:not(:last-child) {
      margin-bottom: .3rem;
    }
  }
</style>
