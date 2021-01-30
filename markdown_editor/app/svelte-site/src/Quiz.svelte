<script>
  export let questions;
  let active = Array(questions.length).fill(false);
  for (var i = 0; i < questions.length; i++) {
    active[i] = Array(questions[i]["answers"].length).fill("unanswered");
  }

  let correct = 0;
  let incorrect = 0;

  function handleSelect(question_index, answer_index) {
    console.log(questions[question_index]["answers"][answer_index]);
    if (questions[question_index]["correct"][answer_index] == 1) {
      active[question_index][answer_index] = "correct";
      correct += 1;
    } else {
      active[question_index][answer_index] = "incorrect";
      incorrect += 1;
    }
  }
</script>

<style>
  .quiz {
    width: 100;
    align-content: center;
  }
  .btn {
    font-family: "Open sans";
    font-weight: 500;
    border: none;
    width: 100%;
    text-align: left;
  }

  .btn:focus {
    box-shadow: none;
    color: inherit;
  }

  .question {
    max-width: 600px;
    margin-bottom: 10px;
    padding: 10px;
    border: 3px solid #e6e6e6;
  }

  .unanswered {
    background-color: #e6e6e6;
    color: #252525;
  }

  .correct {
    background-color: #a1ae25;
    color: #fff !important;
  }

  .incorrect {
    background-color: #dd6961;
    color: #fff !important;
  }

  .answer {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .data-column {
    padding: 3px;
    margin-right: 10px;
    height: 40px;
    width: 60%;
    text-align: center;
    color: #fff;
    font-weight: bold;
    font-size: 16px;
  }

  .data-row {
    width: 100%;
    padding-top: 5px;
  }
</style>

<div class="container">
  {#each questions as question, question_index}
    <div class="question">
      <h2>{question['question']}</h2>
      {#each question['answers'] as answer, answer_index}
        <div class="answer">
          <button
            class="btn {active[question_index][answer_index]}"
            on:click={() => handleSelect(question_index, answer_index)}>
            {answer}
          </button>
        </div>
      {/each}
    </div>
  {/each}
  <div class="question">
    <div class="row data-row">
      <div class="col-sm-4">
        <div class="data-column correct">{correct}</div>
      </div>
      <div class="col-sm-4 ">
        <div class="data-column incorrect">{incorrect}</div>
      </div>
      <div class="col-sm-4">
        <div class="data-column score">stuff</div>
      </div>
    </div>
  </div>
</div>
