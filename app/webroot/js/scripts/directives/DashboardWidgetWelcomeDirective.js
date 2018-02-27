angular.module('openITCOCKPIT').directive('dashboardWidgetWelcomeDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_welcome.html',
        scope: {
            'widget-title': '=',
            'widget-id': '=',
            'updateTitle': '&updateTitle'
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
        },

        link: function($scope, element, attr){
            $scope.title = decodeURI(attr.widgetTitle);
            $scope.titleOrig = decodeURI(attr.widgetTitle);
            $scope.id = attr.widgetId;

            $scope.$watch('title', function(){
                if(encodeURI($scope.title) != encodeURI($scope.titleOrig) && $scope.title){
                    //console.log($scope.title);
                    $scope.titleOrig = $scope.title;
                    $scope.updateTitle({id: $scope.id, title: encodeURI($scope.title)});
                }
            });

        }

    };
});
