<template>
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <q-page-container>
      <q-page class="auth-page">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.auth-layout,
.auth-page {
  min-height: 100vh !important;
  background: $bg-deep !important;
}
</style>
