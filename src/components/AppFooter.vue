<template>
  <v-footer height="40" app>
    <a
      v-for="item in items"
      :key="item.title"
      :href="item.href"
      :title="item.title"
      :icon="item.icon"
      class="d-inline-block mx-2 social-link"
      rel="noopener noreferrer"
      target="_blank"
    >
    <v-icon
        :icon="item.icon"
        :size="item.icon === 'mdi-github' ? 24 : 16"
      />

    </a>

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px;"
    >
      &copy; 2024-{{ (new Date()).getFullYear() }} uclipboard. <span class="d-none d-sm-inline-block">All rights reserved.</span>
    </div>
  </v-footer>
</template>

<script setup>
  const items = [
    {
      title: 'uclipboard GitHub',
      icon: `mdi-github`,
      href: 'https://github.com/uclipboard/uclipboard',
    },
    {
      title: 'uclipboard Document',
      icon: `mdi-file-document-multiple`,
      href: 'https://github.com/uclipboard/uclipboard/wiki',
    },
  ]
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>
