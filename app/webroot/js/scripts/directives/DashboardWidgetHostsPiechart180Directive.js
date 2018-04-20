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

            $scope.load = function(){
                $http.get('/dashboards/widget_hosts_piechart.json', {
                    params: {
                        'angular': true
                    }
                }).then(function(result){
                    $scope.widget = result.data.hosts_piechart;
                    let x = [$scope.widget.state[0], $scope.widget.state[1], $scope.widget.state[2]];
                    let total = $scope.widget.total;

                    $scope.widget = {
                        'up': [x[0], Math.round((x[0] / total) * 100)],
                        'down': [x[1], Math.round((x[1] / total) * 100)],
                        'unreachable': [x[2], Math.round((x[2] / total) * 100)]
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

            $scope.load();
            $('[data-toggle="tooltip"]').tooltip();

        }
    };
});
