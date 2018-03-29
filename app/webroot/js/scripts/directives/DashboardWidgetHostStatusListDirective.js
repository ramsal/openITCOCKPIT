angular.module('openITCOCKPIT').directive('dashboardWidgetHostStatusListDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_host_status_list.html',
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
                        name: null
                    },
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
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.ready = false;
                    $scope.widget = result.data.host_status_list;
                    console.log($scope.widget);

                    $scope.viewPagingInterval = parseInt($scope.widget.animation_interval);
                    $scope.statusListSettings.pagingInterval = parseInt($scope.widget.animation_interval);
                    $scope.statusListSettings.animation = $scope.widget.animation;

                    $scope.statusListSettings.filter.Hoststatus.acknowledged = $scope.widget.show_acknowledged;
                    $scope.statusListSettings.filter.Hoststatus.downtime = $scope.widget.show_downtime;
                    $scope.statusListSettings.filter.Hoststatus.current_state.unreachable = $scope.widget.show_unreachable;
                    $scope.statusListSettings.filter.Hoststatus.current_state.down = $scope.widget.show_down;
                    $scope.statusListSettings.filter.Hoststatus.current_state.up = $scope.widget.show_up;

                    $scope.statusListSettings.filter.Host.name = $scope.widget.show_filter_search;

                    let widgetheight = $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue;
                    let mobileheight = (widgetheight - 10) * 22;
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
                    console.log($scope.statusListSettings.pagingInterval);
                    //$scope.pagingTimer = $interval($scope.tabRotate, parseInt($scope.statusListSettings.pagingInterval + '000'));
                }
            });

            $scope.$watch('statusListSettings | json', function(){
                if($scope.ready === true){
                    let data = {
                        settings: {
                            animation_interval: $scope.statusListSettings.pagingInterval.toString(),
                            animation: $scope.statusListSettings.animation,
                            show_acknowledged: $scope.statusListSettings.filter.Hoststatus.acknowledged ? "1" : "0",
                            show_downtime: $scope.statusListSettings.filter.Hoststatus.downtime ? "1" : "0",
                            show_up: $scope.statusListSettings.filter.Hoststatus.current_state.up ? "1" : "0",
                            show_down: $scope.statusListSettings.filter.Hoststatus.current_state.down ? "1" : "0",
                            show_unreachable: $scope.statusListSettings.filter.Hoststatus.current_state.unreachable ? "1" : "0",
                            show_filter_search: $scope.statusListSettings.filter.Host.name
                        },
                        'widgetId': $scope.id,
                        'widgetTypeId': "9"
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
                            let mobileheight = (item.height - 10) * 22;
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
