var Readable = require('stream').Readable  
var util = require('util')  
var five = require('johnny-five')

util.inherits(MyStream, Readable)  
function MyStream(opt) {  
  Readable.call(this, opt)
}
MyStream.prototype._read = function() {};  
// hook in our stream
process.__defineGetter__('stdin', function() {  
  if (process.__stdin) return process.__stdin
  process.__stdin = new MyStream()
  return process.__stdin
})

var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);
  led.blink(500);
});

const StartScreen = {
  name: 'StartScreen',
  data() {
    return {
      playerone: '',
      playertwo: '',
      warningActive: false,
      timeElapsed: 0,

    }
  },
  methods: {
    startGame: function(playerone, playertwo){
      if (playerone == "" || playertwo == "") {
        this.warningActive = true;
      }else{
        this.$parent.$emit('DefinePlayers', playerone, playertwo);
        this.$router.push('quiz')
        this.gameTimer();
      }
    },
    gameTimer(){      
      console.log("GAME TIMER STARTED");
      gameTime = window.setInterval(this.gameClock, 1000);
    },
    gameClock(){
      this.timeElapsed ++;
      console.log(this.timeElapsed);
    }
  },
  template: `
  <div id="start-screen">
    <div id="name-form">
    <h2 id="name-prompt">Enter Your Names Below To Play</h2>
    <div :class="{'active': warningActive}" class="warning-box">
      <h2>Please Enter A Name For Each Player</h2>
    </div>
    <div class="form-group">
      <label>Player 1:</label>
      <input type="text" name="playerone" v-model="playerone">
    </div><div class="form-group">
      <label>Player 2:</label>
      <input type="text" name="playertwo" v-model="playertwo">
    </div>
    
    <button class="button" id="name-button" @click="startGame(playerone,playertwo)">Start</button>
    </div>
  </div>`
}  

const PlayScreen = {
  props: ['playerone', 'playertwo', 'answered', 'playeronepoints','playertwopoints'],  
  name: 'PlayScreen',
  data(){
    return{
      questions: '',
      currentQuestion: '0',
      currentId: '',
      timerLength: '',
      timerSeconds: '',
      showVideo: false,
      correct: false,
      incorrect: false,
      showAnswers: false,
      showQuestion: false,
      play: false
    }
  },
  created(){
    var vm = this;
    axios.get('../questions/questions.json')
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
    this.loadQuestions();
  },
  methods: {
    loadQuestions(){
      setTimeout(() => this.showQuestion = true, 1000);
      setTimeout(() => this.showAnswers = true, 4000);
      setTimeout(() => this.startTimer(), 4500);
    },
    switchQuestion(currentId){
      var vm = this;
      vm.$parent.$emit('RemoveQuestion', vm.currentId);
      var limit = vm.questions.length;
      currentId = Math.floor(Math.random()*limit);
      vm.currentQuestion = vm.questions[currentId];
      vm.currentId = currentId;

      this.startTimer();
    },
    questionGuess: function(e,player){
      var vm = this;      
      var correctAnswer = vm.currentQuestion.answer;
      var led = new five.Led(13);

      //Only allow questions to be answered when play is true
      if (this.play == true) {
        if(e === correctAnswer) {
          this.correctFunction(player);
        }else{
          this.incorrectFunction(player);
        }
      }else{
        console.log("Cant answer right now.");
      }
    },
    correctFunction(player){
      var vm = this;
      var led = new five.Led(13);
      this.stopTimer();

      console.log("YEAHHH GOOD JOB");
      led.blink(100);
      this.$parent.$emit('Correct', player);
      this.playVideo("correct");
    },
    incorrectFunction(){
      var vm = this;
      var led = new five.Led(13);
      this.stopTimer();

      console.log("YEAHHH GOOD JOB");
      led.blink(10);
      this.playVideo("incorrect");
    },
    timeOut(){
      alert("TIMES UP");
      this.switchQuestion(vm.currentId);
    },
    playVideo(answer){
      var vm = this;
      this.showVideo = true;
      console.log(this.showVideo);

      if (answer === "correct") {
        this.correct = true;
       
        var correctVideo = this.$el.querySelector('#correctVideo');
        correctVideo.play();
        correctVideo.onended = function() {
            vm.showVideo = false;
            vm.correct = false;
            vm.switchQuestion();
        };

      }else if (answer === "incorrect") {
        this.incorrect = true;
       
        var incorrectVideo = this.$el.querySelector('#incorrectVideo');
        incorrectVideo.play();
        incorrectVideo.onended = function() {
            vm.showVideo = false;
            vm.incorrect = false;
            vm.switchQuestion();
        };
      }
    },
    startTimer(){
      //true = questions can be submitted
      this.play = true;
      this.timerLength = 60;
      
      console.log("TIMER STARTED");
      //Use timer seconds for the visual aspect of timer
      this.timerSeconds = this.timerLength;

      //Set timer to count down every second
      timerObj = window.setInterval(this.timerTick, 1000);
    },
    stopTimer(){
      //false = questions can not be submitted
      this.play = false;
      
      console.log("TIMER STOPPED");
      window.clearInterval(timerObj);
      timerObj = null;
    },
    timerTick(){
      //console.log(this.timerSeconds);
      //console.log(this.timerLength);
      if (this.timerLength != 0) {
          this.timerLength -= 1;
          this.timerBarWidth();
          this.timerSeconds = this.timerLength;
          this.timerFormat();
      } else {
          this.stopTimer();
          // Some broadcast stuff to disable answering
      }
    },
    timerFormat(){
      if (this.timerLength < 10) {
        this.timerSeconds = "0"+this.timerLength;
      }
    },
    timerBarWidth(){
      var amount = 100/this.timerseconds;
      this.timerWidth -= amount;
    }
  },

  template: `
  <div id="play-area">

    <transition name="fade">
      <div id="video-container" v-show="showVideo">
          <transition name="fade">
            <video id="correctVideo" src="videos/correct2.mp4" v-show="correct"></video>
          </transition>
          <transition name="fade">
            <video id="incorrectVideo" src="videos/wrong.mp4" v-show="incorrect"></video>
          </transition>
      </div>
    </transition>


    <div class="scorecard" id="left-scorecard">
      <h2>{{playerone}}</h2>
      <div class="point-container">
        <div class="point" v-for="points in playeronepoints"><img src="images/coin_yellow.svg" alt="point icon"></div>
      </div>
    </div>

    <div class="scorecard" id="right-scorecard">
      <h2>{{playertwo}}</h2>
      <div class="point-container">
        <div class="point" v-for="points in playertwopoints"><img src="images/coin_yellow.svg" alt="point icon"></div>
      </div> 
    </div>

    <div id="clock">
      <h2>{{timerSeconds}}</h2>
    </div>

    <!-- Questions Start -->
    <div id="question-container">
      <transition name="grow">
        <div id="question" v-show="showQuestion">
          <h2>{{currentQuestion.question}}</h2>
        </div>
      </transition>
      
      <transition-group name="grow">
        <div :id="'answer-'+answer.id" class="answer-container"  v-show="showAnswers" v-for="answer in currentQuestion.answers" :key="answer.id">
          <h3>{{answer.id}}</h3>
          <h4>{{answer.answer}}</h4>
          <!-- <h3>{{answer.id}}</h3> -->
        </div>
      </transition-group>

    </div>
    <!-- Questions End -->

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

  </div>`
}  

