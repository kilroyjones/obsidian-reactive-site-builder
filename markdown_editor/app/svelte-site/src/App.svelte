<script>
  import Sidebar from "./Sidebar.svelte";
  import Router from "svelte-spa-router";
  import active from "svelte-spa-router/active";
  import { link } from "svelte-spa-router";
  import Storage from "./content/Storage.svelte";
  import Magnetic_tape_Storage from "./content/storage/Magnetic_tape_Storage.svelte";
  import Optical_Storage from "./content/storage/Optical_Storage.svelte";
  import Serial_Storage from "./content/storage/Serial_Storage.svelte";
  import Direct_Storage from "./content/storage/Direct_Storage.svelte";
  import Ssd_Storage from "./content/storage/Ssd_Storage.svelte";
  import Hard_disks_Storage from "./content/storage/Hard_disks_Storage.svelte";
  import Primary_Storage from "./content/storage/Primary_Storage.svelte";
  import Backup_Storage from "./content/storage/Backup_Storage.svelte";
  import Data_Storage from "./content/storage/Data_Storage.svelte";
  import Binary_Storage from "./content/storage/Binary_Storage.svelte";
  import Solid_state_Storage from "./content/storage/Solid_state_Storage.svelte";
  import Secondary_Storage from "./content/storage/Secondary_Storage.svelte";
  import Magnetic_Storage from "./content/storage/Magnetic_Storage.svelte";

  const routes = {
    "/storage": Storage,
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
  };
</script>

<!-- Sources: https://github.com/sophana/svelte-spa-router-sidebar/tree/master/src -->
<Sidebar>
  <span slot="sidebar">
    <a href="/storage" use:link use:active>Storage</a>
  </span>
  <span slot="content">
    <Router {routes} />
  </span>
</Sidebar>
