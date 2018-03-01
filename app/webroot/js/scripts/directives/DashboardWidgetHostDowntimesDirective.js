angular.module('openITCOCKPIT').directive('dashboardWidgetHostDowntimesDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_host_downtimes.html',
        scope: {
            'widget-title': '=',
            'widget-id': '=',
            'updateTitle': '&updateTitle'
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
        },

        link: function($scope, element, attr){
            $scope.title = decodeURI(attr.widgetTitle);
            $scope.titleOrig = decodeURI(attr.widgetTitle);
            $scope.id = attr.widgetId;

            $scope.$watch('title', function(){
                if(encodeURI($scope.title) != encodeURI($scope.titleOrig) && $scope.title){
                    $scope.titleOrig = $scope.title;
                    $scope.updateTitle({id: $scope.id, title: encodeURI($scope.title)});
                }
            });

        }

    };
});
