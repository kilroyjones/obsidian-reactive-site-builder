<script>
  import Quiz from "@/Quiz.svelte";
</script>

<Quiz
  questions={[{ question: 'Which is a duck?', answers: ['Mallard', 'Buffalo'], correct: [1, 0] }, { question: 'Which is a mammal?', answers: ['Mallard', 'Buffalo', 'Egret'], correct: [0, 1, 0] }, { question: 'Which is a person?', answers: ['Mallard', 'Harriet', 'Beatrice', 'Buffalo'], correct: [0, 1, 1, 0] }]} />
