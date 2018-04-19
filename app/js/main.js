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

const TeaserScreen = {
  name: 'TeaserScreen',
  data() {
    return{

    }
  },
  methods: {
    closeTeaser(){
      this.$router.replace('start');
    }
  },
  template: `
  <div id="teaser-screen" @click="closeTeaser">
  <div id="video-container">
    <video id="promoVideo" src="videos/promo.mp4" autoplay loop></video>
  </div>
  </div>`
}

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
        this.$router.replace('tutorial');
        this.gameTimer();
      }
    },
    gameTimer(){
      gameTime = window.setInterval(this.gameClock, 1000);
    },
    gameClock(){
      this.timeElapsed ++;
      this.$parent.$emit('GameTime', this.timeElapsed);
    },
    showLeaderBoard(){
      this.$router.replace('leaderboard');
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
    <button class="button" id="leaderboard-button" @click="showLeaderBoard">View Leaderboard</button>
    </div>
  </div>`
}

const Tutorial = {
  name: 'Tutorial',
  mounted(){
    var teaserVideo = this.$el.querySelector('#teaserVideo');
    teaserVideo.onended = function() {
        router.replace('quiz');
    };
  },
  template: `
  <div id="tutorial-screen">
    <div id="video-container">
      <video id="teaserVideo" src="videos/rules.mp4" autoplay></video>
    </div>
  </div>`
}

const Leaderboard = {
  name: 'Leaderboard',
  data(){
    return{
      leaderboard: []
    }
  },
  mounted(){
    var vm = this;
    var leaderboard = vm.leaderboard;

    var table = vm.$el.querySelector("#leaderboard");
    var tr = [];

    for ( var i = 0, len = localStorage.length; i < len; ++i ) {
      //console.log(localStorage.key(i));
      //console.log( localStorage.getItem( localStorage.key( i ) ) );
      var data = localStorage.getItem(localStorage.key(i));
      var data = JSON.parse(data);

      var keyTime = localStorage.key(i);
      var date = new Date(keyTime*1);
      var date = date.toLocaleString();
      var date = date.slice(-11);
      var entry = {time:date,name:data.name,score:data.score};

      leaderboard.push(entry);
    }

    leaderboard.sort((a, b) => a.score - b.score);
    //console.log(leaderboard);

    //Sort Leaderboard by lowest score at top (shortest time)
    for (var i = 0; i < leaderboard.length; i++) {
      //leaderboard[i]
      var data = leaderboard[i];
      tr[i] = document.createElement('tr');
      var td1 = document.createElement('td');
      var td2 = document.createElement('td');
      var td3 = document.createElement('td');
      td1.innerHTML = data.name;
      td2.innerHTML = data.score;
      td3.innerHTML = data.time;
      tr[i].appendChild(td1);
      tr[i].appendChild(td2);
      tr[i].appendChild(td3);
      table.appendChild(tr[i]);
    }
  },
  methods:{
    backToStart(){
      router.push('start');
    }
  },
  template: `
  <div id="leaderboard-screen">
    <div>
      <button class="button" id="back-button" @click="backToStart">Back</button>
      <h2 id="leaderboard-title">Leaderboard</h2>
      <table id="leaderboard">
        <tr id="table-head">
          <th>Name</th>
          <th>Time</th>
          <th>Date</th>
        </tr>
      </table>
    </div>
  </div>`
}

const PlayScreen = {
  props: ['playerone', 'playertwo', 'answered', 'playeronepoints','playertwopoints','board'],
  name: 'PlayScreen',
  data(){
    return{
      questions: '',
      currentQuestion: '0',
      currentId: '',
      timerLength: '',
      timerSeconds: '',
      correctAnswer: '',
      correctId: '',
      incorrectId: [],
      showVideo: false,
      correct: false,
      incorrect: false,
      timesUp: false,
      winner: false,
      showAnswers: false,
      showQuestion: false,
      showCorrectAnswer: false,
      showTimer: false,
      guessed: [],
      play: false,
    }
  },
  created(){

    var vm = this;
    axios.get('../questions/questions.json')
      .then((res) => {
        vm.questions = res.data
        this.$parent.$emit('LoadQuestions', vm.questions);

        var limit = vm.questions.length;
        var currentId = Math.floor(Math.random()*limit);
        vm.currentQuestion = vm.questions[currentId];
        vm.currentId = currentId;

        //Load the correct answer to show players
        var answers = vm.currentQuestion.answers;
        for (var i = 0; i < answers.length; i++) {
          var answerId = answers[i].id;
          if (answerId === vm.currentQuestion.answer) {
            vm.correctAnswer = answers[i].answer;
            vm.correctId = answerId;
            console.log(vm.correctId+" - "+vm.correctAnswer);
          }else{
            vm.incorrectId.push(answerId);
          }
        }

      })

      // new five.Boards([ "A", "B" ]).on("ready", function() {
      //
      //   //Player One Buttons
      //   var p1b1 = new five.Button({ pin: 8, board: this[0] });
      //   var p1b2 = new five.Button({ pin: 7, board: this[0] });
      //   var p1b3 = new five.Button({ pin: 4, board: this[0] });
      //   var p1b4 = new five.Button({ pin: 2, board: this[0] });
      //
      //   p1b1.on("press", function(){
      //     //console.log("Player 1 Button 1");
      //     vm.questionGuess('a','1');
      //   });
      //   p1b2.on("press", function(){
      //     //console.log("Player 1 Button 2");
      //     vm.questionGuess('b','1');
      //   });
      //   p1b3.on("press", function(){
      //     //console.log("Player 1 Button 3");
      //     vm.questionGuess('c','1');
      //   });
      //   p1b4.on("press", function(){
      //     //console.log("Player 1 Button 4");
      //     vm.questionGuess('d','1');
      //   });
      //
      //   //Player Two Buttons
      //   var p2b1 = new five.Button({ pin: 8, board: this[1] });
      //   var p2b2 = new five.Button({ pin: 7, board: this[1] });
      //   var p2b3 = new five.Button({ pin: 4, board: this[1] });
      //   var p2b4 = new five.Button({ pin: 2, board: this[1] });
      //
      //   p2b1.on("press", function(){
      //     console.log("Player 2 button 1");
      //     vm.questionGuess('a','2');
      //   });
      //   //
      //   p2b2.on("press", function(){
      //     console.log("Player 2 button 2");
      //     vm.questionGuess('b','2');
      //   });
      //   p2b3.on("press", function(){
      //     console.log("Player 2 button 3");
      //     vm.questionGuess('c','2');
      //   });
      //   p2b4.on("press", function(){
      //     console.log("Player 2 button 4");
      //     vm.questionGuess('d','2');
      //   });
      //
      // });


  vm.loadQuestions();

  },
  mounted(){
    var vm = this;

      //Player one buttons
      var p1b1 = new five.Button({ pin: 8, board: this.board[0] });
      var p1b2 = new five.Button({ pin: 7, board: this.board[0] });
      var p1b3 = new five.Button({ pin: 4, board: this.board[0] });
      var p1b4 = new five.Button({ pin: 2, board: this.board[0] });
      //Player two buttons
      var p2b1 = new five.Button({ pin: 8, board: this.board[1] });
      var p2b2 = new five.Button({ pin: 7, board: this.board[1] });
      var p2b3 = new five.Button({ pin: 4, board: this.board[1] });
      var p2b4 = new five.Button({ pin: 2, board: this.board[1] });

      p1b1.on("press", function(){
        //console.log("Player 1 Button 1");
        vm.questionGuess('a','1');
      });
      p1b2.on("press", function(){
        //console.log("Player 1 Button 2");
        vm.questionGuess('b','1');
      });
      p1b3.on("press", function(){
        //console.log("Player 1 Button 3");
        vm.questionGuess('c','1');
      });
      p1b4.on("press", function(){
        //console.log("Player 1 Button 4");
        vm.questionGuess('d','1');
      });

      p2b1.on("press", function(){
        console.log("Player 2 button 1");
        vm.questionGuess('a','2');
      });
      //
      p2b2.on("press", function(){
        console.log("Player 2 button 2");
        vm.questionGuess('b','2');
      });
      p2b3.on("press", function(){
        console.log("Player 2 button 3");
        vm.questionGuess('c','2');
      });
      p2b4.on("press", function(){
        console.log("Player 2 button 4");
        vm.questionGuess('d','2');
      });



  },
  methods: {
    showAnswer(){
      var vm = this;
      this.showCorrectAnswer = true;
      setTimeout(() => vm.showCorrectAnswer = false, 4000);
      setTimeout(() => vm.switchQuestion() , 5000);

    },
    switchQuestion(currentId){
      var vm = this;
      vm.$parent.$emit('RemoveQuestion', vm.currentId);
      var limit = vm.questions.length;
      currentId = Math.floor(Math.random()*limit);
      vm.currentQuestion = vm.questions[currentId];
      vm.currentId = currentId;
      vm.incorrectId = [];

      //Load the correct answer to show players
      var answers = vm.currentQuestion.answers;
      for (var i = 0; i < answers.length; i++) {
        var answerId = answers[i].id;
        if (answerId === vm.currentQuestion.answer) {
          vm.correctAnswer = answers[i].answer;
          vm.correctId = answerId;
          console.log(vm.correctId+" - "+vm.correctAnswer);
        }else{
          vm.incorrectId.push(answerId);
        }
      }
      this.loadQuestions();
    },
    loadQuestions(){
      var vm = this;
      //Give time to load question, then answers, then start the timer
      setTimeout(() => vm.showQuestion = true, 1000);
      setTimeout(() => vm.showAnswers = true, 4000);
      setTimeout(() => vm.showTimer = true, 4600);
      setTimeout(() => vm.startTimer(), 4500);
    },
    questionGuess: function(e,player){
      //Weird Bug console
      //console.log(this);
      var vm = this;
      if (this.play == true) {

        var correctAnswer = vm.currentQuestion.answer;
        var check = vm.guessed.indexOf(player);

        //Only allow players to guess once
        if (check != -1) {
          console.log("Already guessed");
        }else{
          //Only allow questions to be answered when play is true
          if (vm.play == true) {
            this.guessed.push(player);

            if(e === correctAnswer) {
              vm.correctFunction(player);
              vm.showQuestion = false;
              vm.showAnswers = false;
              vm.showTimer = false;
            }else{
              vm.incorrectFunction(player);
            }
          }else{
          }

        }
      }else{
      }
    },
    correctFunction(player){
      this.guessed = [];
      var vm = this;
      this.stopTimer();
      var points;

      if (player === "1") {
        points = this.playeronepoints;
      }else if(player === "2"){
        points = this.playertwopoints;
      }

      this.$parent.$emit('Correct', player);

      if (points === 4) {
        this.$parent.$emit('Winner', player);
        clearInterval(gameTime);
        this.playVideo("winner");
      }else{
        this.resetAnswers();
        this.playVideo("correct");
      }
    },
    incorrectFunction(){
      var vm = this;
      this.stopTimer();

      var check1 = this.guessed.indexOf("1");
      var check2 = this.guessed.indexOf("2");

      if (check1 != -1 && check2 != -1) {
        this.guessed = [];
        this.resetAnswers();
        this.playVideo("bothincorrect");
      }else{
        this.playVideo("incorrect");
      }
    },
    resetAnswers(){
      var vm = this;
      var fixArray = ["a","b","c","d"];
      //Remove the styling for removing answers at times
      for (var i = 0; i < fixArray.length; i++) {
        var id = fixArray[i];
        var containerId = "#answer-"+id;
        var container = vm.$el.querySelector(containerId);
        container.removeAttribute("style");
      }

    },
    playVideo(answer){
      var vm = this;
      this.showVideo = true;

      if (answer === "correct") {
        this.correct = true;

        var correctVideo = this.$el.querySelector('#correctVideo');
        correctVideo.play();
        correctVideo.onended = function() {
            vm.showVideo = false;
            vm.correct = false;
            vm.showAnswer();
            //vm.switchQuestion();
        };

      }else if (answer === "incorrect") {
        this.incorrect = true;

        var incorrectVideo = this.$el.querySelector('#incorrectVideo');
        incorrectVideo.play();
        incorrectVideo.onended = function() {
            vm.showVideo = false;
            vm.incorrect = false;
            vm.resumeTimer();
        };

      }else if(answer === "bothincorrect"){
        this.incorrect = true;
        this.showQuestion = false;
        this.showAnswers = false;
        this.showTimer = false;

        var incorrectVideo = this.$el.querySelector('#incorrectVideo');
        incorrectVideo.play();
        incorrectVideo.onended = function() {
            vm.showVideo = false;
            vm.incorrect = false;
            //vm.switchQuestion();
            vm.showAnswer();
        };
      }else if(answer === "time"){
        //console.log("TIME UP FUNCTION")
        this.timesUp = true;

        var timesUpVideo = this.$el.querySelector('#timesUpVideo');
        timesUpVideo.play();
        this.resetAnswers();
        this.showQuestion = false;
        this.showAnswers = false;
        this.showTimer = false;
        timesUpVideo.onended = function() {
            vm.showVideo = false;
            vm.timesUp = false;
            vm.showAnswer();
            //vm.switchQuestion();
        };
      }else if(answer === "winner"){
        this.winner = true;

        var winnerVideo = this.$el.querySelector('#winnerVideo');
        winnerVideo.play();
        this.showQuestion = false;
        this.showAnswers = false;
        this.showTimer = false;
        winnerVideo.onended = function() {
            vm.showVideo = false;
            vm.timesUp = false;
            vm.$emit.winner
            vm.$destroy();
            vm.$router.replace('gameOver');
        };
      }
    },
    startTimer(){
      //true = questions can be submitted
      this.play = true;
      this.timerLength = 60;

      //Use timer seconds for the visual aspect of timer
      this.timerSeconds = this.timerLength;

      //Set timer to count down every second
      timerObj = window.setInterval(this.timerTick, 1000);
    },
    resumeTimer(){
      this.play = true;
      timerObj = window.setInterval(this.timerTick, 1000);
    },
    stopTimer(){
      //false = questions can not be submitted
      this.play = false;

      //console.log("TIMER STOPPED");
      window.clearInterval(timerObj);
      timerObj = null;
    },
    timerTick(){
      var vm = this;

      function removeWrong(){
        var wrongId = vm.incorrectId;
        var limit = wrongId.length;
        var removeId = Math.floor(Math.random()*limit);
        var removeLetter = wrongId[removeId];

        var containerId = "#answer-"+removeLetter;
        var container = vm.$el.querySelector(containerId);

        container.style.opacity="0";
        wrongId.splice(removeId,1);
      }

      if (this.timerLength === 40) {
        removeWrong();
      }else if(this.timerLength === 20){
        removeWrong();
      }

      if(this.timerLength != 0){
          this.timerLength -= 1;
          this.timerBarWidth();
          this.timerSeconds = this.timerLength;
          this.timerFormat();
      }
      else{
          this.stopTimer();
          this.playVideo("time");
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
            <video id="correctVideo" src="videos/correct.mp4" v-show="correct"></video>
          </transition>
          <transition name="fade">
            <video id="incorrectVideo" src="videos/wrong.mp4" v-show="incorrect"></video>
          </transition>
          <transition name="fade">
            <video id="timesUpVideo" src="videos/timesup.mp4" v-show="timesUp"></video>
          </transition>
          <transition name="fade">
            <video id="winnerVideo" src="videos/winner.mp4" v-show="winner"></video>
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
      <transition name="fade">
        <h2 v-show="showTimer">{{timerSeconds}}</h2>
      </transition>
    </div>

    <!-- Questions Start -->
    <transition name="grow">
    <div id="question-container" v-show="showQuestion">
        <div id="question" >
          <h2>{{currentQuestion.question}}</h2>
        </div>


        <transition-group name="grow">
          <div :id="'answer-'+answer.id" class="answer-container" v-show="showAnswers" v-for="answer in currentQuestion.answers" :key="answer.id">
            <h3>{{answer.id}}</h3>
            <h4>{{answer.answer}}</h4>
            <!-- <h3>{{answer.id}}</h3> -->
          </div>
        </transition-group>


    </div>
    </transition>
    <!-- Questions End -->

    <!-- Correct Answer Start -->
    <transition name="grow">
      <div id="correct-container" v-show="showCorrectAnswer">
        <h2>{{currentQuestion.question}}</h2>
        <h3>{{correctAnswer}}</h3>
      </div>
    </transition>
    <!-- Correct Answer End -->

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

const GameOver = {
  props: ['playerone','playertwo','winner','gametime'],
  name: 'GameOver',
  data(){
    return{
      winnerName: '',
      gametime: '',
    }
  },
  methods: {
    saveScore(){
      var name = this.winnerName;
      var score = this.gametime;

      var score = {name:name, score:score};
      var time = Date.now();

      localStorage.setItem(time, JSON.stringify(score));
      this.$router.replace('leaderboard');
    }

  },
  created(){
    //console.log(this.winner);
    this.$parent.$emit('ResetScore');
    var winner = this.winner;
    if (winner=== "1") {
      this.winnerName = this.playerone;
    }else if(winner === "2"){
      this.winnerName = this.playertwo;
    }
  },

  template: `
  <div id="game-over">
    <div id="game-over-inner">
      <h2>Game Over</h2>
      <h3 id="winner-name">Winner: {{winnerName}}</h3>
      <h3 id="winner-score">Winning Time: {{gametime}} seconds</h3>
      <button class="button" @click="saveScore">Submit Your Score!</button>
    </div>

  </div>`
}

const routes = [
    {
      path: '/',
      name: 'TeaserScreen',
      component: TeaserScreen
    },
    {
      path: '/start',
      name: 'StartScreen',
      component: StartScreen
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      component: Leaderboard
    },
    {
      path: '/tutorial',
      name: 'Tutorial',
      component: Tutorial
    },
    {
      path: '/quiz',
      name: 'PlayOn',
      component: PlayScreen
    },
    {
      path: '/gameOver',
      name: 'GameOver',
      component: GameOver
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
      gametime: 0,
      winner: 0,
      board: ''
    }
  },
  created() {
    //Reset Leaderboard
    // localStorage.clear();
    // console.log(localStorage);

    this.$on('DefinePlayers',  (playerone, playertwo) => {
      this.playerone = playerone;
      this.playertwo = playertwo;
    });
    this.$on('GameTime',  gametime => {
      this.gametime = gametime;
      //console.log(this.gametime);
    });
    this.$on('Winner',  winner => {
      this.winner = winner;
    });
    this.$on('RemoveQuestion', (id) => {
      //Remove the current questions
      this.questions.splice(id,1);
    });
    this.$on('Correct', (player) => {
      if(player == 1) {
        this.playeronepoints ++;
      }else if(player == 2){
        this.playertwopoints ++;
      }
    });
    this.$on('ResetScore', (e) => {
      this.playeronepoints = 0;
      this.playertwopoints = 0;
    });
    this.$on('LoadQuestions', (questions) => {
      //set questions to be all questions
      this.questions = questions;
    });

    this.board = new five.Boards([ "A", "B" ]);
    console.log(this.board);

    // new five.Boards([ "A", "B" ]).on("ready", function() {
    //   //console.log("Board Ready");
    //   // var p1b1 = new five.Button({ pin: 8, board: this[0] });
    //   // var p1b2 = new five.Button({ pin: 7, board: this[0] });
    //   // var p1b3 = new five.Button({ pin: 4, board: this[0] });
    //   // var p1b4 = new five.Button({ pin: 2, board: this[0] });
    //   //
    //   //
    //   // //Player Two Buttons
    //   // var p2b1 = new five.Button({ pin: 8, board: this[1] });
    //   // var p2b2 = new five.Button({ pin: 7, board: this[1] });
    //   // var p2b3 = new five.Button({ pin: 4, board: this[1] });
    //   // var p2b4 = new five.Button({ pin: 2, board: this[1] });
    //
    // });

  },
})
