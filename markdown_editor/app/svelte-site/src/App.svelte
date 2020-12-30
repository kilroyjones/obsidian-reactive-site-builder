<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
  import With_space from "./content/with_space.svelte";
  import With_space_testing from "./content/with_space/testing.svelte";
  import Storage from "./content/storage.svelte";
  import Storage_magnetic_tape from "./content/storage/magnetic_tape.svelte";
  import Storage_optical from "./content/storage/optical.svelte";
  import Storage_serial from "./content/storage/serial.svelte";
  import Storage_direct from "./content/storage/direct.svelte";
  import Storage_ssd from "./content/storage/SSD.svelte";
  import Storage_hard_disks from "./content/storage/hard_disks.svelte";
  import Storage_primary from "./content/storage/primary.svelte";
  import Storage_backup from "./content/storage/backup.svelte";
  import Storage_data from "./content/storage/data.svelte";
  import Storage_binary from "./content/storage/binary.svelte";
  import Storage_solid_state from "./content/storage/solid_state.svelte";
  import Storage_secondary from "./content/storage/secondary.svelte";
  import Storage_magnetic from "./content/storage/magnetic.svelte";
  import Peripherals from "./content/peripherals.svelte";
  import Peripherals_binary from "./content/peripherals/binary.svelte";
  import Peripherals_mouse from "./content/peripherals/mouse.svelte";
  import Peripherals_keyboard from "./content/peripherals/keyboard.svelte";
  import Peripherals_sub_perphs_testing from "./content/peripherals/sub_perphs/testing.svelte";

  const routes = {
    "/with_space": With_space,
    "/with_space/testing": With_space_testing,
    "/storage": Storage,
    "/storage/magnetic_tape": Storage_magnetic_tape,
    "/storage/optical": Storage_optical,
    "/storage/serial": Storage_serial,
    "/storage/direct": Storage_direct,
    "/storage/SSD": Storage_ssd,
    "/storage/hard_disks": Storage_hard_disks,
    "/storage/primary": Storage_primary,
    "/storage/backup": Storage_backup,
    "/storage/data": Storage_data,
    "/storage/binary": Storage_binary,
    "/storage/solid_state": Storage_solid_state,
    "/storage/secondary": Storage_secondary,
    "/storage/magnetic": Storage_magnetic,
    "/peripherals": Peripherals,
    "/peripherals/binary": Peripherals_binary,
    "/peripherals/mouse": Peripherals_mouse,
    "/peripherals/keyboard": Peripherals_keyboard,
    "/peripherals/sub_perphs/testing": Peripherals_sub_perphs_testing,
  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar">
    <a href="/with_space" use:link use:active>with space</a><br />
    <a href="/storage" use:link use:active>storage</a><br />
    <a href="/peripherals" use:link use:active>peripherals</a><br />
  </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
