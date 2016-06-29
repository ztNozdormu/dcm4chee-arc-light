myApp.directive('createDeleteButton2', function($compile) {
    return {
      restrict: 'E',
      scope: {
        part: '@part',
        createText: '@createText',
        deleteText: '@deleteText',
        cloneText: '@cloneText'
      },
      templateUrl: 'templates/device_createDeleteButton2.html'
    };
  });