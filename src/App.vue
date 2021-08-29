<template>
  <div>
    <DebugMenu
      v-if="show.debug"
      v-model="settings.debug"
      :settings="settings"
      @close="show.debug = false"
      @resetSettings="resetSettings()"
      @importSettings="settings = $event"
    />
    <div class="header">
      <ControlsMenu
        :message="message"
        :domainNames="domainNames"
        :is-mock="mock"
        @saveSettings="saveSettings"
        @showOptions="show.options = $event"
        @createDomain="createDomain"
      />
    </div>
    <OptionsMenu
      v-if="show.options"
      :settings="settings"
    />
    <RulesList :rules="settings.rules"/>
  </div>
</template>

<script>
  import { mock } from '@/utils/mock';
  import RulesList from '@/components/RulesList';
  import OptionsMenu from '@/components/OptionsMenu';
  import ControlsMenu from '@/components/ControlsMenu';
  import DebugMenu from '@/components/DebugMenu';
  import { loadData, saveData } from '@/api';
  import { createDomain } from '@/utils/entities';
  
  export default {
    name: 'App',
    components: { DebugMenu, ControlsMenu, OptionsMenu, RulesList },
    data() {
      return {
        mock: 0,
        settings: {},
        show: {
          debug: false,
          preferences: false,
          options: false
        },
        message: ''
      };
    },
    computed: {
      domainNames() {
        return this.settings?.rules?.map(rule => rule.name);
      }
    },
    methods: {
      createDomain(name) {
        this.settings?.rules?.push(createDomain(name));
      },
      saveSettings() {
        saveData({
          settings: this.settings
        });
      },
      resetSettings() {
        this.settings = this.getMockSettings();
      },
      getMockSettings() {
        return JSON.parse(JSON.stringify(mock[0].settings));
      }
    },
    async created() {
      document.addEventListener('keydown', e => {
        if (e.shiftKey && e.altKey && (e.key === 'X' || e.key === 'Ч')) {
          this.show.debug = !this.show.debug;
        }
      });
      
      if (this.mock) {
        const settings = this.getMockSettings();
        settings.rules = settings.rules.map(createDomain);
        this.settings = settings;
      } else {
        this.settings = await loadData();
      }
    }
  };
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
</style>

<style lang="scss" scoped>
  .header {
    display: flex;
    margin-bottom: 1.3rem;
  }
</style>
