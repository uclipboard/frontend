<template>
  <v-app>
    <v-main>
      <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title class="d-none d-sm-inline-block">uclipboard</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-breadcrumbs :items="['home', tab]"></v-breadcrumbs>


      </v-app-bar>
      <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
        <v-list lines="one">

          <v-list-item prepend-icon="mdi-history" title="history" subtitle="uclipboard manager"
            @click="tab = 'history'"></v-list-item>
          <v-list-item prepend-icon="mdi-key" title="token" subtitle="token manager"
            @click="tab = 'token'"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-container fill-height>
        <v-tabs-window class="pa-4 mx-auto" v-model="tab">
          <v-tabs-window-item value="history">
            <History />
          </v-tabs-window-item>

          <v-tabs-window-item value="token">
            <TokenPanel />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script>
export default {
  data: () => ({
    tab: "history",
    drawer: false,
    group: null,

  }),
  watch: {
    group() {
      this.drawer = false
    },
  },

}
</script>
