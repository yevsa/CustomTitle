<template>
  <div v-if="opened" class="parameter">
    <label>
      <button
        class="addParameter"
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
    <div class="parts">
      <ParameterValue
        v-for="value in localData.values"
        :data="value"
        :stub="stub"
        @update="updateValue"
        @create="createValue"
        @remove="removeValue"
      />
    </div>
    <div class="controls">
      <button
        class="sort"
        :disabled="stub"
        @click="$emit('increasePriority', data.name)"
      >🡑
      </button>
      <button
        class="sort"
        :disabled="stub"
        @click="$emit('decreasePriority', data.name)"
      >🡓
      </button>
      <button
        class="remove"
        :disabled="stub"
        @click="$emit('remove', data.name)"
      >🞨
      </button>
    </div>
  </div>
</template>

<script>
  import ParameterValue from "@/components/ParameterValue";

  export default {
    name: "DomainParameter",
    components: { ParameterValue },
    props: {
      data: {
        type: Object,
        default: () => {},
      },
      opened: {
        type: Boolean,
        default: false,
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
    methods: {
      updateValue(val) {
        this.localData.values.splice(this.localData.values.findIndex(el => el.name === val.name), 1, val);
      },
      createValue() {
        this.localData.values.push({
          name: '',
          enabled: true,
          text: '',
        })
      },
      removeValue(name) {
        if (this.localData.values.length > 1) {
            this.localData.values.splice(this.localData.values.findIndex(el => el.name === name), 1);
        }
      },
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
  .parameter {
    display: flex;

    .controls {
      margin-left: auto;
      margin-right: .2rem;

      button {
        width: 34px;

        &:not(:last-child) {
          margin-right: .2rem;
        }
      }
    }

    &:not(:last-child) {
      margin-bottom: .5rem;
    }
  }
</style>
