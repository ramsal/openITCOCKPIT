angular.module('openITCOCKPIT').directive('dashboardWidgetHostStatusListDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_host_status_list.html',
        scope: {
            'widget-title': '=',
            'widget-id': '=',
            'updateTitle': '&updateTitle'
        },

        controller: function($scope){

            $scope.widget = null;
            $scope.pagingOn = false;


            $scope.statusListSettings = {
                pagingInterval: 0,
                animation: "fadeInUp",
                filter: {
                    Hoststatus: {
                        acknowledged: false,
                        downtime: false,
                        current_state: {
                            unreachable: false,
                            down: false,
                            up: false,
                        }
                    }
                }
            };

            $scope.load = function(){
                $http.get('/dashboards/widget_host_status_list.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.host_status_list;
                    console.log(result.data);
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();


            $scope.startPaging = function(){
                $scope.pagingOn = true;
            };
            $scope.pausePaging = function(){
                $scope.pagingOn = false;
            };

            $scope.toTimeString = function(seconds){
                if(seconds === 0){
                    return "disabled";
                }
                return (new Date(seconds * 60000)).toUTCString().match(/(\d\d:\d\d)/)[0] + " minutes";
            };

            $scope.$watch('statusListSettings.pagingInterval', function(){
                $scope.pagingTimeString = $scope.toTimeString($scope.statusListSettings.pagingInterval);
                if($scope.pagingTimer) $interval.cancel($scope.pagingTimer);
                if($scope.statusListSettings.pagingInterval > 0){
                    //$scope.pagingTimer = $interval($scope.tabRotate, parseInt($scope.statusListSettings.pagingInterval + '000'));
                }
            });

            $scope.$watch('statusListSettings | json', function(){
                let arr = {
                    'settings[animation_interval]': $scope.statusListSettings.pagingInterval,
                    'settings[animation]': $scope.statusListSettings.animation,
                    'settings[show_acknowledged]': $scope.statusListSettings.filter.Hoststatus.acknowledged ? 1 : 0,
                    'settings[show_downtime]': $scope.statusListSettings.filter.Hoststatus.downtime ? 1 : 0,
                    'settings[show_up]': $scope.statusListSettings.filter.Hoststatus.current_state.up ? 1 : 0,
                    'settings[show_down]': $scope.statusListSettings.filter.Hoststatus.current_state.down ? 1 : 0,
                    'settings[show_unreachable]': $scope.statusListSettings.filter.Hoststatus.current_state.unreachable ? 1 : 0,
                    'widgetId': parseInt($scope.id),
                    'widgetTypeId': 9
                };
                console.log(arr);
            });

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
