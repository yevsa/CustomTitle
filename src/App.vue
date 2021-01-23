<template>
  <div>
    <div class="debug" v-if="showDebug">
      <span class="close" @click="showDebug = false">Close 🞨</span>
      <div class="actions">
        <label>
          <input type="checkbox" v-model="settings.debug">
          <span>Debug</span>
        </label>
        <p @click="exportSettings()">Export settings</p>
        <p @click="importSettings()">Import settings</p>
        <p @click="resetSettings()">Reset settings</p>
      </div>
    </div>
    <div class="header">
      <div class="addForm">
        <label>
          <input
            type="text"
            placeholder="example.com"
            v-model="newDomain"
            @keyup.enter="addDomain"
          >
        </label>
        <button @click="addDomain">+ Add</button>
      </div>
      <div class="controls" v-if="isControlsActive">
        <button
          class="showSettings"
          @click="showSettings = !showSettings"
        >
          <p>{{ showSettings ? '-' : '+' }}</p> Options
        </button>
        <button @click="openAllTabs">Open All</button>
        <button @click="closeAllTabs">Close All</button>
        
        <div class="save">
          <p
            class="message"
            :class="{ error: save.error }"
            v-if="save.message.length"
          >
            {{ save.message }}
          </p>
          <button @click="saveSettings">Save</button>
        </div>
      </div>
    </div>
    <div class="options" v-if="showSettings">
      <ul>
        <li>
          <label class="option" v-if="separatorEnabled">
            <span class="title">Separator</span>
            <input type="text" v-model="settings.separator.value">
          </label>
        </li>
        <li>
          <label class="option">
            <input type="checkbox" v-model="settings.options.caseSensitive">
            <span class="description">Case sensitive</span>
          </label>
        </li>
        <li>
          <label class="option">
            <input type="checkbox" v-model="settings.options.suppress">
            <span class="description">Prevent title change (keep custom title)</span>
          </label>
        </li>
      </ul>
    </div>
    <div class="rules" v-if="ruleset.length">
      <DomainRule
        ref="domains"
        v-for="(rule, key) in ruleset"
        :key="key"
        :data="rule"
        @duplicate="duplicateDomain(rule)"
        @remove="removeDomain"
        @update="updateDomain"
      />
    </div>
    <div class="rules" v-else>
      List is empty
    </div>
  </div>
</template>

