<template>
  <div class="value">
    <div class="decorator">
      <div class="top"/>
      <div class="bottom"/>
    </div>
    <ButtonSimple
      class="add clean icon-plus"
      :disabled="stub"
      @click="$emit('create')"
      v-tooltip="'Create value'"
    >
      ➕
    </ButtonSimple>
    <ButtonSimple
      class="remove clean icon-normal"
      :disabled="stub"
      @click="$emit('remove')"
      v-tooltip="'Delete value'"
    >
      ✖
    </ButtonSimple>
    <label class="name label">
      <span class="title">Value:</span>
      <InputSimple
        class="input"
        type="text"
        placeholder=""
        :class="{ invalid: !paramvalue.name.length }"
        :disabled="stub"
        v-model="paramvalue.name"
      />
    </label>
    <label class="text label">
      <span class="title">Text:</span>
      <InputSimple
        class="input"
        type="text"
        :disabled="stub"
        :class="{ invalid: !paramvalue.text.length }"
        v-model="paramvalue.text"
      />
    </label>
    <div class="previewWrapper" @click="openTestTab">
      <span class="title">Preview:</span>
      <span
        class="preview"
        v-tooltip="'Click to test in new tab'"
      >{{ preview }}</span>
    </div>
  </div>
</template>

<script>
  import ButtonSimple from '@/components/ButtonSimple';
  import InputSimple from '@/components/InputSimple';
  
  export default {
    name: 'ParameterValue',
    components: { InputSimple, ButtonSimple },
    props: {
      paramvalue: {
        type: Object,
        default: () => {}
      },
      stub: {
        type: Boolean,
        default: false
      },
      domainName: {
        type: String,
        required: true
      },
      parameterName: {
        type: String,
        required: true
      }
    },
    computed: {
      preview() {
        return `${this.domainName}?${this.parameterName}=${this.paramvalue.name}`;
      }
    },
    methods: {
      openTestTab() {
        chrome.tabs.create({
          url: `https://${this.preview}`
        });
      }
    }
  };
</script>

<style lang="scss" scoped>
  .value {
    display: flex;
    align-items: center;
    margin-top: .4rem;
    
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
    
    .name {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      
      .input {
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
    
    .button {
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
    
    .title {
      color: #746f6f;
    }
    
    .previewWrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      
      .preview {
        margin-left: .2rem;
        max-width: 40ch;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
</style>
