angular.module('openITCOCKPIT').directive('dashboardWidgetMapDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_map.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'parentTabId': '=tabid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {
                id: null
            };
            $scope.all_maps = [];
            $scope.ready = false;
            $scope.tabId = $scope.parentTabId;

            $scope.checkAndStopWidget = function(){
                if($scope.tabId !== $scope.parentTabId || !document.getElementById($scope.id)){
                    if($scope.valueTimer){
                        $interval.cancel($scope.valueTimer);
                    }
                    return true;
                }
                return false;
            };

            $scope.load = function(){
                $http.get('map_module/maps/index.json', {}).then(function(result){
                    if($scope.all_maps){
                        delete $scope.all_maps;
                    }
                    $scope.all_maps = result.data.all_maps;

                    $http.post('/dashboards/widget_map.json', {
                        params: {
                            'angular': true,
                            'widgetId': $scope.id
                        }
                    }).then(function(result){

                        if(result.data.map.error){
                            $scope.error = result.data.map.error;
                        }

                        $scope.widget = result.data.map;
                        $scope.getMapInterval();

                        let widgetheight = $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue;
                        let mobileheight = (widgetheight * 18.6667);
                        if(document.getElementById("map-iframe-" + $scope.id)){
                            document.getElementById("map-iframe-" + $scope.id).height = mobileheight + "px";
                        }
                        setTimeout(function(){
                            $scope.ready = true;
                        }, 500);
                    });
                });
            };

            $scope.loadMap = function(){    //load or reload map widget content
                if($scope.checkAndStopWidget() !== true && $scope.widget.id != null){
                    document.getElementById("map-iframe-" + $scope.id).src = "/map_module/mapeditors/view/" + $scope.widget.id + "/fullscreen:1/widget:1";
                }
            };

            $scope.getMapInterval = function(){
                if($scope.widget.id != null){
                    $scope.all_maps.forEach(function(map){
                        if(map.Map.id == $scope.widget.id){
                            $scope.widget.refresh_interval = map.Map.refresh_interval;
                            if($scope.valueTimer){
                                $interval.cancel($scope.valueTimer);
                            }
                            $scope.loadMap();
                            $scope.valueTimer = $interval($scope.loadMap, parseInt($scope.widget.refresh_interval));
                        }
                    });
                }
            };

            $scope.saveMap = function(){
                $http.post('/dashboards/widget_map.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id,
                        'mapId': $scope.widget.id
                    }
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

            $scope.$watch('widget.id', function(){
                if($scope.widget.id != null && $scope.ready === true){
                    $scope.saveMap();
                    delete $scope.error;
                    $scope.getMapInterval();
                }
            });

            $('.grid-stack').on('change', function(event, items){
                if(Array.isArray(items) && $scope.ready){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            let mobileheight = (item.height * 18.6667);
                            if(document.getElementById("map-iframe-" + $scope.id)){
                                document.getElementById("map-iframe-" + $scope.id).height = mobileheight + "px";
                                if($scope.valueTimer){
                                    $interval.cancel($scope.valueTimer);
                                }
                                $scope.loadMap();
                                $scope.valueTimer = $interval($scope.loadMap, parseInt($scope.widget.refresh_interval));
                            }
                        }
                    });
                }
            });
        }

    };
});
