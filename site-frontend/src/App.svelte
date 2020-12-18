<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import Home from "./content/Home.svelte";
  import Test from "./content/Test.svelte";
  import Other from "./content/Other.svelte";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";

  const routes = {
    "/": Home,
    "/test": Test,
    "/other": Other,
  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar">
    <a href="/" use:link use:active>Home</a>
    <a href="/test" use:link use:active>Test</a>
    <a href="/other" use:link use:active>Other</a>
  </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
