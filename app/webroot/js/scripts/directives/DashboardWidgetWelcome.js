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
            $('[data-toggle="tooltip"]').tooltip();
        },

        link: function($scope, element, attr){
            $scope.title = attr.widgetTitle;
            $scope.titleOrig = attr.widgetTitle;
            $scope.id = attr.widgetId;
            //$scope.updateTitle({id: $scope.id, title: $scope.title});
            //console.log($scope.id);

            $scope.HtmlEncode = function(s){
                let el = document.createElement("div");
                el.innerText = el.textContent = s;
                s = el.innerHTML;
                return s;
            };

            $scope.$watch('title', function(){
                if($scope.HtmlEncode($scope.title) != $scope.HtmlEncode($scope.titleOrig) && $scope.title){
                    //console.log($scope.title);
                    $scope.titleOrig = $scope.title;
                    $scope.updateTitle({id: $scope.id, title: $scope.HtmlEncode($scope.title)});
                }
            });

        }

    };
});
