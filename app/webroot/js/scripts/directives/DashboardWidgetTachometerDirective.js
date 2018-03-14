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

            $scope.widget = {};
            $scope.checkinterval = 10;
            $scope.gaugeTitle = 'load1';
            $scope.minval = 0;
            $scope.maxval = 220;
            $scope.warnPercent = 40;
            $scope.critPercent = 70;
            $scope.roundFactor = 1;
            $scope.value = 0;
            $scope.ticks = [];

            $scope.load = function(){
                $http.get('/dashboards/widget_tachometer.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.tachometer;
                });
            };


            $scope.precisionRound = function(number, precision){
                let factor = Math.pow(10, precision);
                return Math.round(number * factor) / factor;
            };

            $scope.initScriptedGauges = function(){

                let warnBorder = ($scope.maxval / 100) * $scope.warnPercent;    //88
                let critBorder = ($scope.maxval / 100) * $scope.critPercent;    //154

                let xfirstSectorLength = (warnBorder / ($scope.warnPercent / 10));    //22
                let firstSectorLength = $scope.precisionRound(xfirstSectorLength - ($scope.minval / 11), $scope.roundFactor);

                let xsecondSectorLength = (critBorder / ($scope.critPercent / 10));   //22
                let secondSectorLength = $scope.precisionRound(xsecondSectorLength - ($scope.minval / 11), $scope.roundFactor);

                let xthirdSectorLength = ($scope.maxval / 10);                      //22
                let thirdSectorLength = $scope.precisionRound(xthirdSectorLength - ($scope.minval / 11), $scope.roundFactor);


                let currentCount = $scope.minval;

                for(let i = currentCount; i < warnBorder; i = i + firstSectorLength){
                    currentCount = $scope.precisionRound(i, $scope.roundFactor);
                    //console.log(currentCount);
                    $scope.ticks.push(currentCount);
                }

                //console.log("----");

                for(let i = currentCount + firstSectorLength; i < critBorder; i = i + secondSectorLength){
                    currentCount = $scope.precisionRound(i, $scope.roundFactor);
                    //console.log(currentCount);
                    $scope.ticks.push(currentCount);
                }

                //console.log("----");

                for(let i = currentCount + secondSectorLength; i <= $scope.maxval; i = i + thirdSectorLength){
                    currentCount = $scope.precisionRound(i, $scope.roundFactor);
                    //console.log(currentCount);
                    $scope.ticks.push(currentCount);
                }

                //console.log("ticks: ");
                //console.log($scope.ticks);
                //console.log("first border: "+warnBorder);
                //console.log("first: "+firstSectorLength);
                //console.log("second: "+secondSectorLength);
                //console.log("third: "+thirdSectorLength);

                new RadialGauge({
                    renderTo: 'canvas-'+$scope.id,
                    width: 300,
                    height: 300,
                    units: false,
                    title: $scope.gaugeTitle,
                    value: $scope.value,
                    minValue: $scope.minval,
                    maxValue: $scope.maxval,
                    majorTicks: $scope.ticks,
                    minorTicks: 2,
                    strokeTicks: false,
                    highlights: [
                        {from: $scope.minval, to: warnBorder, color: '#449D44'},
                        {from: warnBorder, to: critBorder, color: '#DF8F1D'},
                        {from: critBorder, to: $scope.maxval, color: '#C9302C'}
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
            };

            if(!Array.prototype.forEach){
                Array.prototype.forEach = function(cb){
                    let i = 0, s = this.length;
                    for(; i < s; i++){
                        cb && cb(this[i], i, this);
                    }
                }
            }

            document.fonts && document.fonts.forEach(function(font){
                font.loaded.then(function(){
                    if(font.family.match(/Led/)){
                        document.gauges.forEach(function(gauge){
                            gauge.update();
                        });
                    }
                });
            });

            let timers = [];

            $scope.animateGauges = function(){
                document.gauges.forEach(function(gauge){
                    timers.push(setInterval(function(){
                        gauge.value = Math.random() *
                            (gauge.options.maxValue - gauge.options.minValue) / 4 +
                            gauge.options.minValue / 4;
                    }, gauge.animation.duration + 50));
                });
            };

            $scope.stopGaugesAnimation = function(){
                timers.forEach(function(timer){
                    clearInterval(timer);
                });
            };



            angular.element(function(){
                $scope.load();
                $('[data-toggle="tooltip"]').tooltip();
                $scope.initScriptedGauges();
                /*
                $scope.tr = $('#traffic-light' + $scope.id);
                $scope.redBulb = $('#redLight' + $scope.id);
                $scope.yellowBulb = $('#yellowLight' + $scope.id);
                $scope.greenBulb = $('#greenLight' + $scope.id);
                $scope.updateTrafficLightSize(false, $("#" + $scope.id)[0].attributes['data-gs-height'].nodeValue);
                */
            });


            $('.grid-stack').on('change', function(event, items){
                if(items){
                    items.forEach(function(item){
                        if(item.id == $scope.id){
                            //$scope.updateTrafficLightSize(item);
                        }
                    });
                }
            });

        }

    };
});
