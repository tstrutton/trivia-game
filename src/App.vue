<template>
  <div id="app">
    <router-view :playerOne="playerOne" :playerOnePoints="playerOnePoints" :playerTwo="playerTwo" :playerTwoPoints="playerTwoPoints" :questions="questions"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data (){
  	return{
  		playerOne: '',
  		playerTwo: '',
      questions: [],
      playerOnePoints: 0,
      playerTwoPoints: 0,
  	}
  },
  created() {
  	this.$on('DefinePlayers',  (playerOne, playerTwo) => {
  		this.playerOne = playerOne;
  		this.playerTwo = playerTwo;
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
        this.playerOnePoints ++;
      }else if(player == 2){
        this.playerTwoPoints ++;
      }
    });
    this.$on('LoadQuestions', (questions) => {
      //set questions to be all questions
      this.questions = questions;
    });
  	
  }
}
</script>

<style>

</style>
