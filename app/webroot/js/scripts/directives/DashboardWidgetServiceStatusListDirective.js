angular.module('openITCOCKPIT').directive('dashboardWidgetServiceStatusListDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_service_status_list.html',
        scope: {
            'title': '=',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = null;
            $scope.pagingOn = false;
            $scope.tmpPagingInterval = 0;

            $scope.statusListSettings = {
                pagingInterval: 0,
                animation: "fadeInUp",
                filter: {
                    Host: {
                        name: null,
                    },
                    Service: {
                        name: null,
                    },
                    Servicestatus: {
                        acknowledged: false,
                        downtime: false,
                        current_state: {
                            unknown: false,
                            critical: false,
                            warning: false,
                            ok: false,
                        }
                    }
                }
            };

            $scope.load = function(){
                $http.get('/dashboards/widget_service_status_list.json', {
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

            $scope.$watch('tmpPagingInterval', function(){
                $scope.pagingTimeString = $scope.toTimeString($scope.tmpPagingInterval);
                if($scope.pagingTimer) $interval.cancel($scope.pagingTimer);
                if($scope.tmpPagingInterval > 0){
                    //$scope.pagingTimer = $interval($scope.tabRotate, parseInt($scope.statusListSettings.pagingInterval + '000'));
                }
            });

            $scope.$watch('statusListSettings | json', function(){
                let arr = {
                    'settings[animation_interval]': $scope.statusListSettings.pagingInterval,
                    'settings[animation]': $scope.statusListSettings.animation,
                    'settings[show_acknowledged]': $scope.statusListSettings.filter.Servicestatus.acknowledged ? 1 : 0,
                    'settings[show_downtime]': $scope.statusListSettings.filter.Servicestatus.downtime ? 1 : 0,
                    'settings[show_ok]': $scope.statusListSettings.filter.Servicestatus.current_state.ok ? 1 : 0,
                    'settings[show_warning]': $scope.statusListSettings.filter.Servicestatus.current_state.warning ? 1 : 0,
                    'settings[show_critical]': $scope.statusListSettings.filter.Servicestatus.current_state.critical ? 1 : 0,
                    'settings[show_unknown]': $scope.statusListSettings.filter.Servicestatus.current_state.unknown ? 1 : 0,
                    'widgetId': parseInt($scope.id),
                    'widgetTypeId': 9
                };
                console.log(arr);
            });

            $scope.savePagingInterval = function (){
                $scope.statusListSettings.pagingInterval = $scope.tmpPagingInterval;
            };

            $scope.setAnimation = function (animation){
                $scope.statusListSettings.animation = animation;
            };
        }

    };
});
