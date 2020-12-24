<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
  import With_space from "./content/with_space.svelte";
import With_space_Testing from "./content/with_space/testing.svelte";
import Storage from "./content/storage.svelte";
import Storage_Magnetic_tape from "./content/storage/magnetic_tape.svelte";
import Storage_Optical from "./content/storage/optical.svelte";
import Storage_Serial from "./content/storage/serial.svelte";
import Storage_Direct from "./content/storage/direct.svelte";
import Storage_Ssd from "./content/storage/SSD.svelte";
import Storage_Hard_disks from "./content/storage/hard_disks.svelte";
import Storage_Primary from "./content/storage/primary.svelte";
import Storage_Backup from "./content/storage/backup.svelte";
import Storage_Data from "./content/storage/data.svelte";
import Storage_Binary from "./content/storage/binary.svelte";
import Storage_Solid_state from "./content/storage/solid_state.svelte";
import Storage_Secondary from "./content/storage/secondary.svelte";
import Storage_Magnetic from "./content/storage/magnetic.svelte";
import Peripherals from "./content/peripherals.svelte";
import Peripherals_Binary from "./content/peripherals/binary.svelte";
import Peripherals_Mouse from "./content/peripherals/mouse.svelte";
import Peripherals_Keyboard from "./content/peripherals/keyboard.svelte";


  const routes = {
    "/with_space": With_space,
"/with_space/testing": With_space_Testing,
"/storage": Storage,
"/storage/magnetic_tape": Storage_Magnetic_tape,
"/storage/optical": Storage_Optical,
"/storage/serial": Storage_Serial,
"/storage/direct": Storage_Direct,
"/storage/SSD": Storage_Ssd,
"/storage/hard_disks": Storage_Hard_disks,
"/storage/primary": Storage_Primary,
"/storage/backup": Storage_Backup,
"/storage/data": Storage_Data,
"/storage/binary": Storage_Binary,
"/storage/solid_state": Storage_Solid_state,
"/storage/secondary": Storage_Secondary,
"/storage/magnetic": Storage_Magnetic,
"/peripherals": Peripherals,
"/peripherals/binary": Peripherals_Binary,
"/peripherals/mouse": Peripherals_Mouse,
"/peripherals/keyboard": Peripherals_Keyboard,

  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar"> <a href="/with_space" use:link use:active>with space</a><br />"
<a href="/storage" use:link use:active>storage</a><br />"
<a href="/peripherals" use:link use:active>peripherals</a><br />"
 </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
