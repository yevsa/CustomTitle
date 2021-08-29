<template>
  <div class="parameter">
    <div class="head">
      <ButtonSimple
        class="addParameter clean icon-plus "
        :disabled="stub"
        @click="$emit('create')"
        v-tooltip="'Create parameter'"
      >
        ➕
      </ButtonSimple>
      <label class="label">
        <span class="title">Name:</span>
        <InputSimple
          :disabled="stub"
          :class="{ invalid: !parameter.name.length }"
          v-model="parameter.name"
        />
      </label>
      <div class="controls">
        <ButtonSimple
          class="sort clean icon-normal"
          :disabled="stub"
          @click="$emit('increasePriority')"
          v-tooltip="'Increase priority'"
        >
          🡑
        </ButtonSimple>
        <ButtonSimple
          class="sort clean icon-normal"
          :disabled="stub"
          @click="$emit('decreasePriority')"
          v-tooltip="'Decrease priority'"
        >
          🡓
        </ButtonSimple>
        <ButtonSimple
          class="remove clean icon-normal"
          :disabled="stub"
          @click="$emit('remove')"
          v-tooltip="'Delete'"
        >
          ✖
        </ButtonSimple>
      </div>
    </div>
    <div class="body">
      <div class="parts">
        <ParameterValue
          v-for="(value, index) in parameter.values"
          :key="value.id"
          :paramvalue="value"
          :parameterName="parameter.name"
          :domainName="domainName"
          :stub="stub"
          @create="createValue"
          @remove="removeValue(index)"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import ParameterValue from '@/components/ParameterValue';
  import ButtonSimple from '@/components/ButtonSimple';
  import InputSimple from '@/components/InputSimple';
  import { createValue } from '@/utils/entities';
  
  export default {
    name: 'DomainParameter',
    components: { InputSimple, ButtonSimple, ParameterValue },
    props: {
      parameter: {
        type: Object,
        required: true,
        default: () => {}
      },
      stub: {
        type: Boolean,
        default: false
      },
      domainName: {
        type: String,
        required: true
      }
    },
    methods: {
      createValue() {
        this.parameter.values.push(createValue());
      },
      removeValue(index) {
        if (this.parameter.values.length > 1) {
          this.parameter.values.splice(index, 1);
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .parameter {
    display: flex;
    flex-wrap: wrap;
    
    .head {
      display: flex;
      align-items: center;
      width: 100%;
      
      .label {
        height: 100%;
        
        .input {
          height: 100%;
        }
        
        .title {
          margin: 0 .6rem;
          color: #746f6f;
        }
      }
      
      .switch {
        margin-left: .6rem;
      }
      
      .controls {
        margin-left: auto;
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
