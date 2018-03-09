<template>
  <div id="play-area">

      <div class="scorecard" id="left-scorecard">
        <h2>{{playerOne}}</h2>
        <div class="point" v-for="points in playerOnePoints"></div>
      </div>

      <div class="scorecard" id="right-scorecard">
        <h2>{{playerTwo}}</h2>
        <div class="point" v-for="points in playerTwoPoints"></div>
      </div>

      <quiz-questions :currentQuestion="currentQuestion"></quiz-questions>

      <div id="buttonCon1" class="buttonCon">
        <h2>Player 1</h2>
        <button id="1a" @click="questionGuess('a','1')">A</button>
        <button id="1b" @click="questionGuess('b','1')">B</button>
        <button id="1c" @click="questionGuess('c','1')">C</button>
        <button id="1d" @click="questionGuess('d','1')">D</button>
      </div>

      <div id="buttonCon2" class="buttonCon">
        <h2>Player 2</h2>
        <button id="2a" @click="questionGuess('a','2')">A</button>
        <button id="2b" @click="questionGuess('b','2')">B</button>
        <button id="2c" @click="questionGuess('c','2')">C</button>
        <button id="2d" @click="questionGuess('d','2')">D</button>
      </div>    
  </div>
 
</template>

<script>
export default {
  props: ['playerOne', 'playerTwo', 'answered', 'playerOnePoints','playerTwoPoints'],  
  name: 'PlayScreen',
  data(){
    return{
      questions: '',
      currentQuestion: '0',
      currentId: ''
    }
  },
  created(){
    var vm = this;
    this.$http.get('static/questions.json')
      .then((res) => {
        //console.log(res.data);
        vm.questions = res.data
        this.$parent.$emit('LoadQuestions', vm.questions);
        
        var limit = vm.questions.length;
        var currentId = Math.floor(Math.random()*limit);
        console.log(currentId);
        vm.currentQuestion = vm.questions[currentId];
        vm.currentId = currentId;
      })
  },
  methods: {
    questionGuess: function(e,player){
      var vm = this;
      // console.log(vm.currentQuestion);
      // console.log(vm.currentId);
      
      var correctAnswer = vm.currentQuestion.answer;
      //console.log(player);

      if(e === correctAnswer) {
        alert("CORRECT");
        this.$parent.$emit('Correct', player);
      }else{
        alert("WRONG");
      }
      switchQuestion(vm.currentId);
      console.log(vm.currentId);
      function switchQuestion(currentId){
        
        vm.$parent.$emit('RemoveQuestion', vm.currentId);
        var limit = vm.questions.length;
        currentId = Math.floor(Math.random()*limit);
        console.log(currentId);
        vm.currentQuestion = vm.questions[currentId];
        vm.currentId = currentId;

        console.log(vm.questions);

      }

     

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#play-area{
  height: 100vh;
  width: 100vw;
  position: relative;
  display: flex;
}

.buttonCon{
  position: absolute;
  bottom: 0;
  margin-bottom: 60px;
  text-align: center;

  h2{
    margin-bottom: 10px;
  }

  button{
    &:nth-child(2){
      background: blue;
    }
    &:nth-child(3){
      background: green;
    }
    &:nth-child(4){
      background: yellow;
    }
    &:nth-child(5){
      background: red;
    }
  }
}

#buttonCon1{
  left: 0;
  margin-left: 100px;

}

#buttonCon2{
  right: 0;
  margin-right: 100px;
}

.scorecard{
  position: absolute;
  top: 0;
  width: 250px;
  text-align: center;
  padding: 20px 10px;
  font-size: 1.75em;
}

#left-scorecard{
  left: 0;
}

#right-scorecard{
  right: 0;
}

.point{
  width: 25px;
  height: 25px;
  background: #ccc;
  margin: 10px auto;
  display: block;
  border-radius: 100%;
}

</style>
