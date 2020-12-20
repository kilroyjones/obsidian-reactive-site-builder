<script> import { link } from "svelte-spa-router"; </script><h1>Serial data access</h1>
<p>In <strong>serial</strong> data <a href="/storage" use:link>storage</a> devices, data is stored in <strong>sequential</strong> order.</p>
<p>![[sequentialdatastorage.png]]</p>
<p>This approach can be highly effective for use in <a href="/storage/backup" use:link>backup</a> strategies, but is less useful when files need to be accessed randomly as it is in <a href="/storage/direct" use:link>direct</a> storage devices.</p>
<p>[[Magnetic tape]] is the <em>only</em> example of a serial data storage device in the syllabus.</p>