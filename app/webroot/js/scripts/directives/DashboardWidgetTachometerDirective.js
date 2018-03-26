angular.module('openITCOCKPIT').directive('dashboardWidgetTachometerDirective', function($http){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_tachometer.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
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
                datasource: false
            };
            $scope.gauge = {};
            $scope.checkinterval = 10;
            $scope.gaugeTitle = 'load1';
            $scope.roundFactor = 1;
            $scope.value = 0;
            $scope.ticks = [];
            $scope.ready = false;

            $scope.load = function(){
                $http.get('/dashboards/widget_tachometer.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    //$scope.widget = result.data.tachometer;
                    $scope.widget = {
                        minval: 50,
                        maxval: 111,
                        warnPercent: 66,
                        critPercent: 90,
                        height: 300,
                        width: 300,
                        datasource: false
                    };
                });
            };

            $scope.convertWidgetData = function(){
                $scope.widget.minval = parseInt($scope.widget.minval);
                $scope.widget.maxval = parseInt($scope.widget.maxval);
                $scope.widget.warnPercent = parseInt($scope.widget.warnPercent);
                $scope.widget.critPercent = parseInt($scope.widget.critPercent);
            };

            $scope.precisionRound = function(number, precision){
                let factor = Math.pow(10, precision);
                return Math.round(number * factor) / factor;
            };

            $scope.calculateTachoData = function(){

                let widgetsize = document.getElementById($scope.id).clientHeight - 63;
                if(document.getElementById($scope.id).clientWidth < document.getElementById($scope.id).clientHeight){
                    widgetsize = document.getElementById($scope.id).clientWidth - 63;
                }
                $scope.widget.height = widgetsize;
                $scope.widget.width = widgetsize;

                $scope.convertWidgetData();
                $scope.ticks = [];
                $scope.gauge.warnBorder = ($scope.widget.maxval / 100) * $scope.widget.warnPercent;
                $scope.gauge.critBorder = ($scope.widget.maxval / 100) * $scope.widget.critPercent;

                let sectorLength = ($scope.widget.maxval - $scope.widget.minval) / 10;
                let currentCount = $scope.widget.minval;

                for(let i = currentCount; i <= $scope.widget.maxval; i = i + sectorLength){
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
                        minValue: $scope.widget.minval,
                        maxValue: $scope.widget.maxval,
                        majorTicks: $scope.ticks,
                        minorTicks: 2,
                        strokeTicks: false,
                        highlights: [
                            {from: $scope.widget.minval, to: $scope.gauge.warnBorder, color: '#449D44'},
                            {from: $scope.gauge.warnBorder, to: $scope.gauge.critBorder, color: '#DF8F1D'},
                            {from: $scope.gauge.critBorder, to: $scope.widget.maxval, color: '#C9302C'}
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
                    return true;
                }
                return false;

            };

            $scope.updateTacho = function(){
                if($scope.rg){
                    $scope.calculateTachoData();
                    $scope.rg.update({
                        title: $scope.gaugeTitle,
                        value: $scope.value,
                        minValue: $scope.widget.minval,
                        maxValue: $scope.widget.maxval,
                        majorTicks: $scope.ticks,
                        highlights: [
                            {from: $scope.widget.minval, to: $scope.gauge.warnBorder, color: '#449D44'},
                            {from: $scope.gauge.warnBorder, to: $scope.gauge.critBorder, color: '#DF8F1D'},
                            {from: $scope.gauge.critBorder, to: $scope.widget.maxval, color: '#C9302C'}
                        ],
                        width: $scope.widget.width,
                        height: $scope.widget.height,
                    });
                }
            };


            angular.element(function(){
                $scope.load();
                $('[data-toggle="tooltip"]').tooltip();

                $scope.$watch('widget.maxval', function(){
                    if(!$scope.rg && $scope.widget.maxval != 0){
                        $scope.ready = false;
                        if($scope.initTacho()){
                            $scope.ready = true;
                        }
                    }
                });

                $scope.$watch('widget | json', function(){
                    if($scope.rg){
                        $scope.convertWidgetData();
                        $scope.updateTacho();
                    }
                });

                $scope.$watch('value', function(){
                    if($scope.rg){
                        $scope.rg.value = parseInt($scope.value);
                    }
                });
            });

            $('.grid-stack').on('change', function(event, items){
                if(items){
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

        }

    };
});
