angular.module('openITCOCKPIT').directive('serviceStatusDetails', function($http, $interval, $timeout){
    return {
        restrict: 'E',
        templateUrl: '/services/details.html',
        controller: function($scope){

            var graphStart = 0;
            var graphEnd = 0;

            $scope.showServiceDetailsFlashMsg = function(){
                $scope.showFlashSuccess = true;
                $scope.autoRefreshCounter = 5;
                var interval = $interval(function(){
                    $scope.autoRefreshCounter--;
                    if($scope.autoRefreshCounter === 0){
                        $scope.loadServicestatusDetails($scope.currentServiceDetailsId);
                        $interval.cancel(interval);
                        $scope.showFlashSuccess = false;
                    }
                }, 1000);
            };

            $scope.loadServicestatusDetails = function(serviceId){
                $scope.isLoading = true;

                $scope.currentServiceDetailsId = serviceId;

                $http.get("/services/browser/" + serviceId + ".json", {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.mergedService = result.data.mergedService;
                    $scope.host = result.data.host;
                    $scope.tags = $scope.mergedService.Service.tags.split(',');
                    $scope.hoststatus = result.data.hoststatus;
                    $scope.servicestatus = result.data.servicestatus;
                    $scope.servicestatusForIcon = {
                        Servicestatus: $scope.servicestatus
                    };


                    $scope.acknowledgement = result.data.acknowledgement;
                    $scope.downtime = result.data.downtime;

                    $scope.hostAcknowledgement = result.data.hostAcknowledgement;
                    $scope.hostDowntime = result.data.hostDowntime;

                    $scope.canSubmitExternalCommands = result.data.canSubmitExternalCommands;

                    $scope.loadTimezone();

                    if($scope.mergedService.Service.has_graph){
                        loadGraph($scope.host.Host.uuid, $scope.mergedService.Service.uuid);
                    }

                    $timeout(function(){
                        $scope.isLoading = false;
                    }, 500);

                });
            };

            $scope.loadTimezone = function(){
                $http.get("/angular/user_timezone.json", {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.timezone = result.data.timezone;
                });
            };

            $scope.stateIsOk = function(){
                return parseInt($scope.servicestatus.currentState, 10) === 0;
            };

            $scope.stateIsWarning = function(){
                return parseInt($scope.servicestatus.currentState, 10) === 1;
            };

            $scope.stateIsCritical = function(){
                return parseInt($scope.servicestatus.currentState, 10) === 2;
            };

            $scope.stateIsUnknown = function(){
                return parseInt($scope.servicestatus.currentState, 10) === 3;
            };

            $scope.stateIsNotInMonitoring = function(){
                return !$scope.servicestatus.isInMonitoring;
            };

            $scope.getObjectsForExternalCommand = function(){
                return [{
                    Service: {
                        id: $scope.mergedService.Service.id,
                        uuid: $scope.mergedService.Service.uuid,
                        name: $scope.mergedService.Service.name
                    },
                    Host: {
                        id: $scope.host.Host.id,
                        uuid: $scope.host.Host.uuid,
                        name: $scope.host.Host.name,
                        satelliteId: $scope.host.Host.satellite_id
                    }
                }];
            };

            $scope.getObjectForDowntimeDelete = function(){
                var object = {};
                object[$scope.downtime.internalDowntimeId] = $scope.host.Host.name + ' / ' + $scope.mergedService.Service.name;
                return object;
            };

            var loadGraph = function(hostUuid, serviceUuid){
                graphEnd = Math.floor(Date.now() / 1000);
                graphStart = graphEnd - (3600 * 4);

                $http.get('/Graphgenerators/getPerfdataByUuid.json', {
                    params: {
                        angular: true,
                        host_uuid: hostUuid,
                        service_uuid: serviceUuid,
                        start: graphStart,
                        end: graphEnd,
                        jsTimestamp: 1
                    }
                }).then(function(result){
                    $scope.isLoadingGraph = false;
                    renderGraph(result.data.performance_data);
                });
            };

            var initTooltip = function(){
                var previousPoint = null;
                var $graph_data_tooltip = $('#graph_data_tooltip');

                $graph_data_tooltip.css({
                    position: 'absolute',
                    display: 'none',
                    //border: '1px solid #666',
                    'border-top-left-radius': '5px',
                    'border-top-right-radius': '0',
                    'border-bottom-left-radius': '0',
                    'border-bottom-right-radius': '5px',
                    padding: '2px 4px',
                    'background-color': '#f2f2f2',
                    'border-radius': '5px',
                    opacity: 0.9,
                    'box-shadow': '2px 2px 3px #888',
                    transition: 'all 1s',
                    'z-index': 5040
                });

                $('#graphCanvas').bind('plothover', function(event, pos, item){
                    $('#x').text(pos.pageX.toFixed(2));
                    $('#y').text(pos.pageY.toFixed(2));

                    if(item){
                        if(previousPoint != item.dataIndex){
                            previousPoint = item.dataIndex;

                            $('#graph_data_tooltip').hide();

                            var value = item.datapoint[1];
                            if(!isNaN(value) && isFinite(value)){
                                value = value.toFixed(4);
                            }
                            var tooltip_text = value;
                            if(item.series['unit']){
                                tooltip_text += ' ' + item.series.unit;
                            }

                            showTooltip(item.pageX, item.pageY, tooltip_text, item.datapoint[0]);
                        }
                    }else{
                        $("#graph_data_tooltip").hide();
                        previousPoint = null;
                    }
                });
            };

            var showTooltip = function(x, y, contents, timestamp){
                var self = this;
                var $graph_data_tooltip = $('#graph_data_tooltip');

                var fooJS = new Date(timestamp + ($scope.timezone.user_offset * 1000));
                var fixTime = function(value){
                    if(value < 10){
                        return '0' + value;
                    }
                    return value;
                };

                var humanTime = fixTime(fooJS.getUTCDate()) + '.' + fixTime(fooJS.getUTCMonth() + 1) + '.' + fooJS.getUTCFullYear() + ' ' + fixTime(fooJS.getUTCHours()) + ':' + fixTime(fooJS.getUTCMinutes());

                $graph_data_tooltip
                    .html('<i class="fa fa-clock-o"></i> ' + humanTime + '<br /><strong>' + contents + '</strong>')
                    .css({
                        top: y,
                        left: x + 10
                    })
                    .appendTo('body')
                    .fadeIn(200);
            };

            var renderGraph = function(performance_data){
                initTooltip();
                var graph_data = [];
                for(var dsCount in performance_data){
                    //graph_data[dsCount] = [];

                    var gaugeData = [];
                    for(var timestamp in performance_data[dsCount].data){
                        var frontEndTimestamp = (parseInt(timestamp, 10) + ($scope.timezone.user_offset * 1000));
                        gaugeData.push([frontEndTimestamp, performance_data[dsCount].data[timestamp]]);
                    }
                    graph_data.push({
                        label: performance_data[dsCount].datasource.label,
                        data: gaugeData,
                        unit: performance_data[dsCount].datasource.unit
                    });


                    //graph_data.push(performance_data[key].data);
                }

                var GraphDefaultsObj = new GraphDefaults();
                var color_amount = performance_data.length < 3 ? 3 : performance_data.length;
                var colors = GraphDefaultsObj.getColors(color_amount);
                var options = GraphDefaultsObj.getDefaultOptions();
                options.colors = colors.border;
                options.xaxis.tickFormatter = function(val, axis){
                    var fooJS = new Date(val + ($scope.timezone.user_offset * 1000));
                    var fixTime = function(value){
                        if(value < 10){
                            return '0' + value;
                        }
                        return value;
                    };
                    return fixTime(fooJS.getUTCDate()) + '.' + fixTime(fooJS.getUTCMonth() + 1) + '.' + fooJS.getUTCFullYear() + ' ' + fixTime(fooJS.getUTCHours()) + ':' + fixTime(fooJS.getUTCMinutes());
                };
                options.legend = {
                    show: true,
                    noColumns: 3,
                    container: $('#graph_legend') // container (as jQuery object) to put legend in, null means default on top of graph
                };
                options.tooltip = true;
                options.tooltipOpts = {
                    defaultTheme: false
                };
                options.points = {
                    show: false,
                    radius: 1
                };
                options.xaxis.min = graphStart * 1000;
                options.xaxis.max = graphEnd * 1000;

                self.plot = $.plot('#graphCanvas', graph_data, options);
            };

        },

        link: function($scope, element, attr){
            $scope.showServiceStatusDetails = function(serviceId){
                $scope.loadServicestatusDetails(serviceId);
                $('#angularServiceStatusDetailsModal').modal('show');
            };
        }
    };
});
