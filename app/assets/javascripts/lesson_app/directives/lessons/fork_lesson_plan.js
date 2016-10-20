Lesson.directive("forkLessonPlan",  [ "LessonService", "$stateParams", "Auth", "$state", 'flash', '$timeout', function(LessonService, $stateParams, Auth, $state, flash, $timeout) {
  return {
    template:"<button class='btn primary-bg-color pull-right' ng-click='forkLesson()'>Fork This Lesson</button>",
    scope: { lesson: "=" },
    restrict: "E",
    link: function(scope) {
      // creates a new copy of the current lesson under the current user with updated version number
      // redirects to new fork
      scope.forkLesson = function() {

        LessonService.getLesson($stateParams.id).then(function(response){

          return Auth.currentUser().then(function(currentUser){
            return LessonService.create( {title: response.title,
                                  content: response.content,
                                  teacher_id: currentUser.id,
                                  hours: response.hours,
                                  version: response.version + 0.1,
                                  forks: 0,
                                  state: response.state,
                                  lesson_type: response.lesson_type,
                                  parent_plan_id: response.id,
                                  subject: response.subject,
                                  grade: response.grade } )

          .then(function(newLesson) {
            $state.go("main.lessons.show", {id: newLesson.id})
            $timeout(function(){
              flash('alert-success', 'Lesson plan forked!') 
            }, 500)
            })
          })
        })

      }
    }
  }
}]);