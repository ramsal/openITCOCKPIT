angular.module('openITCOCKPIT').directive('dashboardWidgetWelcome', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_welcome.html',
        scope: {
            'widget-title': '=',
            'widget-id': '=',
            'updateTitle': '&updateTitle'
        },
        /*
        update-title="updateWidgetTitle(id,title)"
        */
        controller: function($scope){

            $scope.widget = {};

            $scope.load = function(){
                $http.get('/dashboards/widget_welcome.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.welcome;
                    //console.log($scope.widget);
                });
            };

            $scope.load();

        },

        link: function($scope, element, attr){
            $scope.title = attr.widgetTitle;
            $scope.titleOrig = attr.widgetTitle;
            $scope.id = attr.widgetId;
            //$scope.updateTitle({id: $scope.id, title: $scope.title});
            //console.log($scope.id);


            $scope.$watch('title', function(){
                if($scope.title != $scope.titleOrig && $scope.title){
                    //console.log($scope.title);
                    $scope.titleOrig=$scope.title;
                    $scope.updateTitle({id: $scope.id, title: $scope.title});
                }
            });

        }

    };
});