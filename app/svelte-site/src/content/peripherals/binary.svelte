<script>import Quiz from "@/Quiz.svelte";
import { link } from "svelte-spa-router";
</script>
<h1>Another binary</h1>
<p><a href="/with_space/goods" use:link>goods</a>
<Quiz questions={[{'question': 'Which of the following is a duck?', 'answers': [' Beaver', ' Mallard', ' Panda'], 'correct': [0, 1, 0]}, {'question': 'Is a duck an animal', 'answers': [' Nope', ' Yes', ' Maybe'], 'correct': [0, 1, 1]}]}/></p>