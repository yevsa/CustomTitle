<template>
  <div class="parameter">
    <div class="head">
      <button
        class="addParameter"
        :disabled="stub"
        @click="$emit('create')"
        v-tooltip="'Create parameter'"
      >
        +
      </button>
      <label>
        <span class="title">Name:</span>
        <input
          type="text"
          placeholder=""
          :disabled="stub"
          :class="{ invalid: !localData.name.length }"
          v-model="localData.name"
        >
      </label>
      <label class="switch">
        <input type="checkbox" v-model="localData.enabled">
        <span
          class="slider"
          v-tooltip="localData.enabled ? 'Disable' : 'Enable'"
        ></span>
      </label>
      <div class="controls">
        <button
          class="sort"
          :disabled="stub"
          @click="$emit('increasePriority', data.id)"
          v-tooltip="'Increase priority'"
        >🡑
        </button>
        <button
          class="sort"
          :disabled="stub"
          @click="$emit('decreasePriority', data.id)"
          v-tooltip="'Decrease priority'"
        >🡓
        </button>
        <button
          class="remove"
          :disabled="stub"
          @click="$emit('remove', data.id)"
          v-tooltip="'Delete'"
        >🞨
        </button>
      </div>
    </div>
    <div class="body">
      <div class="parts">
        <ParameterValue
          v-for="value in localData.values"
          :key="value.id"
          :data="value"
          :stub="stub"
          @update="updateValue"
          @create="createValue"
          @remove="removeValue"
        />
      </div>
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
      stub: {
        type: Boolean,
        default: false,
      }
    },
    provide() {
      return {
        parameterData: this.localData,
      };
    },
    data() {
      return {
        localData: {},
      };
    },
    methods: {
      updateValue(val) {
        Object.assign(this.localData.values.find(el => el.id === val.id), val);
      },
      createValue() {
        this.localData.values.push({
          id: this.localData.values.map(value => value.id).sort((a, b) => a.id - b.id).slice(-1)[0] + 1,
          name: '',
          enabled: true,
          text: '',
        });
      },
      removeValue(id) {
        if (this.localData.values.length > 1) {
          this.localData.values.splice(this.localData.values.findIndex(el => el.id === id), 1);
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
    flex-wrap: wrap;

    .head {
      display: flex;
      align-items: center;
      width: 100%;

      label {
        .title {
          margin: 0 .6rem;
        }
      }

      .switch {
        margin-left: .6rem;
      }

      .controls {
        margin-left: auto;

        button {
          width: 34px;

          &:not(:last-child) {
            margin-right: .2rem;
          }
        }
      }
    }

    .body {
      display: flex;
      align-items: center;
    }

    &:not(:last-child) {
      margin-bottom: .5rem;
    }
  }
</style>
