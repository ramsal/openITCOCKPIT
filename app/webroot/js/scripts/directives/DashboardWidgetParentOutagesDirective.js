angular.module('openITCOCKPIT').directive('dashboardWidgetParentOutagesDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_parent_outages.html',
        scope: {
            'title': '=',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = null;

            $scope.load = function(){
                $http.get('/dashboards/widget_parent_outages.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.parent_outages;
                    console.log(result.data);
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();
        }
    };
});
