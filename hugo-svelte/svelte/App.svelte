<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import {
    link,
    push,
    pop,
    replace,
    location,
    querystring,
  } from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import Home from "./content/Home.svelte";
  import Test from "./content/Test.svelte";

  import Accordion from "./Accordion/accordion.js";
  import { onMount } from "svelte";
  // import Page from "./Page.svelte";
  // import NotFound from "./NotFound.svelte";

  let sitePages = null;
  async function getSiteMap() {
    const response = await fetch("/_sitemap.dat");
    const content = await response.text();
    let lines = content.split(/\r?\n/);
    let pages = [];
    lines.forEach(function (page) {
      pages.push(page.split("$$"));
    });
    if (response.ok) {
      sitePages = pages;
      console.log(sitePages);
    } else {
      throw new Error(text);
    }
  }
  getSiteMap();

  const routes = {
    "/": Home,
    "/test": Test,
  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar">
    {#if sitePages != null}
      {#each sitePages as page}
        {page}
        <a href={page[0]} use:active>{page[1]}</a>
      {/each}
    {/if}
  </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
