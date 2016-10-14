Lesson.controller('QuillShowCtrl', ['$scope', 'QuillService', function($scope, QuillService) {

  $scope.editor = QuillService.editor;

}]);
