<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
  import Testing_With space from "./content/with_space/testing.svelte";
import Magnetic_tape_Storage from "./content/storage/magnetic_tape.svelte";
import Optical_Storage from "./content/storage/optical.svelte";
import Serial_Storage from "./content/storage/serial.svelte";
import Direct_Storage from "./content/storage/direct.svelte";
import Ssd_Storage from "./content/storage/SSD.svelte";
import Hard_disks_Storage from "./content/storage/hard_disks.svelte";
import Primary_Storage from "./content/storage/primary.svelte";
import Backup_Storage from "./content/storage/backup.svelte";
import Data_Storage from "./content/storage/data.svelte";
import Binary_Storage from "./content/storage/binary.svelte";
import Solid_state_Storage from "./content/storage/solid_state.svelte";
import Secondary_Storage from "./content/storage/secondary.svelte";
import Magnetic_Storage from "./content/storage/magnetic.svelte";
import Binary_Peripherals from "./content/peripherals/binary.svelte";
import Mouse_Peripherals from "./content/peripherals/mouse.svelte";
import Keyboard_Peripherals from "./content/peripherals/keyboard.svelte";
import Testing_Peripherals from "./content/peripherals/sub_perphs/testing.svelte";


  const routes = {
    "/with_space/testing": Testing_With space,
"/storage/magnetic_tape": Magnetic_tape_Storage,
"/storage/optical": Optical_Storage,
"/storage/serial": Serial_Storage,
"/storage/direct": Direct_Storage,
"/storage/SSD": Ssd_Storage,
"/storage/hard_disks": Hard_disks_Storage,
"/storage/primary": Primary_Storage,
"/storage/backup": Backup_Storage,
"/storage/data": Data_Storage,
"/storage/binary": Binary_Storage,
"/storage/solid_state": Solid_state_Storage,
"/storage/secondary": Secondary_Storage,
"/storage/magnetic": Magnetic_Storage,
"/peripherals/binary": Binary_Peripherals,
"/peripherals/mouse": Mouse_Peripherals,
"/peripherals/keyboard": Keyboard_Peripherals,
"/peripherals/sub_perphs/testing": Testing_Peripherals,

  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar"> <a href="/with_space" use:link use:active>with space</a><br />
<a href="/storage" use:link use:active>storage</a><br />
<a href="/peripherals" use:link use:active>peripherals</a><br />
 </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
