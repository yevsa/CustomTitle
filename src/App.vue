<template>
  <div>
    <div
      class="debug"
      v-if="showDebug"
    >
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
          <input v-model="newDomain" type="text" @keyup.enter="addDomain" placeholder="example.com">
        </label>
        <button @click="addDomain">+ Add</button>
      </div>
      <div
        v-if="isControlsActive"
        class="controls"
      >
        <button
          @click="showSettings = !showSettings"
          class="showSettings"
        >
          <p>{{ showSettings ? '-' : '+' }}</p> Options
        </button>
        <button @click="openAllTabs">Open All</button>
        <button @click="closeAllTabs">Close All</button>

        <div class="save">
          <p
            class="saveError"
            v-if="saveError"
          >Fill all fields</p>
          <button @click="saveSettings">Save</button>
        </div>
      </div>
    </div>
    <div
      class="options"
      v-if="showSettings"
    >
      <ul>
        <li>
          <label v-if="separatorEnabled">
            <span class="title">Separator</span>
            <input type="text" v-model="settings.separator.value">
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" v-model="settings.options.caseSensitive">
            <span>Case sensitive</span>
          </label>
        </li>
      </ul>
    </div>
    <div class="rules" v-if="activeRules.length">
      <DomainRule
        ref="domains"
        v-for="(rule, key) in activeRules"
        :key="key"
        :data="rule"
        @duplicate="duplicateDomain(rule)"
        @remove="removeDomain"
        @update="updateDomain"
      />
    </div>
    <div class="rules" v-else>
      <div class="noRules">
        List is empty
      </div>
    </div>
  </div>
</template>

<script>
  import DomainRule from "@/components/DomainRule";
  import { mock } from '@/utils/mock';

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
        saveError: false,
      }
    },
    computed: {
      activeRules() {
        return this.settings.ruleset?.filter(el => el.enabled) ?? [];
      },
      separatorEnabled() {
        return this.settings?.separator?.enabled;
      },
      isControlsActive() {
        return Object.keys(this.settings).length && this.activeRules.length;
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

        const ruleset = this.settings.ruleset;

        if (!ruleset.find(el => el.name === this.newDomain)) {
          ruleset.push({
            id: this.generateNewId(ruleset),
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
        this.settings.ruleset.push({
          ...domain,
          id: this.generateNewId(this.settings.ruleset),
        });
      },
      removeDomain(id) {
        this.settings.ruleset.splice(this.settings.ruleset.findIndex(el => el.id === id), 1);
      },
      updateDomain(domain) {
        this.settings.ruleset.splice(this.settings.ruleset.findIndex(el => el.id === domain.id), 1, domain);
      },
      saveSettings() {
        const invalidRuleset = JSON.parse(JSON.stringify(this.settings.ruleset));
        // console.log('------');
        // console.log('invalid ruleset', JSON.stringify(invalidRuleset, null, 2));

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
          this.saveError = true;
          return;
        }

        const data = {
          settings: {
            ...this.settings,
            ruleset: validRuleset,
          },
        };

        if (!this.mock) {
          return new Promise(resolve => {
            chrome?.storage.sync.set(data, () => {
              if (this.settings.debug) {
                console.log('storage.set', JSON.stringify(data, null, 2));
              }

              resolve()
            });
          });
        } else {
          console.debug('setStorageData', JSON.stringify(data, null, 2));
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

        // input.addEventListener('change', e => console.log('change', e));
        // input.addEventListener('input', e => console.log('input', e));

        input.addEventListener('change', async e => {
          try {
            this.settings = JSON.parse(await e.target.files[0].text());
          } catch (e) {
            console.error('File import error', e);
          }
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
        this.settings = await new Promise(resolve => {
          chrome.storage.sync.get('settings', ({ settings }) => resolve(settings));
        });
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
      //box-shadow: 0 0 5px 2px #ff6b6b;
      border: 2px solid #ffa7a7
    }
  }

  body {
    padding: 3vh 3vw;
    font-family: Helvetica, sans-serif;
    font-size: 1rem;
    background-color: #f8f8ff;
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
      //min-width: 500px;

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
      //background-color: #fff;
      border: 1px solid transparent;
      border-radius: 3px;
      padding: .7rem;

      button:not(:last-child) {
        margin-right: .4rem;
      }

      .saveError {
        color: indianred;
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

        p {
          margin-right: .4rem;
        }

        button {
          height: 100%;
          padding: 0 1rem;
          background-color: #a7fc45;
          border: 1px solid #90d535;
          outline: 2px solid #6fa72d;
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

    span.title {
      margin-right: .4rem;
    }

    li {
      list-style: none;

      &:not(:last-child) {
        margin-bottom: .6rem;
      }
    }
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
