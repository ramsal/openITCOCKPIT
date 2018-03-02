angular.module('openITCOCKPIT').directive('dashboardWidgetHeaderDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_header.html',
        scope: {
            'title': '=',
            'id': '=',
            'updateTitle': '&',
        },

        controller: function($scope){
            $('[data-toggle="tooltip"]').tooltip();
            $scope.title = decodeURI($scope.title);
            $scope.titleOrig = $scope.title;

            $scope.$watch('title', function(){
                if(encodeURI($scope.title) != encodeURI($scope.titleOrig) && $scope.title){
                    $scope.titleOrig = $scope.title;
                    $scope.updateTitle({id: $scope.id, title: encodeURI($scope.title)});
                }
            });
        },
    };
});
