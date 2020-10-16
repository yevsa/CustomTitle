<template>
  <div class="domain">
    <div class="head">
      <button class="open" @click="opened = !opened">{{ openedText }}</button>
      <p class="title">{{ data.name }}</p>
      <button class="delete" @click="$emit('remove', data.name)">🞨</button>
    </div>
    <DomainParameter
      v-for="(param, key) in activeParams"
      :key="key"
      :data="param"
      :opened="opened"
      @create="createParam"
      @update="updateParam"
      @remove="removeParam"
      @increasePriority="increaseParamPriority"
      @decreasePriority="decreaseParamPriority"
    />
  </div>
</template>

<script>
  import DomainParameter from "@/components/DomainParameter";

  export default {
    name: "DomainRule",
    components: { DomainParameter },
    props: {
      data: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        opened: true,
        localData: {},
      }
    },
    methods: {
      createParam() {
        let priority;

        if (this.localData.params > 1) {
          priority = this.localData.params.reduce((prev, curr) => {
            prev.priority > curr.priority ? prev.priority : curr.priority
          }) + 1;
        } else {
          priority = this.localData.params[0].priority + 1;
        }

        this.localData.params.push({
          name: '',
          enabled: true,
          priority,
          pair: true,
          text: '',
          values: [
            {
              name: '',
              enabled: true,
              text: '',
            },
          ],
        });
      },
      updateParam(val) {
        this.localData.params.splice(this.localData.params.findIndex(el => el.name === val.name), 1, val);
      },
      removeParam(name) {
        if (this.localData.params.length > 1) {
          this.localData.params.splice(this.localData.params.findIndex(el => el.name === name), 1);
        }
      },
      increaseParamPriority(name) {
        const param = this.localData.params.find(el => el.name === name);
        const nextPriorityParam = this.localData.params.find(el => {
          return el.priority === param.priority - 1;
        });

        if (nextPriorityParam) {
          param.priority--;
          nextPriorityParam.priority++;
        }
      },
      decreaseParamPriority(name) {
        const param = this.localData.params.find(el => el.name === name);
        const prevPriorityParam = this.localData.params.find(el => {
          return el.priority === param.priority + 1;
        });

        if (prevPriorityParam) {
          param.priority++;
          prevPriorityParam.priority--;
        }
      },
      updateDomain() {
        this.$emit('update', this.localData);
      },
    },
    computed: {
      activeParams() {
        // console.log(JSON.stringify(this.data, null, 2));
        // console.log(Array.isArray(this.data.params))
        return this.data.params
          .filter(el => el.enabled)
          .sort((a, b) => a.priority - b.priority);
      },
      openedText() {
        return this.opened ? '-' : '+';
      }
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
  .domain {
    min-width: 500px;
    width: 100%;

    .head {
      display: flex;
      align-items: center;

      border: 1px solid black;
      border-radius: 3px;
      background-color: #fff;

      padding: .5rem;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }

    &:not(:last-child) {
      margin-bottom: .5rem;
    }
  }

  .title {
    margin: 0 1rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .delete {
    margin-left: auto;
    justify-self: flex-end;
  }

  button {
    width: 40px;
    height: 40px;
    font-size: 1.6rem;
    /*padding-bottom: .5rem;*/
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
