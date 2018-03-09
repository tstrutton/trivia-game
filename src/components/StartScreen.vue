<template>
  <div class="">
    <h2>Enter Your Names Below To Play</h2>
    <div class="form-group">
      <label>Player 1:</label>
      <input type="text" name="playerOne" v-model="playerOne">
    </div>
    <div class="form-group">
      <label>Player 2:</label>
      <input type="text" name="playerTwo" v-model="playerTwo">
    </div>
    <div :class="{'active': warningActive}" class="warning-box">
      <h2>Please Enter A Name For Each Player</h2>
      
    </div>
    <button class="button" @click="startGame(playerOne,playerTwo)">Start</button>
  </div>
</template>

<script>
export default {
  name: 'StartScreen',
  data() {
    return {
      playerOne: '',
      playerTwo: '',
      warningActive: false,
    }
  },
  methods: {
    startGame: function(playerOne, playerTwo){
      if (playerOne == "" || playerTwo == "") {
        this.warningActive = true;
      }else{
        this.$parent.$emit('DefinePlayers', playerOne, playerTwo);
        this.$router.push('quiz')
      }
      
    }
  },
  created(){
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.warning-box{
  opacity: 0;
  text-align: center;
}

.active{
  opacity: 1;
}


</style>
