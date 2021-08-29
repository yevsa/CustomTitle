<template>
  <div class="controls">
    <div class="addForm">
      <InputSimple
        placeholder="example.com"
        v-model="newDomain"
        @keyup.enter="addDomain"
      />
      <ButtonSimple
        class="clean icon-plus"
        @click="addDomain"
        v-tooltip="'Add'"
      >➕
      </ButtonSimple>
    </div>
    <ButtonSimple
      class="showSettings sideButton"
      @click="toggleOptions"
    >
      <p>{{ showOptions ? '-' : '+' }}</p> Options
    </ButtonSimple>
    <ButtonSimple class="sideButton" @click="openAllTabs">Open All</ButtonSimple>
    <ButtonSimple class="sideButton" @click="closeAllTabs">Close All</ButtonSimple>
    
    <div class="save">
      <p
        class="message"
        v-if="save.message.length"
      >
        {{ save.message }}
      </p>
      <ButtonSimple class="button" @click="saveSettings">Save</ButtonSimple>
    </div>
  </div>
</template>

<script>
  import ButtonSimple from '@/components/ButtonSimple';
  import InputSimple from '@/components/InputSimple';
  import { createDomain } from '@/utils/entities';
  import { ControlEmitter } from '@/utils/ControlEmitter';
  
  export default {
    name: 'ControlsMenu',
    components: { InputSimple, ButtonSimple },
    props: {
      message: {
        type: String,
        required: false,
        default: ''
      },
      domainNames: {
        type: Array,
        required: true
      },
      isMock: {
        required: true,
        validator(v) {
          return typeof v === 'number' || typeof v === 'boolean';
        }
      }
    },
    data() {
      return {
        newDomain: '',
        showOptions: false,
        save: {
          message: '',
          clearTimeout: undefined
        }
      };
    },
    methods: {
      addDomain() {
        if (this.newDomain.length && !this.domainNames.includes(this.newDomain)) {
          this.$emit('createDomain', this.newDomain);
        }
        
        this.newDomain = '';
      },
      openAllTabs() {
        ControlEmitter.emit('openAllTabs');
      },
      closeAllTabs() {
        ControlEmitter.emit('closeAllTabs');
      },
      saveSettings() {
        clearTimeout(this.save.clearTimeout);
        
        if (!this.isMock) {
          this.$emit('saveSettings');
          this.save.message = 'Saved';
        } else {
          this.save.message = 'Mock enabled';
        }
        
        this.save.clearTimeout = setTimeout(() => {
          this.save.message = '';
        }, 5 * 1000);
      },
      toggleOptions() {
        this.showOptions = !this.showOptions;
        this.$emit('showOptions', this.showOptions);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .controls {
    width: 100%;
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 3px;
    
    .addForm {
      display: flex;
      flex-wrap: nowrap;
      height: 100%;
      
      background-color: #fff;
      border: 1px solid black;
      border-radius: 3px;
      padding: .7rem;
      
      .label {
        height: 100%;
        
        > *:not(:last-child) {
          margin-right: .5rem;
        }
        
        &:not(:last-child) {
          margin-right: .5rem;
        }
        
        .input {
          padding-left: .5rem;
          height: 100%;
        }
      }
    }
    
    .sideButton {
      margin: 0 .8rem;
      
      & + .sideButton {
        margin-left: 0;
      }
    }
    
    .showSettings {
      display: flex;
      text-align: right;
    }
    
    .save {
      margin-left: auto;
      display: flex;
      align-items: center;
      
      .message {
        color: black;
        margin-right: .5rem;
      }
      
      .button {
        background-color: #a7fc45;
        border: 1px solid #90d535;
        outline: 2px solid #6fa72d;
        
        &:active {
          background-color: #95eb45;
        }
      }
    }
    
    .button {
      white-space: nowrap;
    }
  }
</style>
