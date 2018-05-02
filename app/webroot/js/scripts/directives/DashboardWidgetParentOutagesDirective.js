angular.module('openITCOCKPIT').directive('dashboardWidgetParentOutagesDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_parent_outages.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {};

            $scope.load = function(){
                $http.get('/dashboards/widget_parent_outages.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.parent_outages;
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();
        }
    };
});
