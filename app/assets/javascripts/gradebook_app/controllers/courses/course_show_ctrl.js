
Gradebook.controller('CourseShowCtrl', ['$scope', 'course', "StudentService", "AssignmentService", "GPAService", "ModalService", "$state", "CourseService", "SubmissionService", function($scope, course, StudentService, AssignmentService, GPAService, ModalService, $state, CourseService, SubmissionService){


  var cols =[];
  var allRows= [];

  $scope.course = course;

  $scope.rawGPA = GPAService.rawGPA(course)
  $scope.students = $scope.course.students;

  $scope.sortStudents = function() {
    var students = $scope.course.students.sort(function(a,b) {
      var lastNameA = a.last_name
      var lastNameB = b.last_name
      if(lastNameA < lastNameB) {
        return -1;
      }
      if(lastNameB < lastNameA) {
        return 1;
      }
      else {
        return 0;
      }
    })
    return students;
  }

  StudentService.sortSubmissions($scope.course.students);

  $scope.students = $scope.sortStudents();

  var assignments = $scope.course.assignments.sort(function(a,b) {
    var createdAtA = a.id
    var createdAtB = b.id
    if(createdAtA < createdAtB) {
      return -1;
    }
    if(createdAtB < createdAtA) {
      return 1;
    }
    else {
      return 0;
    }
  })

  $scope.assignments = assignments

  $scope.percentScore = function(item, index) {
    if(index > 3 && index < $scope.colCount - 1 && $scope.assignments[index - 4]) {
      return ((item / $scope.assignments[index - 4].possible_score * 100).toFixed(2) + "%")
    }
  }

  $scope.isItemScore = function(item, index) {
    if(index > 3 && index < $scope.colCount - 1) {
      return "(" + item + ")"
    }
    else {
      return item;
    }
  }

  $scope.studentDetailModal = function(email, overall) {
    ModalService.showModal({
      templateUrl: '/gradebook_templates/students/detail.html',
      controller: 'StudentModalCtrl',
      inputs: {
        students: $scope.students,
        email: email,
        assignments: $scope.assignments,
        overall: overall
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close;
    })
  }

  $scope.courseDetailModal = function(gpa) {
    ModalService.showModal({
      templateUrl: '/gradebook_templates/courses/detail.html',
      controller: 'CourseModalCtrl',
      inputs: {
        course: $scope.course,
        assignments: $scope.assignments,
        gpa: gpa,
        students: $scope.students
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close;
    })
  }

  $scope.update = function(title) {
    CourseService.updateCourse({course: {title: title}}, $scope.course)
  }


  for (var i = 0; i < $scope.assignments.length; i++){
      cols.push($scope.assignments[i].title + ": " +
                        $scope.assignments[i].assignment_type
                        + "(" + ($scope.assignments[i].possible_score) +")"  );
  }
  cols.push("Overall")

  var rowData = [];
  for(var j = 0; j < $scope.students.length; j++ ) {
    var rawTotal = 0;
    var possibleTotal = 0;
    rowData.push($scope.students[j].id);
    rowData.push($scope.students[j].first_name);
    rowData.push($scope.students[j].last_name);
    rowData.push($scope.students[j].email);
    for(var i = 0; i < $scope.students[j].submissions.length; i++) {
      var rawScore = $scope.students[j].submissions[i].raw_score;
      var possibleScore = $scope.assignments[i].possible_score;
      //Put default value here;
      if(rawScore === -1) {

      }
      else {
        rawTotal += rawScore;
        possibleTotal += possibleScore;
      }
      rowData.push(rawScore);
    }
    rowData.push(Number(rawTotal / possibleTotal * 100).toFixed(2));
    allRows.push(rowData)
    rowData = []
  }

  $scope.showScore = function(j) {
    $scope.students = StudentService.sortStudents($scope.course.students);
    if (j > -1) {
    var rawTotal = 0;
    var possibleTotal = 0;
    for (var i = 0; i < $scope.assignments.length; i++) {
      var rawScore = $scope.students[j].submissions[i].raw_score;
      var possibleScore = $scope.assignments[i].possible_score;
      //Put default value here;
      if(rawScore === -1) {
      }
      else {
        rawTotal += rawScore;
        possibleTotal += possibleScore;
      }
    }
    return Number(rawTotal / possibleTotal * 100).toFixed(2);
    }
  }
      

  $scope.colCount = $scope.assignments.length + 5;
  $scope.rowCount = $scope.students.length;



  $scope.incrementRow = function(direction){
    if(direction === "up") {
      $scope.rowCount ++;
    }
    else {
      if($scope.rowCount > 0) {
        $scope.rowCount --;
      }
    }
  }

  $scope.submitEdit = function(row, item, index) {
    var rowIndex = $scope.allRows.indexOf(row)
    if(index > 0 && index < 4) {
      var student = $scope.students[rowIndex]
      StudentService.editStudent(student, index, item)
    }
    else if (index > 3 && index < row.length - 1) {
      var submission
      for(var i = 0; i < $scope.students.length; i ++) {
        if($scope.students[i].id == row[0]) {
          var submission = $scope.students[i].submissions[index - 4]
        }
      }
      submission.raw_score = parseInt(item)
      SubmissionService.editSubmission(submission)
    }
    
  }


  $scope.checkItem = function(index, item) {
    console.log(!parseInt(item))
    if (index === 0) {
      return "You cannot update the student's id";
    }
    if(index === 3 && !item.includes("@")) {
      return "Please enter a valid student email";
    }
    else if(index === $scope.colCount - 1) {
      return "You cannot update the overall score. Update specific scores.";
    }
    else if(index > 3 && !(parseInt(item) > -2)) {
      return "The score needs to be a positive number greater than 0";
    }
    else if(index < $scope.colCount - 1) {
      return true;
    }
  }

  $scope.showAssignmentModal = function(assignment) {
    ModalService.showModal({
      templateUrl: "gradebook_templates/assignments/show.html",
      controller: "AssignmentShowCtrl",
      inputs: {
        assignment: assignment,
        course: course,
        students: $scope.students
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(response) {

      })
    })
  }

  $scope.addStudentModal = function(course) {
    ModalService.showModal({
      templateUrl: "gradebook_templates/students/new.html",
      controller: "StudentNewCtrl",
      inputs: {
        course: course
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(response) {

      })
    })
  }

  $scope.addAssignmentModal = function(course) {
    ModalService.showModal({
      templateUrl: "gradebook_templates/assignments/new.html",
      controller: "AssignmentNewCtrl",
      inputs: {
        course: course
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(response) {

      })
    })
  }


  $scope.removeStudentModal = function(course) {
    ModalService.showModal({
      templateUrl: "gradebook_templates/students/destroy.html",
      controller: "StudentDestroyCtrl",
      inputs: {
        course: course
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(response) {
        console.log(response)
      })
    })
  }


  $scope.$on("student.added", function(event, response) {
    var data = StudentService.studentData(response)
    $scope.rowCount ++;
    allRows.push(data);
    $scope.students.push(response);
    CourseService.sortRows($scope.allRows);
  })

  $scope.$on("assignment.edit", function(event, data) {
    var newAssignment = data.assignment_type + ": " + data.title +
                        "(" + data.possible_score + ")"
    for(var i = 0; i < $scope.assignments.length; i++) {
      if($scope.assignments[i].id === data.id) {
        $scope.cols[i] = newAssignment;
      }
    }
  })

  $scope.$on("assignment.added", function(event, data) {
    //Goes through all the students and pushes the newly
    //created blank submissions to the correct student's submissions array 
    for(var i = 0; i < data.submissions.length; i++) {
      for(var j = 0; j < $scope.students.length; j++) {
        if(data.submissions[i].student_id == $scope.students[j].id) {
          $scope.students[j].submissions.push(data.submissions[i]);
        }
      }
    };
    $scope.colCount ++;
    $scope.cols[$scope.cols.length] = data.assignment_type + ": " +
                                          data.title + "(" + data.possible_score
                                         + ")";
    for(var i = 0; i < $scope.allRows.length; i++) {
      //var temp = $scope.allRows[i].slice(-2)[0]
      //$scope.allRows[i][$scope.allRows[i].length - 1] = 0;
      $scope.allRows[i].push(-1);
    };
  })

  $scope.$on("student.deleted", function(event, data) {
    for(var i = 0; i < $scope.allRows.length; i ++) {
      if($scope.allRows[i][0] == data.id) {
        $scope.allRows.splice(i,1);
      }
    }
  })

  $scope.deleteCourse = function() {
    if (confirm('Are you sure?')) {
      CourseService.deleteCourse($scope.course).then(function(response) {
        $state.go("gradebook.courseIndex")
      })
    }
  };

  $scope.cols = cols;
  $scope.allRows = allRows;
  allRows = CourseService.sortRows($scope.allRows);

}])
