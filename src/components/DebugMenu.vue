<template>
  <div class="debug">
    <span class="close" @click="$emit('close')">Close 🞨</span>
    <div class="actions">
      <label>
        <input type="checkbox" :checked="$attrs.value" @change="$emit('input', $event.target.checked)">
        <span>Debug</span>
      </label>
      <p @click="exportSettings">Export settings</p>
      <p @click="importSettings">Import settings</p>
      <p @click="$emit('resetSettings')">Reset settings</p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'DebugMenu',
    props: {
      settings: {
        type: Object,
        required: true
      }
    },
    methods: {
      exportSettings() {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
        a.href = URL.createObjectURL(file);
        a.download = 'settings.json';
        a.click();
      },
      async importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', async e => {
          const json = await e.target.files[0]?.text();
          if (json) {
            const settings = JSON.parse(json);
            
            this.$emit('importSettings', settings);
          }
        });
        
        input.click();
      }
    }
  };
</script>

<style lang="scss" scoped>
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
