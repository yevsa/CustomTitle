<template>
  <div class="rules" v-if="rules.length">
    <DomainRule
      ref="domains"
      v-for="(domain, index) in rules"
      :key="domain.id"
      :domain="domain"
      @duplicate="duplicateDomain(domain)"
      @remove="removeDomain(index)"
    />
  </div>
  <div class="rules" v-else>
    List is empty
  </div>
</template>

<script>
  import DomainRule from '@/components/DomainRule';
  import { createDomain } from '@/utils/entities';
  import { ControlEmitter } from '@/utils/ControlEmitter';
  
  export default {
    name: 'RulesList',
    components: { DomainRule },
    props: {
      rules: {
        type: Array,
        required: false,
        default: () => []
      }
    },
    methods: {
      duplicateDomain(domain) {
        this.rules.push(createDomain(domain));
      },
      removeDomain(index) {
        this.rules.splice(index, 1);
      },
      openAllTabs() {
        this.$refs.domains?.forEach(domain => domain.openTab());
      },
      closeAllTabs() {
        this.$refs.domains?.forEach(domain => domain.closeTab());
      }
    },
    created() {
      ControlEmitter.on('openAllTabs', this.openAllTabs);
      ControlEmitter.on('closeAllTabs', this.closeAllTabs);
    },
    beforeDestroy() {
      ControlEmitter.off('openAllTabs', this.openAllTabs);
      ControlEmitter.off('closeAllTabs', this.closeAllTabs);
    }
  };
</script>

<style lang="scss" scoped>
  .rules {
    display: flex;
    flex-direction: column;
    min-width: min-content;
  }
</style>
