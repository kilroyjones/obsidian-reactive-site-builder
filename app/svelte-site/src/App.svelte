<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
  import Accordion from "svelte-accordion";
  import Peripherals_bananas from "./content/Peripherals/bananas.svelte";
import Peripherals_home from "./content/Peripherals/home.svelte";
import Peripherals_keyboard from "./content/Peripherals/keyboard.svelte";
import Peripherals_mouse from "./content/Peripherals/mouse.svelte";
import Peripherals_binary from "./content/Peripherals/binary.svelte";
import Peripherals_quizzes_question1 from "./content/Peripherals/quizzes/question1.svelte";
import Peripherals_sub_perphs_question1 from "./content/Peripherals/sub_perphs/question1.svelte";
import Peripherals_sub_perphs_testing from "./content/Peripherals/sub_perphs/testing.svelte";
import Other_home from "./content/Other/home.svelte";


  const routes = {
    "/Peripherals/bananas": Peripherals_bananas,
"/Peripherals/home": Peripherals_home,
"/Peripherals/keyboard": Peripherals_keyboard,
"/Peripherals/mouse": Peripherals_mouse,
"/Peripherals/binary": Peripherals_binary,
"/Peripherals/quizzes/question1": Peripherals_quizzes_question1,
"/Peripherals/sub_perphs/question1": Peripherals_sub_perphs_question1,
"/Peripherals/sub_perphs/testing": Peripherals_sub_perphs_testing,
"/Other/home": Other_home,

  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar"> <Accordion><Accordion.Section title={'Peripherals'}><div class="section-content"><a href="/Peripherals/bananas" use:link use:active>bananas</a><br />
<a href="/Peripherals/home" use:link use:active>home</a><br />
<a href="/Peripherals/keyboard" use:link use:active>keyboard</a><br />
<a href="/Peripherals/mouse" use:link use:active>mouse</a><br />
<a href="/Peripherals/binary" use:link use:active>binary</a><br />
<a href="/Peripherals/question1" use:link use:active>question1</a><br />
<a href="/Peripherals/question1" use:link use:active>question1</a><br />
<a href="/Peripherals/testing" use:link use:active>testing</a><br />
</div></Accordion.Section><Accordion.Section title={'Other'}><div class="section-content"><a href="/Other/home" use:link use:active>home</a><br />
</div></Accordion.Section></Accordion> </span>
  <span slot="content">
    <div class="container-fluid">
      <div class="columns">
        <div class="col-md-1" />
        <div class="col-md-8">
          <Router {routes} />
        </div>
        <div class="col-md-3" />
      </div>
    </div>
  </span>
</Sidebar>
