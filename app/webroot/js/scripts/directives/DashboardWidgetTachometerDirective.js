angular.module('openITCOCKPIT').directive('dashboardWidgetTachometerDirective', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_tachometer.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'parentTabId': '=tabid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = {
                minval: 0,
                maxval: 0,
                warnPercent: 0,
                critPercent: 0,
                height: 0,
                width: 0,
                datasource: false,
                serviceId: null,
                tachoId: null,
            };
            $scope.formattedWidget = {
                minval: 0,
                maxval: 0,
                warnPercent: 0,
                critPercent: 0
            };
            $scope.gauge = {};
            $scope.checkinterval = 10;
            $scope.gaugeTitle = '';
            $scope.roundFactor = 1;
            $scope.value = 0;
            $scope.ticks = [];
            $scope.ready = false;
            $scope.datasources = [];
            $scope.unit = '';
            $scope.valueInt = 2;
            $scope.valueDec = 2;
            $scope.tabId = $scope.parentTabId;

            $scope.checkAndStopWidget = function(){
                if($scope.tabId !== $scope.parentTabId){
                    if($scope.valueTimer){
                        $interval.cancel($scope.valueTimer);
                    }
                    return true;
                }
                return false;
            };

            $scope.load = function(){
                $http.get('/dashboards/widget_tachometer.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    //console.log(result.data.tachometer);
                    $scope.widget = {
                        minval: result.data.tachometer.WidgetTacho.min,
                        maxval: result.data.tachometer.WidgetTacho.max,
                        warnPercent: result.data.tachometer.WidgetTacho.warn,
                        critPercent: result.data.tachometer.WidgetTacho.crit,
                        datasource: result.data.tachometer.WidgetTacho.data_source,
                        tachoId: result.data.tachometer.WidgetTacho.id,
                        serviceId: result.data.tachometer.Widget.service_id
                    };

                    $scope.loadServices('');

                });
            };

            $scope.loadServices = function(searchString){
                $http.get("/services/loadServicesByString.json", {
                    params: {
                        'angular': true,
                        'filter[Service.servicename]': searchString,
                        'selected[]': $scope.widget.serviceId
                    }
                }).then(function(result){

                    $scope.services = [];
                    result.data.services.forEach(function(obj, index){
                        $scope.services[index] = {
                            "id": obj.value.Service.id,
                            "group": obj.value.Host.name,
                            "label": obj.value.Host.name + "/" + obj.value.Servicetemplate.name
                        };
                    });

                    $scope.errors = null;
                }, function errorCallback(result){
                    if(result.data.hasOwnProperty('error')){
                        $scope.errors = result.data.error;
                    }
                });
            };

            $scope.convertWidgetData = function(){
                $scope.formattedWidget.minval = parseFloat($scope.widget.minval);
                $scope.formattedWidget.maxval = parseFloat($scope.widget.maxval);
                $scope.formattedWidget.warnPercent = parseFloat($scope.widget.warnPercent);
                $scope.formattedWidget.critPercent = parseFloat($scope.widget.critPercent);
            };


            $scope.IsNumeric = function(val){
                return Number(parseFloat(val)) === val;
            };

            $scope.areWidgetFieldsEmpty = function(){
                if(!$scope.IsNumeric(parseInt($scope.widget.minval))){
                    return true;
                }else if(!$scope.IsNumeric(parseInt($scope.widget.maxval))){
                    return true;
                }else if(!$scope.IsNumeric(parseInt($scope.widget.warnPercent))){
                    return true;
                }else if(!$scope.IsNumeric(parseInt($scope.widget.critPercent))){
                    return true;
                }
                return false;
            };

            $scope.precisionRound = function(number, precision){
                return parseFloat(number).toFixed(precision);
            };

            $scope.calculateTachoData = function(){

                if(document.getElementById($scope.id)){
                    let widgetsize = document.getElementById($scope.id).clientHeight - 63;
                    if(document.getElementById($scope.id).clientWidth < document.getElementById($scope.id).clientHeight){
                        widgetsize = document.getElementById($scope.id).clientWidth - 63;
                    }
                    $scope.widget.height = widgetsize;
                    $scope.widget.width = widgetsize;
                }

                $scope.convertWidgetData();

                $scope.roundFactor = 1;
                if(($scope.formattedWidget.maxval + "").indexOf('.') != -1){
                    $scope.roundFactor = ($scope.formattedWidget.maxval + "").split(".")[1].length + 1;
                }

                $scope.ticks = [];
                $scope.gauge.warnBorder = ($scope.formattedWidget.maxval / 100) * $scope.formattedWidget.warnPercent;
                $scope.gauge.critBorder = ($scope.formattedWidget.maxval / 100) * $scope.formattedWidget.critPercent;

                let sectorLength = ($scope.formattedWidget.maxval - $scope.formattedWidget.minval) / 10;
                let currentCount = $scope.formattedWidget.minval;

                for(let i = currentCount; i <= $scope.formattedWidget.maxval; i = i + sectorLength){
                    currentCount = $scope.precisionRound(i, $scope.roundFactor);
                    $scope.ticks.push(currentCount);
                }

                if($scope.ticks.length == 10){
                    $scope.ticks.push($scope.precisionRound((currentCount + sectorLength), $scope.roundFactor));
                }
            };

            $scope.initTacho = function(){

                if(!$scope.rg && $scope.widget.maxval != 0){
                    $scope.calculateTachoData();
                    $scope.rg = new RadialGauge({
                        renderTo: 'canvas-' + $scope.id,
                        width: $scope.widget.width,
                        height: $scope.widget.width,
                        units: false,
                        title: $scope.gaugeTitle,
                        value: $scope.value,
                        minValue: $scope.formattedWidget.minval,
                        maxValue: $scope.formattedWidget.maxval,
                        majorTicks: $scope.ticks,
                        minorTicks: 2,
                        strokeTicks: false,
                        highlights: [
                            {from: $scope.formattedWidget.minval, to: $scope.gauge.warnBorder, color: '#449D44'},
                            {from: $scope.gauge.warnBorder, to: $scope.gauge.critBorder, color: '#DF8F1D'},
                            {from: $scope.gauge.critBorder, to: $scope.formattedWidget.maxval, color: '#C9302C'}
                        ],
                        colorPlate: '#fff',
                        colorMajorTicks: '#222020',
                        colorMinorTicks: '#222020',
                        colorTitle: '#737373',
                        colorUnits: '#ccc',
                        colorNumbers: '#000000',
                        colorNeedle: '#000000',
                        colorNeedleEnd: '#000000',
                        valueBox: true,
                        animationRule: 'bounce',
                        animationDuration: 500
                    }).draw();
                    $scope.ready = true;
                    return true;
                }
                return false;

            };

            $scope.updateTacho = function(){
                $scope.ready = false;
                if($scope.rg && !$scope.areWidgetFieldsEmpty()){
                    $scope.calculateTachoData();
                    $scope.rg.update({
                        title: $scope.gaugeTitle,
                        value: $scope.value,
                        minValue: $scope.formattedWidget.minval,
                        maxValue: $scope.formattedWidget.maxval,
                        majorTicks: $scope.ticks,
                        highlights: [
                            {from: $scope.formattedWidget.minval, to: $scope.gauge.warnBorder, color: '#449D44'},
                            {from: $scope.gauge.warnBorder, to: $scope.gauge.critBorder, color: '#DF8F1D'},
                            {from: $scope.gauge.critBorder, to: $scope.formattedWidget.maxval, color: '#C9302C'}
                        ],
                        width: $scope.widget.width,
                        height: $scope.widget.height,
                        units: $scope.unit,
                        valueInt: $scope.valueInt,
                        valueDec: $scope.valueDec
                    });

                    let data = {
                        settings: {
                            data_source: "rta",
                            min: $scope.formattedWidget.minval,
                            max: $scope.formattedWidget.maxval,
                            warn: $scope.formattedWidget.warnPercent,
                            crit: $scope.formattedWidget.critPercent,
                            widget_id: $scope.id
                        },
                        service_id: $scope.widget.serviceId,
                        tacho_id: $scope.widget.tachoId  //null value well be create a new entry; else update table entry
                    };

                    $http.post('/dashboards/saveTachoConfig.json?angular=true', data).then(function(result){
                        if(result.data.TachoId){
                            $scope.widget.tachoId = result.data.TachoId;
                        }
                    });

                }
                if(!$scope.rg){
                    $scope.load();
                }
                $scope.ready = true;
            };


            angular.element(function(){
                $scope.load();
                $('[data-toggle="tooltip"]').tooltip();

                $scope.$watch('widget.maxval', function(){
                    if(!$scope.rg && $scope.widget.maxval != 0){
                        $scope.ready = false;
                        $scope.initTacho();
                    }
                });

                $scope.$watch('widget.datasource', function(){
                    if($scope.widget.datasource != null && $scope.perfdata){
                        let key = $scope.widget.datasource;
                        $scope.widget.critPercent = $scope.perfdata[key].crit;
                        $scope.widget.warnPercent = $scope.perfdata[key].warn;
                        $scope.widget.minval = $scope.perfdata[key].min;
                        $scope.widget.maxval = $scope.perfdata[key].max;
                        $scope.value = $scope.perfdata[key].current;
                        $scope.unit = $scope.perfdata[key].unit;
                        $scope.gaugeTitle = key;
                    }
                });


                $scope.fetchPerfdata = function(){
                    if($scope.IsNumeric(parseInt($scope.widget.serviceId)) && $scope.widget.serviceId !== null){
                        if(document.getElementById('canvas-' + $scope.id)){
                            document.getElementById('canvas-' + $scope.id).style.display = "block";
                        }
                        $http.get('/dashboards/getTachoPerfdata/' + $scope.widget.serviceId + '.json', {
                            params: {
                                'angular': true
                            }
                        }).then(function(result){

                            if(result.data.error && result.data.error == 'servicestatus not available'){
                                if($scope.valueTimer){
                                    $interval.cancel($scope.valueTimer);
                                }
                                if($scope.checkAndStopWidget() != true){
                                    $scope.valueTimer = $interval($scope.fetchPerfdata, 15000);
                                }
                                return;
                            }

                            if(result.data.next_check && parseInt(result.data.next_check)){
                                let nextcheckdate = new Date(result.data.next_check * 1000);
                                let msleft = (Date.now() - nextcheckdate);

                                if($scope.valueTimer){
                                    $interval.cancel($scope.valueTimer);
                                }
                                if($scope.checkAndStopWidget() != true){
                                    $scope.valueTimer = $interval($scope.fetchPerfdata, parseInt(Math.abs(msleft) + 7000));
                                }
                            }

                            if(result.data.perfdata){
                                $scope.perfdata = result.data.perfdata;

                                $scope.datasources = [];
                                let i = 0;
                                for(var key in $scope.perfdata){
                                    $scope.datasources[i] = {
                                        'id': key,
                                        'label': key
                                    };
                                    i++
                                }
                                if($scope.widget.datasource){
                                    let key = $scope.widget.datasource;
                                    $scope.value = $scope.perfdata[key].current;
                                    $scope.unit = $scope.perfdata[key].unit;
                                    $scope.gaugeTitle = key;
                                    $scope.valueDec = parseInt((parseFloat($scope.perfdata[key].current) + "").split(".")[1].length);
                                    $scope.valueInt = parseInt((parseFloat($scope.perfdata[key].current) + "").split(".")[0].length);
                                    if($scope.rg && $scope.ready === true){
                                        $scope.updateTacho();
                                    }
                                }
                            }

                        }).catch(function(fallback){
                            if(fallback.data && fallback.data.message && fallback.data.message.toLowerCase().includes('invalid service')){
                                if($scope.valueTimer){
                                    $interval.cancel($scope.valueTimer);
                                }
                                delete $scope.rg;
                                document.getElementById('canvas-' + $scope.id).style.display = "none";
                            }
                        });
                    }
                };

                $scope.$watch('widget.serviceId', function(){
                    if(parseInt($scope.widget.serviceId) > 0){
                        $scope.fetchPerfdata();
                    }else{
                        $scope.widget.datasource = null;
                    }
                });

                $scope.$watch('widget | json', function(){
                    if($scope.rg && $scope.ready === true){
                        $scope.updateTacho();
                    }
                });

                $scope.$watch('value', function(){
                    if($scope.rg){
                        $scope.rg.valueDec = parseInt((parseFloat($scope.value) + "").split(".")[1].length);
                        $scope.rg.valueInt = parseInt((parseFloat($scope.value) + "").split(".")[1].length);
                        $scope.rg.value = parseFloat($scope.value);
                    }
                });
            });

            $('.grid-stack').on('change', function(event, items){
                if(Array.isArray(items)){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            let widgetsize = item.el[0].clientHeight - 63;
                            if(item.el[0].clientWidth < item.el[0].clientHeight){
                                widgetsize = item.el[0].clientWidth - 63;
                            }
                            $scope.widget.height = widgetsize;
                            $scope.widget.width = widgetsize;
                        }
                    });
                }
            });

            $('.grid-stack').on('click', '.jarviswidget-delete-btn', function(){
                let $widget = $(this).closest(".grid-stack-item");
                if($widget[0].attributes['data-gs-id'].nodeValue == $scope.id){
                    if($scope.valueTimer){
                        $interval.cancel($scope.valueTimer);
                    }
                }
            });

        }

    };
});
