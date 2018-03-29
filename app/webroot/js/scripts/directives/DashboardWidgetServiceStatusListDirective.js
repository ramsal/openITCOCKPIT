angular.module('openITCOCKPIT').directive('dashboardWidgetServiceStatusListDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_service_status_list.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = null;
            $scope.ready = false;
            $scope.pagingOn = false;
            $scope.viewPagingInterval = 0;

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
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.widget = result.data.service_status_list;
                    console.log($scope.widget);

                    $scope.viewPagingInterval = parseInt($scope.widget.animation_interval);
                    $scope.statusListSettings.pagingInterval = parseInt($scope.widget.animation_interval);
                    $scope.statusListSettings.animation = $scope.widget.animation;

                    $scope.statusListSettings.filter.Servicestatus.acknowledged = $scope.widget.show_acknowledged;
                    $scope.statusListSettings.filter.Servicestatus.downtime = $scope.widget.show_downtime;
                    $scope.statusListSettings.filter.Servicestatus.current_state.unknown = $scope.widget.show_unknown;
                    $scope.statusListSettings.filter.Servicestatus.current_state.critical = $scope.widget.show_critical;
                    $scope.statusListSettings.filter.Servicestatus.current_state.warning = $scope.widget.show_warning;
                    $scope.statusListSettings.filter.Servicestatus.current_state.ok = $scope.widget.show_ok;

                    $scope.statusListSettings.filter.Service.name = $scope.widget.show_filter_search;


                    let widgetheight = $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue;
                    let mobileheight = (widgetheight - 10.5) * 22;
                    document.getElementById("mobile_table" + $scope.id).style.height = mobileheight + "px";
                    setTimeout(function(){
                        $scope.ready = true;
                    }, 500);

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

            $scope.$watch('viewPagingInterval', function(){
                $scope.pagingTimeString = $scope.toTimeString($scope.viewPagingInterval);
            });

            $scope.$watch('statusListSettings.pagingInterval', function(){
                $scope.pagingTimeString = $scope.toTimeString($scope.statusListSettings.pagingInterval);
                if($scope.pagingTimer) $interval.cancel($scope.pagingTimer);
                if($scope.statusListSettings.pagingInterval > 0){
                    //$scope.pagingTimer = $interval($scope.tabRotate, parseInt($scope.statusListSettings.pagingInterval + '000'));

                }
            });

            $scope.$watch('statusListSettings | json', function(){
                if($scope.ready === true){
                    let data = {
                        settings: {
                            animation_interval: $scope.statusListSettings.pagingInterval.toString(),
                            animation: $scope.statusListSettings.animation,
                            show_acknowledged: $scope.statusListSettings.filter.Servicestatus.acknowledged ? "1" : "0",
                            show_downtime: $scope.statusListSettings.filter.Servicestatus.downtime ? "1" : "0",
                            show_ok: $scope.statusListSettings.filter.Servicestatus.current_state.ok ? "1" : "0",
                            show_warning: $scope.statusListSettings.filter.Servicestatus.current_state.warning ? "1" : "0",
                            show_critical: $scope.statusListSettings.filter.Servicestatus.current_state.critical ? "1" : "0",
                            show_unknown: $scope.statusListSettings.filter.Servicestatus.current_state.unknown ? "1" : "0",
                            show_filter_search: $scope.statusListSettings.filter.Service.name
                        },
                        'widgetId': $scope.id,
                        'widgetTypeId': "10"
                    };

                    $http.post('/dashboards/saveStatuslistSettings.json?angular=true', data).then(function(result){
                        //console.log(result);
                    });
                }
            });

            $scope.savePagingInterval = function(){
                $scope.statusListSettings.pagingInterval = $scope.viewPagingInterval;
            };

            $scope.setAnimation = function(animation){
                $scope.statusListSettings.animation = animation;
            };

            $('.grid-stack').on('change', function(event, items){
                if(Array.isArray(items) && $scope.ready){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            //console.log(item.height);
                            let mobileheight = (item.height - 10.5) * 22;
                            //console.log(mobileheight);
                            if(document.getElementById("mobile_table" + $scope.id)){
                                document.getElementById("mobile_table" + $scope.id).style.height = mobileheight + "px";
                            }
                        }
                    });
                }
            });
        }

    };
});
