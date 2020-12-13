<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import { link, push, pop, replace, location, querystring } from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import Home from "./content/Home.svelte";
  import Test from "./content/Test.svelte";

  import Accordion from "./Accordion/accordion.js";
  // import Page from "./Page.svelte";
  // import NotFound from "./NotFound.svelte";

  let htmlContent = "";
  async function getSiteMap() {
    await fetch("/sitemap.xml")
      .then((response) => {
        console.dir(response);
        return response.text();
      })
      .then((html) => {
        htmlContent = html;
        console.log(htmlContent);
        let pages = htmlContent.match(/<loc>(.*?)<\/loc>/g);
        console.log("Pages:" + pages);
      });
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
    <Accordion>
      <Accordion.Section title={'Header One'}>
        <a href="/" use:link use:active>Google</a>
      </Accordion.Section>
      <Accordion.Section title={'Header Two'}>
        <a href="/test" use:link use:active>Nutella</a>
      </Accordion.Section>
    </Accordion>
  </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
