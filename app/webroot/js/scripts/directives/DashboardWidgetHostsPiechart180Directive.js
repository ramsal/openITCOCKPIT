angular.module('openITCOCKPIT').directive('dashboardWidgetHostsPiechart180Directive', function($http, $interval){
    return {
        restrict: 'A',
        templateUrl: '/dashboards/widget_hosts_piechart.html',
        scope: {
            'title': '=wtitle',
            'id': '=wid',
            'updateTitle': '&'
        },

        controller: function($scope){

            $scope.widget = null;
            $scope.showpng = true;
            $scope.isHalf = 1;

            $scope.load = function(){
                $http.get('/dashboards/getPiechartSettings.json', {
                    params: {
                        'angular': true,
                        'widgetId': $scope.id
                    }
                }).then(function(result){
                    $scope.showpng = result.data.settings.use_png;
                });

                $http.get('/angular/hostStats.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    let hoststatusCount = result.data.hoststatusCount;
                    let states = [hoststatusCount[0], hoststatusCount[1], hoststatusCount[2]];
                    let total = hoststatusCount.total;

                    $scope.widget = {
                        'up': [states[0], Math.round((states[0] / total) * 100)],
                        'down': [states[1], Math.round((states[1] / total) * 100)],
                        'unreachable': [states[2], Math.round((states[2] / total) * 100)]
                    };

                    angular.element(function(){        //page loading completed
                        if(document.getElementById("myChart" + $scope.id)){
                            $scope.ctx = document.getElementById("myChart" + $scope.id);
                            $scope.myPieChart = new Chart($scope.ctx, {
                                type: 'pie',
                                data: {
                                    labels: ["Up", "Down", "Unreachable"],
                                    datasets: [{
                                        data: [
                                            $scope.widget.up[0],
                                            $scope.widget.down[0],
                                            $scope.widget.unreachable[0]
                                        ],
                                        backgroundColor: [
                                            'rgba(68, 157, 68, 1)',
                                            'rgba(201, 48, 44, 1)',
                                            'rgba(146, 162, 168, 1)'
                                        ],
                                        borderWidth: 0
                                    }]
                                },
                                options: {
                                    rotation: Math.PI,
                                    circumference: Math.PI,
                                    legend: {
                                        display: true,
                                        labels: {
                                            usePointStyle: true,
                                            generateLabels: {
                                                hidden: true
                                            }

                                        }
                                    }
                                }
                            });
                        }
                    });

                });
            };

            $scope.saveSettings = function(){
                let data = {
                    widgetId: $scope.id,
                    use_png: $scope.showpng ? "1" : "0"
                };
                $http.post('/dashboards/savePiechartSettings.json?angular=true', data);
            };

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();
        }
    };
});
