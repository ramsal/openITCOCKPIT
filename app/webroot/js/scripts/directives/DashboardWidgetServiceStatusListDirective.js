angular.module('openITCOCKPIT').directive('dashboardWidgetServiceStatusListDirective', function($http, $interval, $rootScope, QueryStringService){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_service_status_list.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'parentTabId': '=tabid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.sort = QueryStringService.getValue('sort', '');
            $scope.direction = QueryStringService.getValue('direction', '');

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
                $http.get('/dashboards/widget_service_status_list.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.ready = false;
                    $scope.widget = result.data.service_status_list;

                    $scope.viewPagingInterval = parseInt($scope.widget.paging_interval);
                    $scope.statusListSettings.limit = parseInt($scope.widget.limit);
                    $scope.statusListSettings.paging_interval = parseInt($scope.widget.paging_interval);
                    $scope.paging_autostart = $scope.widget.paging_autostart;

                    $scope.statusListSettings.filter.Servicestatus.acknowledged = $scope.widget.show_acknowledged;
                    $scope.statusListSettings.filter.Servicestatus.downtime = $scope.widget.show_downtime;
                    $scope.statusListSettings.filter.Servicestatus.current_state.unknown = $scope.widget.show_unknown;
                    $scope.statusListSettings.filter.Servicestatus.current_state.critical = $scope.widget.show_critical;
                    $scope.statusListSettings.filter.Servicestatus.current_state.warning = $scope.widget.show_warning;
                    $scope.statusListSettings.filter.Servicestatus.current_state.ok = $scope.widget.show_ok;

                    $scope.statusListSettings.filter.Service.name = $scope.widget.service_name_filter;
                    $scope.statusListSettings.filter.Host.name = $scope.widget.host_name_filter;


                    let widgetheight = $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue;
                    let mobileheight = (widgetheight - 10) * 22;
                    document.getElementById("mobile_table" + $scope.id).style.height = mobileheight + "px";
                    if($scope.currentPage != 1){
                        $scope.currentPage = 1;
                    }else{
                        $scope.loadServices();
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
                    $scope.pagingTimer = $interval($scope.loadPagingServices, parseInt($scope.statusListSettings.paging_interval + '000'));
                }else{
                    $scope.paging_autostart = false;
                }
            };

            $scope.loadPagingServices = function(){
                if($scope.checkAndStopWidget() != true){
                    if($scope.paging.page == $scope.paging.pageCount){
                        if($scope.currentPage != 1){
                            $scope.currentPage = 1;
                        }else{
                            $scope.loadServices();
                        }
                    }
                    if($scope.paging.page < $scope.paging.pageCount){
                        $scope.currentPage = $scope.paging.page + 1;
                    }
                }
            };

            $scope.loadServices = function(){

                let passive = '';
                if($scope.statusListSettings.filter.Servicestatus.passive ^ $scope.statusListSettings.filter.Servicestatus.active){
                    passive = !$scope.statusListSettings.filter.Servicestatus.passive;
                }

                let params = {
                    'angular': true,
                    'sort': $scope.sort,
                    'page': $scope.currentPage,
                    'direction': $scope.direction,
                    'filter[Host.name]': $scope.statusListSettings.filter.Host.name,
                    'filter[Service.servicename]': $scope.statusListSettings.filter.Service.name,
                    'filter[Servicestatus.output]': '',
                    'filter[Servicestatus.current_state][]': $rootScope.currentStateForApi($scope.statusListSettings.filter.Servicestatus.current_state),
                    'filter[Service.keywords]': [],
                    'filter[Servicestatus.problem_has_been_acknowledged]': $scope.statusListSettings.filter.Servicestatus.acknowledged ? "true" : "false",
                    'filter[Servicestatus.scheduled_downtime_depth]': $scope.statusListSettings.filter.Servicestatus.downtime ? "true" : "false",
                    'filter[Servicestatus.active_checks_enabled]': passive,
                    'limit': $scope.statusListSettings.limit
                };

                $http.get("/services/index.json", {
                    params: params
                }).then(function(result){
                    $scope.services = result.data.all_services;
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
                    $scope.loadServices();
                }
            });

            $scope.saveStatuslistSettings = function(){
                if($scope.ready === true){
                    let data = {
                        settings: {
                            limit: $scope.statusListSettings.limit,
                            paging_interval: $scope.statusListSettings.paging_interval.toString(),
                            paging_autostart: $scope.paging_autostart,
                            show_acknowledged: $scope.statusListSettings.filter.Servicestatus.acknowledged ? "1" : "0",
                            show_downtime: $scope.statusListSettings.filter.Servicestatus.downtime ? "1" : "0",
                            show_ok: $scope.statusListSettings.filter.Servicestatus.current_state.ok ? "1" : "0",
                            show_warning: $scope.statusListSettings.filter.Servicestatus.current_state.warning ? "1" : "0",
                            show_critical: $scope.statusListSettings.filter.Servicestatus.current_state.critical ? "1" : "0",
                            show_unknown: $scope.statusListSettings.filter.Servicestatus.current_state.unknown ? "1" : "0",
                            service_name_filter: $scope.statusListSettings.filter.Service.name,
                            host_name_filter: $scope.statusListSettings.filter.Host.name
                        },
                        'widgetId': $scope.id,
                        'widgetTypeId': "10"
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
                        $scope.loadServices();
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

            $scope._callback = $scope.loadServices;

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
