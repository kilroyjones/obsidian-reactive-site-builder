<script> import { link } from "svelte-spa-router"; </script>
<h1>Serial data access</h1>
<p>In <strong>serial</strong> data <a href="/storage/home" use:link>storage/home</a> devices, data is stored in <strong>sequential</strong> order.</p>
<p><br><center><img src="static/assets/sequentialdatastorage.png"class="img-fluid"></center><br></p>
<p>This approach can be highly effective for use in <a href="/storage/backup" use:link>backup</a> strategies, but is less useful when files need to be accessed randomly as it is in <a href="/storage/direct" use:link>direct</a> storage devices.</p>
<p><a href="//" use:link>Magnetic tape</a> is the <em>only</em> example of a serial data storage device in the syllabus.</p>