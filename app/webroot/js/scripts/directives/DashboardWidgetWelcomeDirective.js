angular.module('openITCOCKPIT').directive('dashboardWidgetWelcomeDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_welcome.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {};

            $scope.load = function(){
                $http.get('/dashboards/widget_welcome.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.welcome;
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();
        }

    };
});
