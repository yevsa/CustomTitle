<template>
  <div>
    <div class="addForm">
      <label>
        <input v-model="newDomain" type="text" placeholder="example.com">
      </label>
      <button @click="addDomain">+ Add</button>
    </div>
    <div class="rules" v-if="activeRules.length">
      <DomainRule
        v-for="(rule, key) in activeRules"
        :key="key"
        :data="rule"
        @remove="removeDomain"
        @update="updateDomain"
      />
    </div>
    <div class="rules" v-else>
      <div class="noRules">
        Список пуст
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
        options: {},
        newDomain: '',
      }
    },
    computed: {
      activeRules() {
        return this.options.ruleset?.filter(el => el.enabled) ?? [];
      },
    },
    methods: {
      getStorageData(param) {
        if (this.mock) {
          return Promise.resolve(mock[param]);
        } else {
          return new Promise(resolve => {
            chrome.storage.sync.get(param, data => resolve(data[param]))
          });
        }
      },
      setStorageData(data) {
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
      },
      addDomain() {
        const ruleset = this.options.ruleset;

        if (!ruleset.find(el => el.name === this.newDomain)) {
          ruleset.push({
            name: this.newDomain,
            enabled: true,
            text: '',
            params: [
              {
                name: '',
                enabled: true,
                priority: 1,
                pair: true,
                text: '',
                values: [
                  {
                    name: '',
                    enabled: true,
                    text: '',
                  }
                ]
              },
            ]
          });
        }
      },
      removeDomain(name) {
        this.options.ruleset.splice(this.options.ruleset.findIndex(el => el.name === name), 1);
      },
      updateDomain(domain) {
        this.options.ruleset.splice(this.options.ruleset.findIndex(el => el.name === domain.name), 1, domain);
      },
    },
    watch: {
      'options.ruleset': {
        handler(val) {
          this.options.ruleset = val;

          console.log('------');
          console.log('invalid ruleset', JSON.stringify(val, null, 2));

          const validRuleset = JSON.parse(JSON.stringify(this.options.ruleset));
          validRuleset
            .filter(domain => {
              domain.params = domain.params.filter(param => {
                param.values = param.values.filter(value => {
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

          this.setStorageData({ options: { ...this.options, ruleset: validRuleset } });
        },
        deep: true,
      }
    },
    async created() {
      this.options = await this.getStorageData('options');
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
    border-radius: 0px;
  }

  input {
    margin-right: .5rem;
  }

  body {
    padding: 3vh 3vw;
    font-size: 1rem;
    background-color: #f8f8ff;
  }

  .addForm {
    margin-bottom: 1.3rem;
    min-width: 500px;
  }
</style>
