angular.module('openITCOCKPIT').directive('dashboardWidgetHostStatusListDirective', function($http, $interval, $rootScope, QueryStringService){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_host_status_list.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'parentTabId': '=tabid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.sort = QueryStringService.getValue('sort', 'Hoststatus.current_state');
            $scope.direction = QueryStringService.getValue('direction', 'desc');

            $scope.widget = null;
            $scope.ready = false;
            $scope.viewPagingInterval = 0;
            $scope.tabId = $scope.parentTabId;
            $scope.currentPage = 1;

            $scope.statusListSettings = {
                limit: 0,
                paging_interval: 0,
                filter: {
                    Host: {
                        name: null,
                        output: null
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
            $scope.paging_autostart = false;
            $scope.paging = {
                widget: {
                    from: 0,
                    to: 0
                },
                count: 0,
                pageCount: 1
            };

            $scope.checkAndStopWidget = function(){
                if($scope.tabId !== $scope.parentTabId || !document.getElementById($scope.id)){
                    if($scope.pagingTimer){
                        $interval.cancel($scope.pagingTimer);
                    }
                    return true;
                }
                return false;
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

                    $scope.viewPagingInterval = parseInt($scope.widget.paging_interval);
                    $scope.statusListSettings.limit = parseInt($scope.widget.limit);
                    $scope.statusListSettings.paging_interval = parseInt($scope.widget.paging_interval);
                    $scope.paging_autostart = $scope.widget.paging_autostart;

                    $scope.statusListSettings.filter.Hoststatus.acknowledged = $scope.widget.show_acknowledged;
                    $scope.statusListSettings.filter.Hoststatus.downtime = $scope.widget.show_downtime;
                    $scope.statusListSettings.filter.Hoststatus.current_state.unreachable = $scope.widget.show_unreachable;
                    $scope.statusListSettings.filter.Hoststatus.current_state.down = $scope.widget.show_down;
                    $scope.statusListSettings.filter.Hoststatus.current_state.up = $scope.widget.show_up;

                    $scope.statusListSettings.filter.Host.name = $scope.widget.host_name_filter;
                    $scope.statusListSettings.filter.Host.output = $scope.widget.host_output_filter;

                    let widgetheight = $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue;
                    let mobileheight = (widgetheight - 10) * 22;
                    document.getElementById("mobile_table" + $scope.id).style.height = mobileheight + "px";
                    if($scope.currentPage != 1){
                        $scope.currentPage = 1;
                    }else{
                        $scope.loadHosts();
                    }
                    setTimeout(function(){
                        $scope.ready = true;
                    }, 500);
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();


            $scope.startPaging = function(){
                $scope.paging_autostart = true;
                $scope.saveStatuslistSettings();
                $scope.doPaging();
            };
            $scope.pausePaging = function(){
                $scope.paging_autostart = false;
                $scope.saveStatuslistSettings();
                $scope.doPaging();
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

            $scope.$watch('statusListSettings.paging_interval', function(){
                $scope.pagingTimeString = $scope.toTimeString($scope.statusListSettings.paging_interval);
                $scope.doPaging();
            });

            $scope.doPaging = function(){
                if($scope.pagingTimer) $interval.cancel($scope.pagingTimer);
                if($scope.statusListSettings.paging_interval > 0 && $scope.paging_autostart){
                    $scope.pagingTimer = $interval($scope.loadPagingHosts, parseInt($scope.statusListSettings.paging_interval + '000'));
                }else{
                    $scope.paging_autostart = false;
                }
            };

            $scope.loadPagingHosts = function(){
                if($scope.checkAndStopWidget() != true){
                    if($scope.paging.page == $scope.paging.pageCount){
                        if($scope.currentPage != 1){
                            $scope.currentPage = 1;
                        }else{
                            $scope.loadHosts();
                        }
                    }
                    if($scope.paging.page < $scope.paging.pageCount){
                        $scope.currentPage = $scope.paging.page + 1;
                    }
                }
            };

            $scope.loadHosts = function(){

                let params = {
                    'angular': true,
                    'sort': $scope.sort,
                    'page': $scope.currentPage,
                    'direction': $scope.direction,
                    'filter[Host.name]': $scope.statusListSettings.filter.Host.name,
                    'filter[Hoststatus.output]': $scope.statusListSettings.filter.Host.output,
                    'filter[Hoststatus.current_state][]': $rootScope.currentStateForApi($scope.statusListSettings.filter.Hoststatus.current_state),
                    'filter[Host.keywords]': [],
                    'filter[Hoststatus.problem_has_been_acknowledged]': $scope.statusListSettings.filter.Hoststatus.acknowledged ? "true" : "false",
                    'filter[Hoststatus.scheduled_downtime_depth]': $scope.statusListSettings.filter.Hoststatus.downtime ? "true" : "false",
                    'filter[Host.address]': '',
                    'filter[Host.satellite_id]': [],
                    'limit': $scope.statusListSettings.limit
                };

                $http.get("/hosts/index.json", {
                    params: params
                }).then(function(result){
                    $scope.hosts = result.data.all_hosts;
                    $scope.paging = result.data.paging;

                    $scope.paging.widget = {};
                    if($scope.paging.page > 1 && $scope.paging.page < $scope.paging.pageCount){
                        $scope.paging.widget.from = (($scope.paging.current * $scope.paging.page) - $scope.paging.current) + 1;
                    }else if($scope.paging.page == $scope.paging.pageCount){
                        $scope.paging.widget.from = $scope.paging.count - $scope.paging.current;
                    }else{
                        $scope.paging.widget.from = 0;
                        if($scope.paging.pageCount > 0){
                            $scope.paging.widget.from = 1;
                        }
                    }
                    if($scope.paging.pageCount == $scope.paging.page){
                        $scope.paging.widget.from = ($scope.paging.count - $scope.paging.current) + 1;
                    }

                    if($scope.paging.pageCount != $scope.paging.page && ($scope.paging.limit * $scope.paging.page) < $scope.paging.count){
                        $scope.paging.widget.to = $scope.paging.limit * $scope.paging.page;
                    }else{
                        $scope.paging.widget.to = $scope.paging.count;
                    }

                });

            };

            $scope.setPage = function(page){
                $scope.currentPage = page;
            };

            $scope.$watch('currentPage', function(){
                if($scope.ready === true){
                    $scope.loadHosts();
                }
            });

            $scope.saveStatuslistSettings = function(){
                if($scope.ready === true){
                    let data = {
                        settings: {
                            limit: $scope.statusListSettings.limit,
                            paging_interval: $scope.statusListSettings.paging_interval.toString(),
                            paging_autostart: $scope.paging_autostart,
                            show_acknowledged: $scope.statusListSettings.filter.Hoststatus.acknowledged ? "1" : "0",
                            show_downtime: $scope.statusListSettings.filter.Hoststatus.downtime ? "1" : "0",
                            show_up: $scope.statusListSettings.filter.Hoststatus.current_state.up ? "1" : "0",
                            show_down: $scope.statusListSettings.filter.Hoststatus.current_state.down ? "1" : "0",
                            show_unreachable: $scope.statusListSettings.filter.Hoststatus.current_state.unreachable ? "1" : "0",
                            host_name_filter: $scope.statusListSettings.filter.Host.name,
                            host_output_filter: $scope.statusListSettings.filter.Host.output
                        },
                        'widgetId': $scope.id,
                        'widgetTypeId': "9"
                    };

                    $http.post('/dashboards/saveStatuslistSettings.json?angular=true', data).then(function(result){
                        //console.log(result);
                    });
                }
            };

            $scope.$watch('statusListSettings | json', function(){
                if($scope.ready === true){
                    $scope.saveStatuslistSettings();

                    if($scope.currentPage != 1){
                        $scope.currentPage = 1;
                    }else{
                        $scope.loadHosts();
                    }
                }
            });

            $scope.savePagingInterval = function(){
                $scope.statusListSettings.paging_interval = $scope.viewPagingInterval;
            };

            $scope.getSortClass = function(field){
                if(field === $scope.sort){
                    if($scope.direction === 'asc'){
                        return 'fa-sort-asc';
                    }
                    return 'fa-sort-desc';
                }

                return 'fa-sort';
            };

            $scope.triggerCallback = function(){
                if($scope._callback !== null){
                    $scope._callback();
                }
            };

            $scope.orderBy = function(field){
                if(field !== $scope.sort){
                    $scope.direction = 'asc';
                    $scope.sort = field;
                    $scope.triggerCallback();
                    return;
                }

                if($scope.direction === 'asc'){
                    $scope.direction = 'desc';
                }else{
                    $scope.direction = 'asc';
                }
                $scope.triggerCallback();
            };

            $scope._callback = $scope.loadHosts;

            $('.grid-stack').on('change', function(event, items){
                if(Array.isArray(items) && $scope.ready){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            let mobileheight = (item.height - 10) * 22;
                            if(document.getElementById("mobile_table" + $scope.id)){
                                document.getElementById("mobile_table" + $scope.id).style.height = mobileheight + "px";
                            }
                            if(mobileheight > 44){
                                $scope.statusListSettings.limit = Math.round((mobileheight - 44) / 35.7);
                            }
                        }
                    });
                }
            });

        }
    };
});
