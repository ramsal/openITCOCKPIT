angular.module('openITCOCKPIT').directive('dashboardWidgetHostDowntimesDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_host_downtimes.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = null;

            $scope.load = function(){
                $http.get('/dashboards/widget_host_downtimes.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.host_downtimes;
                    console.log(result.data);
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();
        }

    };
});
