<template>
  <div class="parameter">
    <div class="head">
      <button
        class="addParameter"
        :disabled="stub"
        @click="$emit('create')"
      >+
      </button>
      <label>
        <span>Name:</span>
        <input
          type="text"
          placeholder=""
          :disabled="stub"
          v-model="localData.name"
          :class="{ invalid: !localData.name.length }"
        >
      </label>
      <div class="controls">
        <button
          class="sort"
          :disabled="stub"
          @click="$emit('increasePriority', data.id)"
        >🡑
        </button>
        <button
          class="sort"
          :disabled="stub"
          @click="$emit('decreasePriority', data.id)"
        >🡓
        </button>
        <button
          class="remove"
          :disabled="stub"
          @click="$emit('remove', data.id)"
        >🞨
        </button>
      </div>
    </div>
    <div class="body">
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
          id: this.localData.values.map(value => value.id).sort().slice(-1)[0] + 1,
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
      width: 100%;

      label {
        span {
          margin: 0 .6rem;
        }
      }

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
    }

    .body {
      display: flex;
      flex-direction: column;


    }


    &:not(:last-child) {
      margin-bottom: .5rem;
    }
  }
</style>
