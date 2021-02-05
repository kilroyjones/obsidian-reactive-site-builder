<script>import Quiz from "@/Quiz.svelte";
import { link } from "svelte-spa-router";
</script>
<h1>Binary</h1>
<p>Binary code is the fundamental language of the computer, using only two digits (<strong>0s</strong> and <strong>1s</strong>) to represent data in a computer system.</p>
<h2>Bits and bytes</h2>
<p>Each zero or one is called a <strong>bit</strong> (binary digit), which is held in <a href="/storage/home" use:link>storage/home</a> using some form of on/off switch. You can use a form of binary counting to count to 31 on the fingers of one hand.</p>
<p>If your thumb is worth 1, each finger doubles in value: your index finger is worth 2, middle finger is 4, ring finger is 8 and little finger is 16:
<br><center><img src="static/assets/hand.png"class="img-fluid"></center><br></p>
<p>Using this system, we can count from zero (closed fist) to 31 (all fingers outstretched), and each number in-between:</p>
<p><br><center><img src="static/assets/binary counting on fingers.png"class="img-fluid"></center><br></p>
<p>The way that bits are represented is different in <a href="/storage/magnetic" use:link>magnetic</a>, <a href="/storage/optical" use:link>optical</a> and <a href="/storage/solid_state" use:link>solid state</a> storage devices, but the principle remains the same: combinations of 0s and 1s just like the fingers 
Bits can be combined into <strong>strings</strong> that can represent a wide variety of different kinds of data, including:</p>
<h4>Text</h4>
<p>Each letter of the alphabet is <strong>one byte long</strong>, with each letter being represented in binary by eight bits, as follows:</p>
<p>| Letter | Binary   |
|--------|----------|
| A      | 01000001 |
| B      | 01000010 |
| C      | 01000011 |
| D      | 01000100 |</p>