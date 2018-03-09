import Vue from 'vue'
import Router from 'vue-router'

//Components
import HelloWorld from '@/components/HelloWorld'
import StartScreen from '@/components/StartScreen'
import PlayScreen from '@/components/PlayScreen'

//Global Components
Vue.component('quiz-questions', require('../components/QuizQuestions.vue').default);


Vue.use(Router)

export default new Router({
  routes: [
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
})
