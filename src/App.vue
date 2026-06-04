<template>
  <div class="app-shell">
    <header class="shell-header">
      <div class="shell-heading">
        <p class="shell-eyebrow">Vue 2 Component Pages</p>
        <h1>组件测试页</h1>
      </div>
      <p class="shell-desc">
        每个组件单独对应一个路由页面。后续新增组件时，在
        <span class="shell-code">src/pages</span>
        下新增 page，并在页面表里登记即可。
      </p>
    </header>

    <div class="shell-layout">
      <nav class="shell-nav" aria-label="组件页面导航">
        <router-link
          v-for="page in pages"
          :key="page.name"
          :to="page.path"
          class="shell-link"
        >
          <strong>{{ page.label }}</strong>
          <span>{{ page.description }}</span>
        </router-link>
      </nav>

      <main class="shell-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { pageNavItems } from './pages'

export default {
  name: 'App',
  data() {
    return {
      pages: pageNavItems
    }
  }
}
</script>

<style scoped lang="less">
.app-shell {
  min-height: 100vh;
  padding: 32px 16px 48px;
}

.shell-header,
.shell-layout {
  max-width: 1180px;
  margin: 0 auto;
}

.shell-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.shell-heading h1 {
  margin: 0;
  font-size: 40px;
  line-height: 1.1;
  color: #0f172a;
}

.shell-eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #0f766e;
}

.shell-desc {
  max-width: 440px;
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
}

.shell-code {
  display: inline-block;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  font-family: "SFMono-Regular", "Consolas", monospace;
  font-size: 14px;
  color: #0f172a;
}

.shell-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.shell-nav {
  display: grid;
  gap: 12px;
}

.shell-link {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  color: #0f172a;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.shell-link strong {
  font-size: 16px;
  line-height: 1.4;
}

.shell-link span {
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}

.shell-link:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.28);
}

.shell-link.router-link-exact-active {
  border-color: rgba(15, 118, 110, 0.38);
  background: rgba(240, 253, 250, 0.92);
  box-shadow: 0 16px 40px rgba(15, 118, 110, 0.1);
}

.shell-main {
  min-width: 0;
}

@media (max-width: 900px) {
  .shell-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .shell-desc {
    max-width: none;
  }

  .shell-layout {
    grid-template-columns: 1fr;
  }

  .shell-nav {
    grid-auto-flow: column;
    grid-auto-columns: minmax(220px, 1fr);
    overflow-x: auto;
    padding-bottom: 6px;
  }
}

@media (max-width: 640px) {
  .app-shell {
    padding: 24px 12px 40px;
  }

  .shell-heading h1 {
    font-size: 32px;
  }
}
</style>
