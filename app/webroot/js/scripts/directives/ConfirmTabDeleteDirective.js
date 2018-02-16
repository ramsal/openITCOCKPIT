angular.module('openITCOCKPIT').directive('confirmTabDelete', function($http, $filter, $timeout){
    return {
        restrict: 'E',
        templateUrl: '/angular/confirm_delete.html',

        controller: function($scope){

            let object;

            $scope.setObject = function(_object){
                object = _object;
            };

            $scope.delete = function(){
                $scope.isDeleting = true;
                $http.post($scope.deleteUrl).then(
                    function(result){
                        $('#angularConfirmDelete').modal('hide');
                        $scope.errors = null;
                        $scope.tab.id = null;
                        $scope.load();
                    }, function errorCallback(result){
                        console.error(result.data);
                        $scope.errors = result.data;
                    }
                );
                $scope.isDeleting = false;
            };

        },

        link: function($scope, element, attr){
            $scope.confirmTabDelete = function(object){
                $scope.setObject(object);
                $('#angularConfirmDelete').modal('show');
            };
        }
    };
});