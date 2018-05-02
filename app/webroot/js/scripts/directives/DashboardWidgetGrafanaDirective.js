angular.module('openITCOCKPIT').directive('dashboardWidgetGrafanaDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_grafana.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {};
            $scope.ready = false;

            $scope.load = function(){

                $http.post('/dashboards/widget_grafana.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){

                    if(result.data.grafana.error){
                        $scope.error = result.data.grafana.error;
                    }

                    $scope.widget = result.data.grafana;

                    let widgetheight = $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue;
                    let mobileheight = (widgetheight * 19.5);
                    if(document.getElementById("grafana-iframe-" + $scope.id)){
                        document.getElementById("grafana-iframe-" + $scope.id).height = mobileheight + "px";
                    }
                    $scope.loadGrafanaDashboard();
                    setTimeout(function(){
                        $scope.ready = true;
                    }, 500);
                });
            };

            $scope.addhttp = function(url){
                if(!/^(?:f|ht)tp?\:\/\//.test(url)){
                    url = "https://" + url;
                }
                return url;
            };

            $scope.loadGrafanaDashboard = function(){
                if($scope.widget.host_id != null){
                    let iframeurl = $scope.widget.GrafanaConfiguration.api_url +
                        "/dashboard/db/" + $scope.widget.GrafanaConfiguration.hostUuid +
                        "?theme=" + $scope.widget.GrafanaConfiguration.dashboard_style + "&kiosk";
                    document.getElementById("grafana-iframe-" + $scope.id).src = $scope.addhttp(iframeurl);
                }
            };

            $scope.saveGrafana = function(){
                $http.post('/dashboards/widget_grafana.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id,
                        'hostId': $scope.widget.host_id
                    }
                }).then(function(result){
                    delete $scope.error;
                    if(result.data.grafana.error){
                        $scope.error = result.data.grafana.error;
                    }
                    $scope.widget = result.data.grafana;
                    $scope.loadGrafanaDashboard();
                });
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

            $scope.$watch('widget.host_id', function(){
                if($scope.widget.host_id != null && $scope.ready == true){
                    $scope.saveGrafana();
                }
            });

            $('.grid-stack').on('change', function(event, items){
                if(Array.isArray(items) && $scope.ready){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            let mobileheight = (item.height * 19.5);
                            if(document.getElementById("grafana-iframe-" + $scope.id)){
                                document.getElementById("grafana-iframe-" + $scope.id).height = mobileheight + "px";
                                //$scope.loadGrafanaDashboard();
                            }
                        }
                    });
                }
            });
        }

    };
});
