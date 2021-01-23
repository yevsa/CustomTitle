<template>
  <div class="value">
    <div class="decorator">
      <div class="top"/>
      <div class="bottom"/>
    </div>
    <button
      class="add"
      :disabled="stub"
      @click="$emit('create')"
      v-tooltip="'Create value'"
    >+
    </button>
    <label class="name">
      <span class="title">Value:</span>
      <input
        type="text"
        placeholder=""
        :class="{ invalid: !localData.name.length }"
        :disabled="stub"
        v-model="localData.name"
      >
    </label>
    <label class="text">
      <span class="title">Text:</span>
      <input
        type="text"
        :disabled="stub"
        :class="{ invalid: !localData.text.length }"
        v-model="localData.text"
      >
    </label>
    <button
      @click="openTestTab"
      v-tooltip="'Test (in new tab)'"
    >
      🔍
    </button>
    <button
      class="remove"
      :disabled="stub"
      @click="$emit('remove', data.id)"
      v-tooltip="'Delete value'"
    >
      🞨
    </button>
    <!--<label class="switch">
      <input type="checkbox" v-model="localData.enabled">
      <span class="slider"></span>
    </label>-->
  </div>
</template>

<script>
  export default {
    name: "ParameterValue",
    props: {
      data: {
        type: Object,
        default: () => {},
      },
      stub: {
        type: Boolean,
        default: false,
      }
    },
    inject: {
      domainData: 'domainData',
      parameterData: 'parameterData',
    },
    data() {
      return {
        localData: {},
      };
    },
    methods: {
      openTestTab() {
        chrome.tabs.create({
          url: `https://${this.domainData.name}/?${this.parameterData.name}=${this.localData.name}`
        });
      },
    },
    watch: {
      data: {
        handler(val) {
          this.localData = JSON.parse(JSON.stringify(val));
        },
        deep: true,
        immediate: true,
      },
      localData: {
        handler(val) {
          this.$emit('update', val);
        },
        deep: true,
      },
    },
  }
</script>

<style lang="scss" scoped>
  .value {
    display: flex;
    align-items: center;
    margin-top: .4rem;

    label {
      .title {
        margin: 0 .6rem;
      }
    }

    .name {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;

      input {
        width: 9.85rem;
      }
    }

    .switch {
      margin-left: .6rem;
    }

    .text {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      margin-right: .5rem;
    }

    button {
      height: 2.34rem;
    }

    &:last-child .decorator {
      .bottom {
        border-left: none;
      }
    }

    .decorator {
      $borderParams: 2px solid #dadada;
      width: 1.9rem;
      height: 2.34rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding-right: .2rem;

      .top {
        height: 50%;
        width: 50%;
        border-bottom: $borderParams;
        border-left: $borderParams;
      }

      .bottom {
        height: 50%;
        width: 50%;
        border-left: $borderParams;
      }
    }

    &:not(:last-child) {
      margin-bottom: .3rem;
    }
  }
</style>