<script>
  import DomainRule from "@/components/DomainRule";
  import { mock } from '@/utils/mock';
  
  const STORAGE_KEYS = Object.freeze({
    settings: 'settings',
  });
  
  export default {
    name: 'App',
    components: { DomainRule },
    data() {
      return {
        mock: 0,
        settings: {},
        newDomain: '',
        showDebug: false,
        showPreferences: false,
        showSettings: false,
        save: {
          message: '',
          error: false,
          clearTimeout: null,
        },
      }
    },
    computed: {
      ruleset() {
        return this.settings.ruleset ?? [];
      },
      separatorEnabled() {
        return this.settings.separator?.enabled;
      },
      isControlsActive() {
        return Object.keys(this.settings).length && this.ruleset.length;
      },
    },
    methods: {
      generateNewId(array) {
        return array.map(el => el.id).sort((a, b) => a.id - b.id).slice(-1)[0] + 1;
      },
      openAllTabs() {
        this.$refs.domains?.forEach(domain => domain.openTab());
      },
      closeAllTabs() {
        this.$refs.domains?.forEach(domain => domain.closeTab());
      },
      addDomain() {
        if (!this.newDomain.length) return;
        
        if (!this.ruleset.find(el => el.name === this.newDomain)) {
          this.ruleset.push({
            id: this.generateNewId(this.ruleset),
            name: this.newDomain,
            enabled: true,
            text: '',
            params: [
              {
                id: 1,
                name: '',
                enabled: true,
                priority: 1,
                pair: true,
                text: '',
                values: [
                  {
                    id: 1,
                    name: '',
                    enabled: true,
                    text: '',
                  }
                ]
              },
            ]
          });
        }
        
        this.newDomain = '';
      },
      duplicateDomain(domain) {
        this.ruleset.push({
          ...domain,
          id: this.generateNewId(this.ruleset),
        });
      },
      removeDomain(id) {
        this.ruleset.splice(this.ruleset.findIndex(el => el.id === id), 1);
      },
      updateDomain(domain) {
        this.ruleset.splice(this.ruleset.findIndex(el => el.id === domain.id), 1, domain);
      },
      saveSettings() {
        clearTimeout(this.save.clearTimeout);
        this.save.message = '';
        
        const invalidRuleset = JSON.parse(JSON.stringify(this.ruleset));
        
        let isRulesetValid = true;
        
        const uniqueDomains = [];
        const validRuleset = invalidRuleset
          .filter(domain => {
            if (uniqueDomains.includes(domain.name)) {
              return false;
            }
            uniqueDomains.push(domain.name);
            
            domain.params = domain.params.filter(param => {
              param.values = param.values
                .filter(value => {
                  const valid = value.name.length
                    && value.text.length;
                  
                  if (!valid) isRulesetValid = false;
                  
                  return valid;
                });
              
              const valid = param.name.length
                && (param.pair || param.text.length)
                && param.values.length;
              
              if (!valid) isRulesetValid = false;
              
              return valid;
            });
            
            const valid = domain.name.length
              && domain.text.length
              && domain.params.length;
            
            if (!valid) isRulesetValid = false;
            
            return valid;
          });
        
        if (!isRulesetValid) {
          this.save.error = true;
          this.save.message = 'Fill all fields';
          return;
        }
        
        this.save.clearTimeout = setTimeout(() => {
          this.save.message = '';
          this.save.error = false;
        }, 5 * 1000);
        
        const data = {
          settings: {
            ...this.settings,
            ruleset: validRuleset,
          },
        };
        
        if (!this.mock) {
          new Promise(resolve => {
            const json = JSON.stringify(data);
            let chunks = 0;
            let index = 0;
            const storageObj = {};
            
            // handling QUOTA_BYTES_PER_ITEM limitation by splitting json into chunks
            do {
              const key = `${STORAGE_KEYS.settings}_${chunks}`;
              let length = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - key.length;
              
              if (this.settings.debug) {
                length = 100 - key.length
              }
              
              if (index + length > json.length) {
                length = json.length - index;
              }
              
              storageObj[key] = json.substring(index, index + length);
              
              chunks++;
              index += length
            } while (index < json.length);
            
            storageObj.chunks = chunks;
            
            // saving all parts
            // eslint-disable-next-line
            chrome?.storage.sync.set(storageObj, () => {
              if (this.settings.debug) {
                console.log('storage.set', JSON.stringify(data, null, 2));
              }
              
              this.save.message = 'Saved';
              resolve();
            });
          });
        } else {
          console.debug('setStorageData', JSON.stringify(data, null, 2));
          
          this.save.error = true;
          this.save.message = 'Mock enabled';
        }
      },
      exportSettings() {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(this.settings)], { type: 'application/json' });
        a.href = URL.createObjectURL(file);
        a.download = 'settings.json';
        a.click();
      },
      async importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        
        input.addEventListener('change', async e => {
          const json = await e.target.files[0]?.text();
          if (json) this.settings = JSON.parse(json);
        });
        
        input.click();
      },
      resetSettings() {
        this.settings = mock.settings;
        this.saveSettings();
      },
    },
    async created() {
      document.addEventListener('keydown', e => {
        if (e.shiftKey && e.altKey && (e.key === 'X' || e.key === 'Ч')) {
          this.showDebug = !this.showDebug;
        }
      });
      
      if (this.mock) {
        this.settings = mock.settings;
      } else {
        const rawSettings = await new Promise(resolve => {
          chrome.storage.sync.get('settings', ({ settings }) => resolve(settings));
        });
        
        let str = '';
        for (let i = 0; i < rawSettings.chunks; i++) {
          str += rawSettings[`${STORAGE_KEYS.settings}_${i}`];
        }
        
        this.settings = JSON.parse(str);
      }
    },
  }
