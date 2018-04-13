angular.module('openITCOCKPIT').directive('dashboardWidgetNoticeDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_notice.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {};
            $scope.ready = false;

            $scope.load = function(){
                $http.get('/dashboards/widget_notice.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.widget = result.data.notice;
                    if(document.getElementById('notice-'+$scope.id)){
                        document.getElementById('notice-'+$scope.id).innerHTML = result.data.notice.notice;
                    }
                    setTimeout(function(){
                        $scope.ready = true;
                    }, 500);
                });
            };

            $scope.saveNotice = function(){

                let data = {
                    widgetId: $scope.id,
                    widgetTypeId: 13,
                    note: $scope.widget.WidgetNotice.note
                };

                $http.post('/dashboards/saveNotice.json?angular=true', data).then(function(result){
                    if(document.getElementById('notice-'+$scope.id)){
                        document.getElementById('notice-'+$scope.id).innerHTML = result.data.notice;
                    }
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

            $scope.$watch('widget.WidgetNotice.note', function(){
                if($scope.ready === true){
                    $scope.saveNotice();
                }
            });
        }

    };
});
