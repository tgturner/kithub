Gradebook.controller("AssignmentShowCtrl", ["$scope", "course", "assignment", "GPAService", "close", "AssignmentService", "CurveService", "$rootScope", "students", "VisualService", "CourseService", "$timeout", "StudentService", function($scope, course, assignment, GPAService, close, AssignmentService, CurveService, $rootScope, students, VisualService, CourseService, $timeout, StudentService) {

  this.closeModal = function () {
    close(null, 200);
    this.closed = true;
  }


  $scope.failingStudents = {};
  $scope.exceptionalStudents = {};
  $scope.course = course;
  $scope.students = students;
  $scope.assignment = assignment;


  $scope.removePassingStudents = function(passingStudent) {
    for(key in $scope.failingStudents) {
      if (key === passingStudent) {
        delete $scope.failingStudents[key];
      }
    }
  }
  //Go through exceptional students and remove any that are not doing exceptional anymore
  $scope.removeExceptionalStudents = function(notExceptionalStudent) {
    for(key in $scope.exceptionalStudents) {
      if (key === notExceptionalStudent) {
        delete $scope.exceptionalStudents[key];
      }
    }
  }

  $scope.getLengthFailing = function() {
    count = 0;
    for(key in $scope.failingStudents) {
      count ++
    }
    return count;
  }

  $scope.getLengthPassing = function() {
    count = 0;
    for(key in $scope.exceptionalStudents) {
      count ++
    }
    return count;
  }

  $scope.percentScore = function() {
    var percentScore;
    for(var i = 0; i < $scope.assignment.submissions.length; i++) {
      var student;
      var submission = $scope.assignment.submissions[i];
      var rawPercent = (submission.raw_score / assignment.possible_score * 100);
      if(submission.raw_score > -1) {
        if(assignment.flat_curve) {
          percentScore = ((rawPercent + assignment.flat_curve.flat_rate).toFixed(2));
        }
        else if(assignment.linear_curve) {
          percentScore = ((CurveService.linearFormula(assignment.linear_curve, rawPercent)).toFixed(2));
        }
        else {
          percentScore = (rawPercent.toFixed(2));
        }
        for(var j = 0; j < students.length; j ++) {
          if(students[j].id === assignment.submissions[i].student_id) {
            student = students[j];
          }
        }
        var studentName = student.first_name + " " + student.last_name;
        if(percentScore > 90) {
          $scope.exceptionalStudents[studentName] = percentScore + "%";
          $scope.removePassingStudents(studentName);
        }
        else if(percentScore < 90 && percentScore > 60) {
          $scope.removeExceptionalStudents(studentName);
          $scope.removePassingStudents(studentName)
        }
        else if(percentScore < 60 ) {
          $scope.failingStudents[studentName] = percentScore + "%"; 
          $scope.removeExceptionalStudents(studentName)
        }
      }
    }
    
  }

  $scope.notifyAssignment = function(student, score, assignmentName) {
    for(key in $scope.students) {
      if ($scope.students[key].first_name + $scope.students[key].last_name  === 
        student.split(" ").slice(0)[0] + student.split(" ").slice(1)[0]) {
        if(parseInt(score) > 60) {

          StudentService.sendPassAssignment($scope.students[key].id, $scope.course.teacher_id, parseInt(score), assignmentName)
        }
        else {
          StudentService.sendFailAssignment($scope.students[key].id, $scope.course.teacher_id, parseInt(score), assignmentName)
        }
      }
    }
  }
  $scope.percentScore();
  $scope.anyFailingStudents = $scope.getLengthFailing();
  $scope.anyExceptionalStudents = $scope.getLengthPassing();

  $scope.$watch('curve.slideA', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.curve.slideA = Number(newValue);
      $scope.curve.curvedA = $scope.curve.slideA + $scope.curve.rawA;
      $scope.applyLinearCurve();
    }
  });

  $scope.$watch('curve.slideB', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.curve.slideB = Number(newValue);
      $scope.curve.curvedB = $scope.curve.slideB + $scope.curve.rawB;
      $scope.applyLinearCurve();
    }
  });

  $scope.$watch('curve.flatRate', function (newValue, oldValue) {
    if (newValue !== oldValue) {
      $scope.curve.flatRate = Number(newValue);
      $scope.updateData();
    }
  });

  $scope.closed = false;

  $scope.assignment = assignment
  $scope.gpa = {}
  $scope.gpa.raw = GPAService.rawGPA(course, assignment)
  $scope.hasCurve = assignment.has_curve
  $scope.curve = {};
  $scope.editingTitle = false
  $scope.modifyingCurve = false
  $scope.assignmentTitle = assignment.title
  $scope.numStudents = course.students.length
  $scope.students = students;
  $scope.curveAlert = false;
  $scope.initializing = true;

  if ($scope.assignment.flat_curve) {
    $scope.curve.flatRate = $scope.assignment.flat_curve.flat_rate;
  } else {
    $scope.curve.flatRate = 0;
  }

  if ($scope.assignment.linear_curve) {
    _fillLinearCurveEditInputs;
  } else {
    $scope.curve.rawA = 0;
    $scope.curve.rawB = 100;
    $scope.curve.slideA = 0;
    $scope.curve.slideB = 0;
    $scope.curve.curvedA = 0;
    $scope.curve.curvedB = 100;
  }

  $scope.removeAssignment = function(assignment) {
    if(confirm('Are you sure you want to remove that assignment? Each student\'s submissions will also be deleted.')) {
      AssignmentService.removeAssignment(assignment).then(function(removedAssignment) {
        $rootScope.$broadcast("assignment.deleted", removedAssignment);
        $scope.close();
        CourseService.populateCourses();
      })
    }
  }


  var _fillFlatRateEditInput = function() {
    var curve = {}
    angular.copy($scope.assignment.flat_curve, curve)
    $scope.curve.flatRate = curve.flat_rate
  }

  var _fillLinearCurveEditInputs = function() {
    var curve = {}
    angular.copy($scope.assignment.linear_curve, curve)
    $scope.curve.rawA = curve.rawA
    $scope.curve.rawB = curve.rawB
    $scope.curve.curvedA = curve.curvedA
    $scope.curve.curvedB = curve.curvedB
    $scope.curve.slideA = $scope.curve.curvedA - $scope.curve.rawA;
    $scope.curve.slideB = $scope.curve.curvedB - $scope.curve.rawB;
  }

  var _fillCurveEditInputs = function() {
    if ($scope.assignment.flat_curve) {
      _fillFlatRateEditInput()
    } else if ($scope.assignment.linear_curve) {
      _fillLinearCurveEditInputs()
    }
  }

  _fillCurveEditInputs;

  if ($scope.assignment.has_curve ) {
    _fillCurveEditInputs()
    $scope.gpa.real = GPAService.realGPA(course, $scope.assignment)
    $scope.curveApplied = true 
  } else {
    $scope.gpa.real = $scope.gpa.raw
    $scope.curveApplied = false
  }


  (function() {
    var _submissions = []
    _.each(course.students, function(student) {
      _.each(student.submissions, function(submission) {
        if (submission.assignment_id === assignment.id) {
          _submissions.push(submission)
        }
      })
    })
    $scope.numSubmissions = _submissions.length
    $scope.submissions = _submissions
  })()

  var _removeCurve = function() {
    if (assignment.has_curve) {
      CurveService.removeCurve($scope.assignment)
      .then(function(response) {
        console.log("response in controller")
        console.log(response)
        $scope.assignment.has_curve = false
        assignment.has_curve = false
        $scope.assignment.flat_curve = null
        assignment.flat_curve = null
        $scope.assignment.linear_curve = null
        assignment.linear_curve = null
        $scope.assignment.updated_at = response.assignment.updated_at
        assignment.updated_at = response.assignment.updated_at
        $scope.percentScore();
        $scope.anyFailingStudents = $scope.getLengthFailing();
        $scope.anyExceptionalStudents = $scope.getLengthPassing();
        CourseService.populateCourses();
      })
    }
  }

  $scope.editAssignment = function(assignment) {
    AssignmentService.editAssignment(assignment)
    CourseService.populateCourses();
    $rootScope.$broadcast('assignment.edit', assignment);
  }

  $scope.editTitle = function() {
    $scope.editingTitle = true
  }

  $scope.submitTitleEdits = function() {
    // // do stuff with Restangular, then:
      // $scope.assignmentTitle = response.title
      // angular.copy(response, $scope.assignment)
      $scope.editingTitle = false
  }

  $scope.cancelEditTitle = function() {
    $scope.editingTitle = false
    $scope.assignmentTitle = assignment.title
  }

  $scope.close = function(result) {
    close(result, 200)
    $scope.closed = true;
  }

  $scope.addCurve = function() {
    $scope.modifyingCurve = true
    if ($scope.assignment.has_curve) {
      $scope.editingCurve = true
    } 
  }

  // $scope.applyFlatCurve = function() {
  //   $scope.gpa.real = $scope.curve.flatRate + $scope.gpa.raw
  //   $scope.curveApplied = true
  // }

  $scope.applyLinearCurve = function() {
    $scope.gpa.real = _simulateLinearCurve()
    $scope.curveApplied = true
  }

  $scope.resetCurve = function() {
    // $scope.curveApplied = false
    $scope.gpa.real = $scope.gpa.raw
    $scope.curve.flatRate = 0
    $scope.curve.rawA = 0
    $scope.curve.rawB = 100
    $scope.curve.slideA = 0
    $scope.curve.slideB = 0
    _removeCurve();
  }

  var updateFlat = function() {
    if ($scope.assignment.flat_curve) {
      _editFlatCurve();
    } else {
      _applyFlatCurve();
    }
  }

  var updateLinear = function() {
    if ($scope.assignment.linear_curve) {
      _editLinearCurve();
    } else {
      _applyLinearCurve();
    }
  }

  $scope.saveChanges = function() {
    if ($scope.curveType === "Flat") {
      if ($scope.assignment.linear_curve) {
        CurveService.removeLinear($scope.assignment).then(function(){
          $scope.curve.rawA = 0
          $scope.curve.rawB = 100
          $scope.curve.slideA = 0
          $scope.curve.slideB = 0
          $scope.assignment.linear_curve = null
          updateFlat();
        })
      } else {
        updateFlat();
      }
      $scope.gpa.real = $scope.gpa.raw + $scope.curve.flatRate;
    } else if ($scope.curveType === "Linear") {
      if ($scope.assignment.flat_curve) {
        CurveService.removeFlat($scope.assignment).then(function(){
          $scope.curve.flatRate = 0;
          $scope.assignment.flat_curve = null
          updateLinear();
        })
      } else {
        updateLinear();
      }
    } else if (!$scope.curveApplied && $scope.assignment.has_curve) {
      _removeCurve();
    } else if ($scope.editingCurve && $scope.assignment.flat_curve) {
      _editFlatCurve();
    } else if ($scope.editingCurve && $scope.assignment.linear_curve) {
      _editLinearCurve();
    }
  }


  // private 

  var _unchangedLinearCurveInputs = function() {
    return $scope.curve.rawA === $scope.assignment.linear_curve.rawA &&
           $scope.curve.rawB === $scope.assignment.linear_curve.rawB &&
           $scope.curve.curvedA === $scope.assignment.linear_curve.curvedA &&
           $scope.curve.curvedB === $scope.assignment.linear_curve.curvedB
  }

  // var _editFlatCurve = function() {
  //   // do nothing if flatRate hasn't changed
  //   if ($scope.assignment.flat_curve.flat_rate === $scope.curve.flatRate) {
  //     return
  //   // if flatRate has changed to 0, remove the curve
  //   } else if ($scope.curve.flatRate === "0") {
  //     _removeCurve();
  //   // else, CurveService.editFlatCurve($scope.assignment)
  //   } else {
  //     CurveService.editFlatCurve($scope.assignment, $scope.curve.flatRate)
  //     .then(function(response) {
  //       console.log("response in controller")
  //       console.log(response)
  //       $scope.assignment.flat_curve = response
  //       assignment.flat_curve = response // ?
  //       $scope.assignment.updated_at = response.assignment.updated_at
  //       assignment.updated_at = response.assignment.updated_at
  //     })
  //   }
  // }

  var _editLinearCurve = function() {
    // do nothing if inputs haven't changed
    if (_unchangedLinearCurveInputs()) {
      return
    } else {
      CurveService.editLinearCurve($scope.assignment, $scope.curve)
      .then(function(response) {
        console.log("response in controller")
        console.log(response)
        $scope.assignment.linear_curve = response
        assignment.linear_curve = response // ?
        $scope.assignment.updated_at = response.assignment.updated_at
        assignment.updated_at = response.assignment.updated_at
        $scope.percentScore();
        $scope.anyFailingStudents = $scope.getLengthFailing();
        $scope.anyExceptionalStudents = $scope.getLengthPassing();
        CourseService.populateCourses();
      })
    }
  }

  var _updateModal = function(response) {
    console.log("response in controller")
    console.log(response)
    $scope.assignment.has_curve = true
    $scope.assignment.flat_curve = response
    // not sure which is necessary
    // assignment.has_curve = true
    // assignment.flat_curve = response
    $scope.assignment.updated_at = response.assignment.updated_at
    assignment.updated_at = response.assignment.updated_at
    $scope.percentScore();
    $scope.anyFailingStudents = $scope.getLengthFailing();
    $scope.anyExceptionalStudents = $scope.getLengthPassing();
  };

  var _applyFlatCurve = function() {
    CurveService.applyFlatCurve($scope.curve.flatRate, assignment.id)
    .then(function(response) {
      _updateModal(response)
      CourseService.populateCourses();
    })
  };

  var _editFlatCurve = function() {
    CurveService.editFlatCurve(assignment, $scope.curve.flatRate)
    .then(function(response) {
      _updateModal(response)
      CourseService.populateCourses();
    })
  };

  var _applyLinearCurve = function() {
    CurveService.applyLinearCurve($scope.curve, assignment.id)
    .then(function(response) {
      console.log("response in controller")
      console.log(response)
      $scope.assignment.linear_curve = response
      $scope.assignment.has_curve = true
      // not sure if either above or below or both are necessary
      assignment.has_curve = true 
      assignment.linear_curve = response
      $scope.assignment.updated_at = response.assignment.updated_at
      assignment.updated_at = response.assignment.updated_at
      CourseService.populateCourses();
    })
    $scope.percentScore();
    $scope.anyFailingStudents = $scope.getLengthFailing();
    $scope.anyExceptionalStudents = $scope.getLengthPassing();
  }

  var _linearFormula = function(input, rawPercent) {
    return input.curvedA + (((input.curvedB - input.curvedA)/(input.rawB - input.rawA)) * (rawPercent - input.rawA));
  }

  var _averageRealScore = function(submissions) {
    var total = 0;
    _.each(submissions, function(submission) {
      total += submission.real_score
    })
    return total / submissions.length
  }  

  $scope.opts = {
    scales: {
      yAxes: [
        {ticks: {
          beginAtZero: true,
          steps: 10,
          stepValue: 10,
          max: 100
        }}
      ]
    }
  }

  var _scores = VisualService.studentScores(students, assignment)
  var pieScores = _.map(_scores, function(score){return score.percent});
  $scope.barLabels = _.map(_scores, 'name');
  $scope.barData = [_.map(_scores, function(score){
    return score.percent.toFixed(2);
  })];

  $scope.pieDist = VisualService.gradeDistribution(pieScores)
  $scope.colors = ['#4caf50', '#81c784', '#c8e6c9', '#ef9a9a', '#f44336']
  $scope.assignLabels = _.map($scope.pieDist, function(amount, grade){return grade});
  $scope.assignData = _.map($scope.pieDist, function(amount, grade){return amount});

  $scope.pieOpts = {
    legend: { display: true },
    showTooltips: true,
  };

  $scope.updateData = function() {
    $scope.curveApplied = true
    var pieScores = _.map(_scores, function(score){
      return score.percent + $scope.curve.flatRate
    })
    angular.copy([_.map(_scores, function(score){
      var updatedScore = score.percent + $scope.curve.flatRate;
      return updatedScore.toFixed(2);
    })], $scope.barData)
    $scope.pieDist = VisualService.gradeDistribution(pieScores)
    $scope.assignData = _.map($scope.pieDist, function(amount, grade){return amount})
    var _simulatedAssignment = {}
    angular.copy($scope.assignment, _simulatedAssignment)
    _simulatedAssignment.flat_curve = $scope.curve
    _simulatedAssignment.flat_curve.flat_rate = $scope.curve.flatRate
    $scope.gpa.real = GPAService.realGPA(course, _simulatedAssignment)
  }

  var updateScores = function(scores) {
    return _.map(scores, function(score){
      var updatedScore = CurveService.linearFormula($scope.curve, score.percent);
      return updatedScore.toFixed(2);
    })
  }

  var _simulateLinearCurve = function() {
    var newScores = updateScores(_scores)
    angular.copy([newScores], $scope.barData)
    $scope.pieDist = VisualService.gradeDistribution(newScores)
    $scope.assignData = _.map($scope.pieDist, function(amount, grade){return amount})
    var _simulatedAssignment = {}
    angular.copy($scope.assignment, _simulatedAssignment)
    _simulatedAssignment.linear_curve = $scope.curve
    return GPAService.realGPA(course, _simulatedAssignment)
  }

  $scope.alertShow = function() {
    $scope.percentScore();
    $scope.anyFailingStudents = $scope.getLengthFailing();
    $scope.anyExceptionalStudents = $scope.getLengthPassing();
    $scope.curveAlert = true;
    $timeout(function() {
      $scope.curveAlert = false;
    }, 3000)
  }

  $scope.setNotice = function() {
    if ($scope.assignment.flat_curve) {
      return "Flat (" + $scope.assignment.flat_curve.flat_rate + "%)"
    }
    else if ($scope.assignment.linear_curve) {
      return "Linear"
    } else {
      return "None"
    }
  }

  if ($scope.assignment.flat_curve) {
    $scope.updateData();
  } else if ($scope.assignment.linear_curve) {
    $scope.applyLinearCurve();
  }

}])