angular.module('openITCOCKPIT').directive('dashboardWidgetParentOutages', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_parent_outages.html',
        scope: {
            'widget-title': '=',
            'widget-id': '=',
            'updateTitle': '&updateTitle'
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
        },

        link: function($scope, element, attr){
            $scope.title = attr.widgetTitle;
            $scope.titleOrig = attr.widgetTitle;
            $scope.id = attr.widgetId;

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
