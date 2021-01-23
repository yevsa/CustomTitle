<template>
  <div class="domain">
    <div class="head">
      <button
        class="open"
        @click="opened = !opened"
        v-tooltip="`${(opened ? 'Close' : 'Open') + ' settings'}`"
      >
        {{ opened ? '-' : '+' }}
      </button>
      <label class="name">
        <input
          class="title"
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

      <div class="right">
        <button
          @click="$emit('duplicate')"
          v-tooltip="'Copy'"
        >
          📋
        </button>
        <button
          @click="$emit('remove', data.id)"
          v-tooltip="'Delete'"
        >
          🞨
        </button>
      </div>
    </div>
    <div class="body" v-if="opened">
      <label>
        <span class="title">Domain text:</span>
        <input
          type="text"
          v-model="localData.text"
          :class="{ invalid: !localData.text.length }"
        >
      </label>
      <hr>
      <p class="title">Parameters</p>
      <DomainParameter
        v-for="param in sortedParams"
        :key="param.id"
        :data="param"
        @create="createParam"
        @update="updateParam"
        @remove="removeParam"
        @increasePriority="increaseParamPriority"
        @decreasePriority="decreaseParamPriority"
      />
    </div>
  </div>
</template>

<script>
  import DomainParameter from "@/components/DomainParameter";
  import { generateIdFromArray } from "@/utils/utils";

  export default {
    name: "DomainRule",
    components: { DomainParameter },
    props: {
      data: {
        type: Object,
        default: () => {},
      },
    },
    provide() {
      return {
        domainData: this.localData,
      };
    },
    data() {
      return {
        opened: false,
        localData: {},
      };
    },
    computed: {
      sortedParams() {
        return this.localData.params.map(e => e).sort((a, b) => a.priority - b.priority);
      },
    },
    methods: {
      openTab() {
        this.opened = true;
      },
      closeTab() {
        this.opened = false;
      },
      createParam() {
        let priority;
        const params = this.localData.params;

        if (params.length > 1) {
          priority = params.reduce((prev, curr) => {
            return prev.priority > curr.priority ? prev.priority : curr.priority;
          }) + 1;
        } else {
          priority = params[0].priority + 1;
        }

        params.push({
          id: generateIdFromArray(params),
          name: '',
          enabled: true,
          priority,
          pair: true,
          text: '',
          values: [{
            id: 1,
            name: '',
            enabled: true,
            text: '',
          }],
        });
      },
      updateParam(val) {
        this.localData.params.splice(this.localData.params.findIndex(el => el.id === val.id), 1, val);
      },
      removeParam(id) {
        if (this.localData.params.length > 1) {
          this.localData.params.splice(this.localData.params.findIndex(el => el.id === id), 1);
        }
      },
      increaseParamPriority(id) {
        const param = this.localData.params.find(el => el.id === id);
        const nextPriorityParam = this.localData.params.find(el => {
          return el.priority === param.priority - 1;
        });

        if (nextPriorityParam) {
          param.priority--;
          nextPriorityParam.priority++;
        }
      },
      decreaseParamPriority(id) {
        const param = this.localData.params.find(el => el.id === id);
        const prevPriorityParam = this.localData.params.find(el => {
          return el.priority === param.priority + 1;
        });

        if (prevPriorityParam) {
          param.priority++;
          prevPriorityParam.priority--;
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
  hr {
    margin: .5rem 0;
  }

  .domain {
    min-width: 500px;
    width: 100%;
    background-color: #fff;
    border: 1px solid black;
    border-radius: 3px;
    padding: .7rem;

    &:not(:last-child) {
      margin-bottom: .5rem;
    }

    .head {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }

      > .name {
        margin: 0 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    .body {
      span.title {
        margin-right: .6rem;
      }

      > .title {
        margin-bottom: .5rem;
      }
    }
  }

  .right {
    display: flex;
    margin-left: auto;

    button:not(:last-child) {
      margin-right: .4rem;
    }
  }

  button {
    $size: 40px;
    width: $size;
    height: $size;
    font-size: 1.6rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
