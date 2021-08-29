<template>
  <div class="options">
    <ul>
      <li class="item">
        <label class="option" v-if="separatorEnabled">
          <span class="title">Separator</span>
          <input
            type="text"
            v-model="settings.separator.value"
          >
        </label>
      </li>
      <li class="item">
        <label class="option">
          <input type="checkbox" v-model="settings.options.caseSensitive">
          <span class="description">Case sensitive</span>
        </label>
      </li>
      <li class="item">
        <label class="option">
          <input type="checkbox" v-model="settings.options.suppress">
          <span class="description">Prevent title change (keep custom title)</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'OptionsMenu',
    props: {
      settings: {
        type: Object,
        required: true
      }
    },
    computed: {
      separatorEnabled() {
        return this.settings.separator?.enabled;
      }
    }
  };
</script>

<style lang="scss" scoped>
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
    
    .item {
      list-style: none;
      
      &:not(:last-child) {
        margin-bottom: .6rem;
      }
    }
  }
</style>
