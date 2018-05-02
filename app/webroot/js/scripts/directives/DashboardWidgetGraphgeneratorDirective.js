angular.module('openITCOCKPIT').directive('dashboardWidgetGraphgeneratorDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_graphgenerator.html',
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
            $scope.tabId = $scope.parentTabId;
            $scope.perfdata = [];

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
                $http.get('/graphgenerators/listing.json', {}).then(function(result){
                    $scope.all_templates = result.data.all_templates;

                    $http.post('/dashboards/widget_graphgenerator.json', {
                        params: {
                            'angular': true,
                            'widgetId': $scope.id
                        }
                    }).then(function(result){
                        $scope.widget = result.data.graphgenerator;
                        if(result.data.graphgenerator.id){
                            $scope.widget.id = result.data.graphgenerator.id.toString();
                            $scope.origWidgetId = result.data.graphgenerator.id.toString();
                        }else{
                            $scope.widget.id = "0";
                            $scope.origWidgetId = "0";
                        }
                        setTimeout(function(){
                            $scope.getGraphUuids();
                        }, 200);
                    });
                });
            };

            $scope.getGraphUuids = function(){
                if($scope.widget.id != null && $scope.all_templates){
                    $scope.all_templates.forEach(function(graph, index){
                        if(graph.GraphgenTmpl.id == $scope.widget.id){
                            $scope.widget.gconf = {};
                            let serviceUuids = [];
                            $scope.perfdata = [];
                            let host_duration = (graph.GraphgenTmpl.relative_time / 60) / 60;
                            graph.GraphgenTmplConf.forEach(function(gconf, index){
                                $scope.widget.host_uuid = gconf.Service.Host.uuid;
                                if(!$scope.widget.gconf[$scope.widget.host_uuid]){
                                    $scope.widget.gconf[$scope.widget.host_uuid] = [];
                                }
                                $scope.widget.gconf[$scope.widget.host_uuid].push(gconf.Service.uuid);
                                serviceUuids.push(gconf.Service.uuid);
                            });
                            loadGraph($scope.widget.gconf, graph.GraphgenTmplConf, serviceUuids);
                        }
                    });
                }
            };

            $scope.saveGraph = function(){
                $http.post('/dashboards/widget_graphgenerator.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id,
                        'graphId': parseInt($scope.widget.id)
                    }
                });
            };


            let loadGraph = function(gconf, graphgenTmplConf, serviceUuids){
                $scope.isLoadingGraph = true;
                //$scope.widget.gconf['isUpdate'] = false;

                $http.post('/Graphgenerators/fetchGraphData/.json', {
                    host_and_service_uuids: gconf
                }).then(function(result){
                    //console.warn(serviceUuids);

                    let arr = [];
                    //console.log(result.data.rrd_data[0]);
                    for(let i in result.data.rrd_data){     //iterate threw hosts
                        //console.log(result.data.rrd_data[i]);
                        for(let z in result.data.rrd_data[i]){      //iterate threw services in one host
                            //console.log(result.data.rrd_data[i][z]);
                            //console.log("index found");
                            for(let y in result.data.rrd_data[i][z]['xml_data']){   //iterate threw available data options
                                //console.log(result.data.rrd_data[i][z]['xml_data'][y]);
                                let ds = parseInt(result.data.rrd_data[i][z]['xml_data'][y]['ds']); //get array key for "data" value
                                if(graphgenTmplConf[y] && graphgenTmplConf[y].data_sources.indexOf(ds) > 0){   //check if data option in configured to use in graph
                                    arr.push({
                                        'data': result.data.rrd_data[i][z]['data'][ds],
                                        'datasource': result.data.rrd_data[i][z]['xml_data'][y]
                                    });
                                }
                            }
                        }
                    }
                    console.warn(arr);
                    //renderGraph(result.data.rrd_data);
                    renderGraph(arr);
                });
            };

            let initTooltip = function(){
                let previousPoint = null;
                let $graph_data_tooltip = $('#graph_data_tooltip');

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
                    transition: 'all 1s'
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

            let showTooltip = function(x, y, contents, timestamp){
                let self = this;
                let $graph_data_tooltip = $('#graph_data_tooltip');

                let fooJS = new Date(timestamp + ($scope.timezone.server_timezone_offset * 1000));
                let fixTime = function(value){
                    if(value < 10){
                        return '0' + value;
                    }
                    return value;
                };

                let humanTime = fixTime(fooJS.getUTCDate()) + '.' + fixTime(fooJS.getUTCMonth() + 1) + '.' + fooJS.getUTCFullYear() + ' ' + fixTime(fooJS.getUTCHours()) + ':' + fixTime(fooJS.getUTCMinutes());

                $graph_data_tooltip
                    .html('<i class="fa fa-clock-o"></i> ' + humanTime + '<br /><strong>' + contents + '</strong>')
                    .css({
                        top: y,
                        left: x + 10
                    })
                    .appendTo('body')
                    .fadeIn(200);
            };

            let renderGraph = function(performance_data){

                let graph_data = [];
                for(let dsCount in performance_data){
                    graph_data[dsCount] = [];
                    for(let timestamp in performance_data[dsCount].data){
                        // (timestamp*1000) formats timestamp to timestamp in milliseconds for correct time display
                        graph_data[dsCount].push([(timestamp*1000), performance_data[dsCount].data[timestamp]]);
                    }
                    //graph_data.push(performance_data[key].data);
                }
                console.log(graph_data);

                let color_amount = performance_data.length < 3 ? 3 : performance_data.length;
                let color_generator = new ColorGenerator();
                let options = {
                    width: '100%',
                    height: '500px',
                    colors: color_generator.generate(color_amount, 90, 120),
                    legend: false,
                    grid: {
                        hoverable: true,
                        markings: [],
                        borderWidth: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        borderColor: {
                            top: '#CCCCCC'
                        }
                    },
                    tooltip: false,
                    xaxis: {
                        mode: 'time',
                        timeformat: '%d.%m.%y %H:%M:%S', // This is handled by a plugin, if it is used -> jquery.flot.time.js
                        tickFormatter: function(val, axis){
                            let fooJS = new Date(val + ($scope.timezone.server_timezone_offset * 1000));
                            let fixTime = function(value){
                                if(value < 10){
                                    return '0' + value;
                                }
                                return value;
                            };
                            return fixTime(fooJS.getUTCDate()) + '.' + fixTime(fooJS.getUTCMonth() + 1) + '.' + fooJS.getUTCFullYear() + ' ' + fixTime(fooJS.getUTCHours()) + ':' + fixTime(fooJS.getUTCMinutes());
                        }
                    },
                    lines: {
                        show: true,
                        lineWidth: 1,
                        fill: true,
                        steps: 0,
                        fillColor: {
                            colors: [
                                {
                                    opacity: 0.5
                                },
                                {
                                    opacity: 0.3
                                }
                            ]
                        }
                    },
                    points: {
                        show: false,
                        radius: 1
                    },
                    series: {
                        show: true,
                        labelFormatter: function(label, series){
                            // series is the series object for the label
                            return '<a href="#' + label + '">' + label + '</a>';
                        }
                    },
                    selection: {
                        mode: "x"
                    }
                };
                self.plot = $.plot('#graphCanvas', graph_data, options);
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

            $scope.loadTimezone();
            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

            $scope.$watch('widget.id', function(){
                if($scope.widget.id != null && $scope.origWidgetId != $scope.widget.id){
                    $scope.saveGraph();
                    delete $scope.error;
                    $scope.getGraphUuids();
                }
            });
        }

    };
});
