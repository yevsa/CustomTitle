<template>
  <div>
    <div
      class="debug"
      v-if="showDebug"
    >
      <span class="close" @click="showDebug = false">Закрыть 🞨</span>
      <label>
        <input id="debug" type="checkbox" v-model="options.debug">
        <span>Включить отладку</span>
      </label>
    </div>
    <div class="addForm">
      <label>
        <input v-model="newDomain" type="text" @keyup.enter="addDomain" placeholder="example.com">
        <button @click="addDomain">+ Add</button>
      </label>
    </div>
    <div class="preferences">
      <label v-if="separatorEnabled">
        <span class="title">Separator</span>
        <input type="text" v-model="options.separator.value">
      </label>
    </div>
    <div class="rules" v-if="activeRules.length">
      <DomainRule
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
        mock: 1,
        options: {},
        newDomain: '',
        showDebug: false,
        showPreferences: false,
      }
    },
    computed: {
      activeRules() {
        return this.options.ruleset?.filter(el => el.enabled) ?? [];
      },
      separatorEnabled() {
        return this.options?.separator?.enabled;
      },
    },
    methods: {
      generateNewId(array) {
        return array.map(el => el.id).sort().slice(-1)[0] + 1;
      },
      addDomain() {
        if (!this.newDomain.length) return;

        const ruleset = this.options.ruleset;

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
        this.options.ruleset.push({
          ...domain,
          id: this.generateNewId(this.options.ruleset),
        });
      },
      removeDomain(id) {
        this.options.ruleset.splice(this.options.ruleset.findIndex(el => el.id === id), 1);
      },
      updateDomain(domain) {
        this.options.ruleset.splice(this.options.ruleset.findIndex(el => el.id === domain.id), 1, domain);
      },
      saveSettings() {
        const invalidRuleset = JSON.parse(JSON.stringify(this.options.ruleset));
        // console.log('------');
        // console.log('invalid ruleset', JSON.stringify(invalidRuleset, null, 2));

        const validRuleset = invalidRuleset
          .filter(domain => {
            domain.params = domain.params.filter(param => {
              param.values = param.values
                .filter(value => {
                  return value.name.length
                    && value.text.length;
                });

              return param.name.length
                && (param.pair || param.text.length)
                && param.values.length;
            });

            return domain.name.length
              && domain.text.length
              && domain.params.length;
          });

        const data = {
          options: {
            ...this.options,
            ruleset: validRuleset,
          },
        };

        if (!this.mock) {
          return new Promise(resolve => {
            chrome.storage.sync.set(data, () => {
              if (this.options.debug) {
                console.log('storage.set', JSON.stringify(data, null, 2));
              }

              resolve()
            });
          });
        } else {
          console.debug('setStorageData', JSON.stringify(data, null, 2));
        }
      }
    },
    async created() {
      if (this.mock) {
        this.options = mock.options;
      } else {
        this.options = await new Promise(resolve => {
          chrome.storage.sync.get('options', ({ options }) => resolve(options));
        });
      }

      document.addEventListener('keydown', e => {
        if (e.shiftKey && e.altKey && e.key === 'D') this.showDebug = !this.showDebug;
      });
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
    margin-right: .5rem;
  }

  body {
    padding: 3vh 3vw;
    font-family: Helvetica, sans-serif;
    font-size: 1rem;
    background-color: #f8f8ff;
  }
</style>

<style lang="scss" scoped>
  .addForm {
    margin-bottom: 1.3rem;
    min-width: 500px;

    label {
      > *:not(:last-child) {
        margin-right: .5rem;
      }

      &:not(:last-child) {
        margin-right: .5rem;
      }
    }
  }

  .preferences {
    background-color: #fff;
    border: 1px solid black;
    border-radius: 3px;
    padding: .7rem;
    margin-bottom: 1.3rem;

    span.title {
      margin-right: .4rem;
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