const routes = [
    { 
      path: '/',
      name: 'StartScreen',
      component: StartScreen
    },
    {
      path: '/quiz',
      name: 'PlayOn',
      component: PlayScreen
    }
]

const router = new VueRouter({
    routes
})

new Vue({
  el: '#app',
  router: router,
  data (){
    return{
      playerone: '',
      playertwo: '',
      questions: [],
      playeronepoints: 0,
      playertwopoints: 0,
    }
  },
  created() {
    this.$on('DefinePlayers',  (playerone, playertwo) => {
      this.playerone = playerone;
      this.playertwo = playertwo;
    });
    this.$on('RemoveQuestion', (id) => {
      //console.log(this.questions);
      //Remove the current questions
      this.questions.splice(id,1);
      //console.log(this.questions);
    });
    this.$on('Correct', (player) => {
      console.log("REACHED");
      //console.log(player);
      if(player == 1) {
        this.playeronepoints ++;
      }else if(player == 2){
        this.playertwopoints ++;
      }
    });
    this.$on('LoadQuestions', (questions) => {
      //set questions to be all questions
      this.questions = questions;
    });
    
  },
})

// const rootApp = new Vue({
//   el: '#app',
//   router: router,
//   data (){
//     return{
//       playerOne: '',
//       playerTwo: '',
//       questions: [],
//       playerOnePoints: 0,
//       playerTwoPoints: 0,
//     }
//   },
//   created() {
//     this.$on('DefinePlayers',  (playerOne, playerTwo) => {
//       this.playerOne = playerOne;
//       this.playerTwo = playerTwo;
//     });
//     this.$on('RemoveQuestion', (id) => {
//       //console.log(this.questions);
//       //Remove the current questions
//       this.questions.splice(id,1);
//       //console.log(this.questions);
//     });
//     this.$on('Correct', (player) => {
//       console.log("REACHED");
//       //console.log(player);
//       if(player == 1) {
//         this.playerOnePoints ++;
//       }else if(player == 2){
//         this.playerTwoPoints ++;
//       }
//     });
//     this.$on('LoadQuestions', (questions) => {
//       //set questions to be all questions
//       this.questions = questions;
//     });
    
//   }
// })


/*Vue.component('quiz-questions', {
  props: ['currentQuestion'],
  name: 'QuizQuestions',
  data(){
    return {
      correctAnswer: this.currentQuestion.answer,
    }
  },
  template: `
    <div id="question-container">
      <div id="question">
        <h2>{{currentQuestion.question}}</h2>
      </div>
      
      <div :id="'answer-'+answer.id" class="answer-container" v-for="answer in currentQuestion.answers" :key="answer.id">
        <h3>{{answer.id}}</h3>
        <h4>{{answer.answer}}</h4>
      </div>
    </div>
  `
})*/




 