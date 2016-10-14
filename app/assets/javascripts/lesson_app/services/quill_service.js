Lesson.factory('QuillService', [function() {
  var editor = new Quill('#editor', {
    theme: 'snow'
  });

  return {
    editor: editor
  }
}]);
