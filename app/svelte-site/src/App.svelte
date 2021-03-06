<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
  import Peripherals_bananas from "./content/peripherals/bananas.svelte";
import Peripherals_home from "./content/peripherals/home.svelte";
import Peripherals_keyboard from "./content/peripherals/keyboard.svelte";
import Peripherals_mouse from "./content/peripherals/mouse.svelte";
import Peripherals_binary from "./content/peripherals/binary.svelte";
import Peripherals_quizzes_question1 from "./content/peripherals/quizzes/question1.svelte";
import Peripherals_sub_perphs_question1 from "./content/peripherals/sub_perphs/question1.svelte";
import Peripherals_sub_perphs_testing from "./content/peripherals/sub_perphs/testing.svelte";
import With_space_goods from "./content/with_space/goods.svelte";
import With_space_home from "./content/with_space/home.svelte";
import With_space_testing from "./content/with_space/testing.svelte";
import Storage_magnetic_tape from "./content/storage/magnetic_tape.svelte";
import Storage_serial from "./content/storage/serial.svelte";
import Storage_optical from "./content/storage/optical.svelte";
import Storage_data from "./content/storage/data.svelte";
import Storage_magnetic from "./content/storage/magnetic.svelte";
import Storage_direct from "./content/storage/direct.svelte";
import Storage_secondary from "./content/storage/secondary.svelte";
import Storage_hard_disks from "./content/storage/hard_disks.svelte";
import Storage_solid_state from "./content/storage/solid_state.svelte";
import Storage_ssd from "./content/storage/SSD.svelte";
import Storage_primary from "./content/storage/primary.svelte";
import Storage_home from "./content/storage/home.svelte";
import Storage_backup from "./content/storage/backup.svelte";
import Storage_binary from "./content/storage/binary.svelte";


  const routes = {
    "/peripherals/bananas": Peripherals_bananas,
"/peripherals/home": Peripherals_home,
"/peripherals/keyboard": Peripherals_keyboard,
"/peripherals/mouse": Peripherals_mouse,
"/peripherals/binary": Peripherals_binary,
"/peripherals/quizzes/question1": Peripherals_quizzes_question1,
"/peripherals/sub_perphs/question1": Peripherals_sub_perphs_question1,
"/peripherals/sub_perphs/testing": Peripherals_sub_perphs_testing,
"/with_space/goods": With_space_goods,
"/with_space/home": With_space_home,
"/with_space/testing": With_space_testing,
"/storage/magnetic_tape": Storage_magnetic_tape,
"/storage/serial": Storage_serial,
"/storage/optical": Storage_optical,
"/storage/data": Storage_data,
"/storage/magnetic": Storage_magnetic,
"/storage/direct": Storage_direct,
"/storage/secondary": Storage_secondary,
"/storage/hard_disks": Storage_hard_disks,
"/storage/solid_state": Storage_solid_state,
"/storage/SSD": Storage_ssd,
"/storage/primary": Storage_primary,
"/storage/home": Storage_home,
"/storage/backup": Storage_backup,
"/storage/binary": Storage_binary,

  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar"> <a href="/peripherals/home" use:link use:active>peripherals</a><br />
<a href="/with_space/home" use:link use:active>with space</a><br />
<a href="/storage/home" use:link use:active>storage</a><br />
 </span>
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
