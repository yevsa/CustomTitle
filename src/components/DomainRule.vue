<template>
  <div class="domain">
    <div class="head">
      <ButtonSimple
        class="clean"
        @click="opened = !opened"
        v-tooltip="`${(opened ? 'Close' : 'Open') + ' settings'}`"
      >
        {{ opened ? '➖' : '➕' }}
      </ButtonSimple>
      <label class="label">
        <span class="title">Domain:</span>
        <InputSimple
          :class="{ invalid: !domain.name.length }"
          v-model="domain.name"
        />
      </label>
      <label class="label">
        <span class="title">New title:</span>
        <InputSimple
          v-model="domain.text"
          :class="{ invalid: !domain.text.length }"
        />
      </label>
      <SwitchSimple class="switch" v-model="domain.enabled"/>
      
      <div class="right">
        <ButtonSimple
          class="clean icon-normal"
          @click="$emit('duplicate')"
          v-tooltip="'Copy'"
        >
          📋
        </ButtonSimple>
        <ButtonSimple
          class="clean icon-normal"
          @click="$emit('remove')"
          v-tooltip="'Delete'"
        >
          ✖
        </ButtonSimple>
      </div>
    </div>
    <div class="body" v-if="opened">
      <hr>
      <p class="title">Parameters</p>
      <DomainParameter
        v-for="(param, index) in sortedParams"
        :key="param.id"
        :parameter="param"
        :domainName="domain.name"
        @create="createParam"
        @remove="removeParam(index)"
        @increasePriority="increaseParamPriority(param)"
        @decreasePriority="decreaseParamPriority(param)"
      />
    </div>
  </div>
</template>

<script>
  import DomainParameter from '@/components/DomainParameter';
  import ButtonSimple from '@/components/ButtonSimple';
  import SwitchSimple from '@/components/SwitchSimple';
  import InputSimple from '@/components/InputSimple';
  import { createParameter } from '@/utils/entities';
  
  export default {
    name: 'DomainRule',
    components: { InputSimple, SwitchSimple, ButtonSimple, DomainParameter },
    props: {
      domain: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        opened: false
      };
    },
    computed: {
      sortedParams() {
        return this.domain.params.map(e => e).sort((a, b) => a.priority - b.priority);
      }
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
        const params = this.domain.params;
        
        if (params.length > 1) {
          priority = params.reduce((prev, curr) => {
            return prev.priority > curr.priority ? prev.priority : curr.priority;
          }) + 1;
        } else {
          priority = params[0].priority + 1;
        }
        
        params.push(createParameter(priority));
      },
      removeParam(index) {
        this.domain.params.splice(index, 1);
      },
      increaseParamPriority(param) {
        const nextPriorityParam = this.domain.params.find(el => {
          return el.priority === param.priority - 1;
        });
        
        if (nextPriorityParam) {
          param.priority--;
          nextPriorityParam.priority++;
        }
      },
      decreaseParamPriority(param) {
        const prevPriorityParam = this.domain.params.find(el => {
          return el.priority === param.priority + 1;
        });
        
        if (prevPriorityParam) {
          param.priority++;
          prevPriorityParam.priority--;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  hr {
    margin: .5rem 0;
  }
  
  .switch {
    margin: 0 .3rem;
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
    
    .label {
      height: 100%;
      
      .input {
        height: 100%;
        padding-left: .5rem;
      }
    }
    
    .head {
      display: flex;
      align-items: center;
      height: 40px;
      
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
    
    .title {
      margin: 0 .3rem .5rem;
      
      color: #746f6f;
    }
  }
  
  .right {
    display: flex;
    margin-left: auto;
  }
</style>