</script>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  input, button {
    font-family: inherit;
    font-size: inherit;
    padding: .5rem;
    border-radius: 0;
  }
  
  input {
    &.invalid {
      border: 2px solid #ffa7a7
    }
  }
  
  body {
    padding: 3vh 3vw;
    font-family: Helvetica, sans-serif;
    font-size: 1rem;
    background-color: #f8f8ff;
  }
  
  .tooltip {
    display: block !important;
    z-index: 10000;
    
    .tooltip-inner {
      background: black;
      color: white;
      border-radius: 16px;
      padding: 5px 10px 4px;
    }
    
    .tooltip-arrow {
      width: 0;
      height: 0;
      border-style: solid;
      position: absolute;
      margin: 5px;
      border-color: black;
      z-index: 1;
    }
    
    &[x-placement^="top"] {
      margin-bottom: 5px;
      
      .tooltip-arrow {
        border-width: 5px 5px 0 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        bottom: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    
    &[x-placement^="bottom"] {
      margin-top: 5px;
      
      .tooltip-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-top-color: transparent !important;
        top: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    
    &[x-placement^="right"] {
      margin-left: 5px;
      
      .tooltip-arrow {
        border-width: 5px 5px 5px 0;
        border-left-color: transparent !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        left: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
      }
    }
    
    &[x-placement^="left"] {
      margin-right: 5px;
      
      .tooltip-arrow {
        border-width: 5px 0 5px 5px;
        border-top-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        right: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
      }
    }
    
    &.popover {
      $color: #f9f9f9;
      
      .popover-inner {
        background: $color;
        color: black;
        padding: 24px;
        border-radius: 5px;
        box-shadow: 0 5px 30px rgba(black, .1);
      }
      
      .popover-arrow {
        border-color: $color;
      }
    }
    
    &[aria-hidden='true'] {
      visibility: hidden;
      opacity: 0;
      transition: opacity .15s, visibility .15s;
    }
    
    &[aria-hidden='false'] {
      visibility: visible;
      opacity: 1;
      transition: opacity .15s;
    }
  }
  
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 23px;
    
    input {
      opacity: 0;
      width: 0;
      height: 0;
      
      &:checked + .slider {
        background-color: #2196F3;
      }
      
      &:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
      }
      
      &:checked + .slider:before {
        $translateLength: 17px;
        -webkit-transform: translateX($translateLength);
        -ms-transform: translateX($translateLength);
        transform: translateX($translateLength);
      }
    }
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
    
    &:before {
      position: absolute;
      content: "";
      height: 17px;
      width: 17px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
    }
    
    &.round {
      border-radius: 23px;
    }
    
    &.round:before {
      border-radius: 50%;
    }
  }
</style>

<style lang="scss" scoped>
  .header {
    display: flex;
    margin-bottom: 1.3rem;
    
    .addForm {
      display: flex;
      flex-wrap: nowrap;
      
      background-color: #fff;
      border: 1px solid black;
      border-radius: 3px;
      padding: .7rem;
      
      label {
        > *:not(:last-child) {
          margin-right: .5rem;
        }
        
        &:not(:last-child) {
          margin-right: .5rem;
        }
      }
      
      button {
        white-space: nowrap;
      }
    }
    
    .controls {
      width: 100%;
      display: flex;
      border: 1px solid transparent;
      border-radius: 3px;
      padding: .7rem;
      
      button:not(:last-child) {
        margin-right: .4rem;
      }
      
      .showSettings {
        display: flex;
        text-align: right;
        
        p {
          width: 10px;
          text-align: center;
          margin-right: .1rem;
        }
      }
      
      .save {
        margin-left: auto;
        display: flex;
        align-items: center;
        
        .message {
          color: limegreen;
          
          &.error {
            color: indianred;
          }
        }
        
        p {
          margin-right: .4rem;
        }
        
        button {
          height: 100%;
          padding: 0 1rem;
          background-color: #a7fc45;
          border: 1px solid #90d535;
          outline: 2px solid #6fa72d;
          
          &:active {
            background-color: #95eb45;
          }
        }
      }
      
      button {
        white-space: nowrap;
      }
    }
  }
  
  .options {
    background-color: #fff;
    border: 1px solid black;
    border-radius: 3px;
    padding: .7rem;
    margin-bottom: 1.3rem;
    
    .option {
      .title {
        margin-right: .4rem;
      }
      
      .description {
        margin-left: .4rem;
      }
    }
    
    li {
      list-style: none;
      
      &:not(:last-child) {
        margin-bottom: .6rem;
      }
    }
  }
  
  .rules {
    display: flex;
    flex-direction: column;
    min-width: min-content;
  }
  
  .debug {
    position: absolute;
    right: 2vw;
    top: 1vh;
    padding: 1rem;
    border: 1px solid darkblue;
    border-radius: 2px;
    background-color: #fff;
    font-size: 1.4rem;
    display: flex;
    flex-direction: column;
    
    .actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    .close {
      align-self: flex-end;
      text-decoration: underline;
      margin-bottom: .4rem;
    }
    
    > input {
      transform: scale(1.2);
      margin-bottom: .5rem;
    }
  }
</style>
