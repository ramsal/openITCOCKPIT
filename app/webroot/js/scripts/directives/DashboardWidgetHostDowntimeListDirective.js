angular.module('openITCOCKPIT').directive('dashboardWidgetHostDowntimeListDirective', function($http, $interval, QueryStringService){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_host_downtime_list.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'parentTabId': '=tabid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.sort = QueryStringService.getValue('sort', 'DowntimeHost.scheduled_start_time');
            $scope.direction = QueryStringService.getValue('direction', 'desc');

            $scope.widget = null;
            $scope.ready = false;
            $scope.viewPagingInterval = 0;
            $scope.tabId = $scope.parentTabId;
            $scope.currentPage = 1;

            let now = new Date();

            $scope.downtimeListSettings = {
                limit: 0,
                paging_interval: 0,
                filter: {
                    DowntimeHost: {
                        author_name: '',
                        comment_data: '',
                        was_cancelled: false,
                        was_not_cancelled: false
                    },
                    Host: {
                        name: ''
                    },
                    from: date('d.m.Y H:i', now.getTime() / 1000 - (3600 * 24 * 30)),
                    to: date('d.m.Y H:i', now.getTime() / 1000 + (3600 * 24 * 30 * 2)),
                    isRunning: false,
                    hideExpired: true
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
                if($scope.tabId !== $scope.parentTabId){
                    if($scope.pagingTimer){
                        $interval.cancel($scope.pagingTimer);
                    }
                    return true;
                }
                return false;
            };

            $scope.load = function(){

                $http.get('/dashboards/widget_host_downtime_list.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.widget = result.data.host_downtime_list;
                    console.log(result.data);


                    $scope.viewPagingInterval = parseInt($scope.widget.paging_interval);
                    $scope.downtimeListSettings.limit = parseInt($scope.widget.limit);
                    $scope.downtimeListSettings.paging_interval = parseInt($scope.widget.paging_interval);
                    $scope.paging_autostart = $scope.widget.paging_autostart;

                    $scope.downtimeListSettings.filter.Host.name = $scope.widget.host_name_filter;
                    $scope.downtimeListSettings.filter.DowntimeHost.comment_data = $scope.widget.comment_filter;
                    $scope.downtimeListSettings.filter.DowntimeHost.was_cancelled = $scope.widget.show_was_cancelled;
                    $scope.downtimeListSettings.filter.DowntimeHost.was_not_cancelled = $scope.widget.show_was_not_cancelled;
                    $scope.downtimeListSettings.filter.is_running = $scope.widget.show_is_running;
                    $scope.downtimeListSettings.filter.hideExpired = $scope.widget.hide_expired;

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

            $scope.startPaging = function(){
                $scope.paging_autostart = true;
                $scope.saveDowntimeListSettings();
                $scope.doPaging();
            };
            $scope.pausePaging = function(){
                $scope.paging_autostart = false;
                $scope.saveDowntimeListSettings();
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

            $scope.$watch('downtimeListSettings.paging_interval', function(){
                $scope.pagingTimeString = $scope.toTimeString($scope.downtimeListSettings.paging_interval);
                $scope.doPaging();
            });

            $scope.doPaging = function(){
                if($scope.pagingTimer) $interval.cancel($scope.pagingTimer);
                if($scope.downtimeListSettings.paging_interval > 0 && $scope.paging_autostart){
                    $scope.pagingTimer = $interval($scope.loadPagingHosts, parseInt($scope.downtimeListSettings.paging_interval + '000'));
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

                let wasCancelled = '';
                if($scope.downtimeListSettings.filter.DowntimeHost.was_cancelled ^ $scope.downtimeListSettings.filter.DowntimeHost.was_not_cancelled){
                    wasCancelled = $scope.downtimeListSettings.filter.DowntimeHost.was_cancelled === true;
                }
                $http.get("/downtimes/host.json", {
                    params: {
                        'angular': true,
                        'sort': $scope.sort,
                        'page': $scope.currentPage,
                        'direction': $scope.direction,
                        'filter[DowntimeHost.author_name]': $scope.downtimeListSettings.filter.DowntimeHost.author_name,
                        'filter[DowntimeHost.comment_data]': $scope.downtimeListSettings.filter.DowntimeHost.comment_data,
                        'filter[DowntimeHost.was_cancelled]': wasCancelled,
                        'filter[Host.name]': $scope.downtimeListSettings.filter.Host.name,
                        'filter[from]': $scope.downtimeListSettings.filter.from,
                        'filter[to]': $scope.downtimeListSettings.filter.to,
                        'filter[hideExpired]': ($scope.downtimeListSettings.filter.hideExpired == 1),
                        'filter[isRunning]': ($scope.downtimeListSettings.filter.isRunning == 1),
                        'limit': $scope.downtimeListSettings.limit
                    }
                }).then(function(result){
                    $scope.downtimes = result.data.all_host_downtimes;
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

            $scope.saveDowntimeListSettings = function(){
                if($scope.ready === true){
                    let data = {
                        settings: {
                            limit: $scope.downtimeListSettings.limit,
                            paging_interval: $scope.downtimeListSettings.paging_interval.toString(),
                            paging_autostart: $scope.paging_autostart,
                            show_is_running: $scope.downtimeListSettings.filter.isRunning ? "1" : "0",
                            show_was_not_cancelled: $scope.downtimeListSettings.filter.DowntimeHost.was_not_cancelled ? "1" : "0",
                            show_was_cancelled: $scope.downtimeListSettings.filter.DowntimeHost.was_cancelled ? "1" : "0",
                            hide_expired: $scope.downtimeListSettings.filter.hideExpired ? "1" : "0",
                            host_name_filter: $scope.downtimeListSettings.filter.Host.name,
                            comment_filter: $scope.downtimeListSettings.filter.DowntimeHost.comment_data
                        },
                        'widgetId': $scope.id,
                        'widgetTypeId': "5"
                    };

                    $http.post('/dashboards/saveDowntimeListSettings.json?angular=true', data).then(function(result){
                        //console.log(result);
                    });
                }
            };

            $scope.setPage = function(page){
                $scope.currentPage = page;
            };

            $scope.$watch('currentPage', function(){
                if($scope.ready === true){
                    $scope.loadHosts();
                }
            });

            $scope.$watch('downtimeListSettings | json', function(){
                if($scope.ready === true){
                    $scope.saveDowntimeListSettings();

                    if($scope.currentPage != 1){
                        $scope.currentPage = 1;
                    }else{
                        $scope.loadHosts();
                    }
                }
            });

            $scope.savePagingInterval = function(){
                $scope.downtimeListSettings.paging_interval = $scope.viewPagingInterval;
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

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
                                $scope.downtimeListSettings.limit = Math.round((mobileheight - 44) / 35.7);
                            }
                        }
                    });
                }
            });

        }

    };
});
