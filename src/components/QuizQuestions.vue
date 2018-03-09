<template>
  <div id="question-container">
    <div id="question">
      <h2>{{currentQuestion.question}}</h2>
    </div>
    
    <div :id="'answer-'+answer.id" class="answer-container" v-for="answer in currentQuestion.answers" :key="answer.id">
      <h3>{{answer.id}}</h3>
      <h4>{{answer.answer}}</h4>
    </div>
  </div>
 
</template>

<script>
export default {
  props: ['currentQuestion'],
  name: 'QuizQuestions',
  data(){
    return {
      correctAnswer: this.currentQuestion.answer,

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

#question-container{
  width: 600px;
  align-self:center;
  margin: 0 auto;

  h2{
    font-size: 2em;
    margin-bottom: 40px;
    text-align: center;
  }
}

.answer-container{
  padding: 20px;
  margin: 20px auto;
  border-radius: 10px;
  height: 50px;
  display: flex;
  align-items: center;
  h3{
    display: block;
    float: left;
    vertical-align: middle;
    width: 10%;
    font-size: 3em;
    line-height: 60px;
    text-transform: uppercase;
  }
  h4{
    display: inline-block;
    width: 85%;
    margin: 0;
    line-height: 25px;
    font-family: 'Gotham-Book';

  }
}

#answer-a{
  background: blue;
}

#answer-b{
  background: green;
}

#answer-c{
  background: yellow;
}

#answer-d{
  background: red;
}


</style>
