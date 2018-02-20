angular.module('openITCOCKPIT')
    .controller('DashboardsIndexController', function($scope, $http, $compile, $interval){

        $scope.init = true;
        $scope.errors = null;

        $scope.tabRotateInterval = 0;
        $scope.tabRotateLastTab = 0;
        $scope.openEditModals = [];
        $scope.serializedGridstackData = [];
        $scope.deletedWidgets = [];
        $scope.allWidgets = {};
        $scope.tabs = {};
        $scope.sharedTabs = {};
        $scope.tab = {
            id: null,
            renameId: null,
            name: null,
            newname: null,
            selectedSharedTab: null
        };
        $scope.ready = null;
        $scope.gridstack = null;
        let $gridstack = $('.grid-stack');

        $scope.load = function(){

            $http.get('/dashboards/index.json', {
                params: {
                    'angular': true
                }
            }).then(function(result){
                $scope.allWidgets = result.data.allWidgets;
                $scope.tabs = result.data.tabs;
                $scope.sharedTabs = result.data.sharedTabs;
                $scope.tabRotateInterval = parseInt(result.data.tabRotateInterval);
                if($scope.tabs[0] && !$scope.tab.id){
                    $scope.tab.id = $scope.tabs[0].DashboardTab.id;
                    $scope.tabRotateLastTab = $scope.tab.id;
                    $scope.tab.name = $scope.tabs[0].DashboardTab.name;
                }
                //console.log(result.data);

                let options = {
                    float: true
                };
                $gridstack.gridstack(options);
                $scope.gridstack = $gridstack.data('gridstack');
                $scope.gridstack.cellHeight(2);
                $scope.gridstack.cellWidth(4);
                //$scope.loadGrid();
            });
        };

        $scope.load();

        $scope.getPreparedWidgets = function(){

            $http.get('/dashboards/getPreparedWidgets/' + $scope.tab.id + '.json', {
                params: {
                    'angular': true
                }
            }).then(function(result){
                $scope.preparedWidgets = result.data.preparedWidgets;

                $scope.serializedGridstackData = [];
                $scope.preparedWidgets.forEach(function(w){
                    $scope.serializedGridstackData.push({
                        x: w.Widget.col,
                        y: w.Widget.row,
                        width: w.Widget.width,
                        height: w.Widget.height,
                        type_id: w.Widget.type_id,
                        title: w.Widget.title,
                        id: w.Widget.id,
                        color: w.Widget.color
                    });
                });

                $scope.loadGrid();
                $scope.ready = 1;
                //console.log(result.data);
                //console.log($scope.serializedGridstackData);
            });
        };

        $scope.openEditModal = function(){
            $('#editTabModal').modal('show');
        };

        $scope.closeEditModal = function(){
            $('#editTabModal').modal('hide');
        };

        $scope.openNewTabModal = function(){
            $('#addTabModal').modal('show');
        };

        $scope.closeNewTabModal = function(){
            $('#addTabModal').modal('hide');
        };

        $scope.renameTab = function(){
            $http.post('/dashboards/renameTab.json?angular=true', {
                'dashboard': {
                    'name': $scope.tab.name,
                    'id': $scope.tab.renameId
                }
            }).then(function(result){
                if(result.data.action == true){
                    $scope.errors = null;
                    $scope.closeEditModal();
                    $scope.load();
                }else{
                    //console.log(result.data.error);
                    $scope.errors = result.data.error;
                }
            });
        };

        $scope.newTab = function(){
            $http.post('/dashboards/createTab.json?angular=true', {
                'dashboard': {
                    'name': $scope.tab.newname,
                }
            }).then(function(result){
                if(result.data.action == true){
                    $scope.errors = null;
                    $scope.tab.newname = null;
                    $scope.closeNewTabModal();
                    $scope.load();
                }else{
                    $scope.errors = result.data.error;
                }
            });
        };

        $scope.newSharedTab = function(){
            $http.post('/dashboards/createTabFromSharing.json?angular=true', {
                'dashboard': {
                    'source_tab': $scope.tab.selectedSharedTab,
                }
            }).then(function(result){
                //console.log(result.data);
                if(result.data.action == true){
                    $scope.errors = null;
                    $scope.tab.newname = null;
                    $scope.tab.selectedSharedTab = null;
                    $scope.closeNewTabModal();
                    $scope.load();
                }else{
                    $scope.errors = result.data.error;
                }
            });
        };

        $scope.deleteTab = function(){
            $scope.deleteUrl = '/dashboards/deleteTab/' + $scope.tab.id + '.json?angular=true';
            $scope.confirmTabDelete(this);

            /*
            $http.post('/dashboards/deleteTab/' + $scope.tab.id + '.json?angular=true').then(function(){
                $scope.errors = null;
                $scope.closeEditModal();
                $scope.tab.id = null;
                $scope.load();
            });
            */
        };

        $scope.startSharing = function(){
            $http.post('/dashboards/startSharing/' + $scope.tab.id + '.json?angular=true').then(function(){
                $scope.errors = null;
                $scope.load();
            });
        };

        $scope.stopSharing = function(){
            $http.post('/dashboards/stopSharing/' + $scope.tab.id + '.json?angular=true').then(function(){
                $scope.errors = null;
                $scope.load();
            });
        };

        $scope.updatePosition = function(widgets){
                let arr = {'tabId': $scope.tab.id};
                widgets.forEach(function(widget, key){
                    arr[key] = widget;
                });
                $http.post('/dashboards/updatePosition.json?angular=true', arr).then(function(result){
                    //do nothing
                    //console.log(result);
                });
        };

        $scope.updateColor = function(widgetId, color){
            $http.post('/dashboards/updateColor.json?angular=true', {
                color: color,
                widgetId: widgetId
            }).then(function(result){
                //do nothing
                //console.log(result);
            });
        };


        $scope.updateWidgetTitle = function(widgetId, title){
            $http.post('/dashboards/updateTitle.json?angular=true', {
                title: title,
                widgetId: widgetId
            }).then(function(result){
                //do nothing
                //console.log(result);
            });
        };

        $scope.deleteWidget = function(widgetId){
            $http.post('/dashboards/deleteWidget.json?angular=true',
                {
                    'widgetId': widgetId
                }
            ).then(function(result){
                //do nothing
                //console.log(result);
            });
        };

        $scope.$watch('tab.id', function(){
            if($scope.tab.id != null){
                $scope.ready = 0;
                $scope.getPreparedWidgets();
            }
        });

        $scope.getWidgetHtmlContent = function(type_id, id, color, title){
            let str = '';
            if(type_id == 1){
                str = '<div id="widget-color-' + id + '" ' +
                    '       class="jarviswidget ' + color + '" ' +
                    '       data-widget-attstyle="' + color + '" ' +
                    '       role="widget" ' +
                    '       dashboard-widget-welcome="" ' +
                    '       widget-title="' + title + '" ' +
                    '       widget-id="' + id + '" ' +
                    '       update-title="updateWidgetTitle(id,title)">' +
                    '  </div>';
            }
            return str;
        };


        $scope.loadGrid = function(){
            $scope.gridstack.removeAll();
            let items = GridStackUI.Utils.sort($scope.serializedGridstackData);
            let key = 1;
            _.each(items, function(node){
                let newhtml = '<div><div id="' + node.id + '" style="overflow: hidden" class="grid-stack-item-content"/>' + $scope.getWidgetHtmlContent(node.type_id, node.id, node.color, node.title) + '<div/>';
                $scope.gridstack.addWidget($(newhtml), node.x, node.y, node.width, node.height, undefined, undefined, undefined, undefined, undefined, node.id);
                let divElement = angular.element(document.getElementById(node.id));
                let appendHtml = $compile($scope.getWidgetHtmlContent(node.type_id, node.id, node.color, node.title))($scope);
                divElement.append(appendHtml);
                $('.grid-stack-item').draggable({cancel: "div.not-draggable"});
                key++;
            }, $scope.gridstack);
            return false;
        };

        $scope.saveGrid = function(){
            $scope.serializedGridstackData = _.map($('.grid-stack > .grid-stack-item:visible'), function(el){
                el = $(el);
                let node = el.data('_gridstack_node');
                return {
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    type_id: node.type_id,
                    title: node.title,
                    color: node.color,
                    id: node.id
                };
            }, $scope.gridstack);
            $('#saved-data').val(JSON.stringify($scope.serializedGridstackData, null, '    '));
            return false;
        };

        $scope.clearGrid = function(){
            $scope.gridstack.removeAll();
            return false;
        };


        $scope.serializeWidgetMap = function(items){
            //console.log(items);
            let arr = [];
            items.forEach(function(item){
                //console.log("Widget-ID: " + item.id);
                if($scope.deletedWidgets.indexOf(item.id) < 0){
                    arr.push({
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        row: item.y,
                        col: item.x
                    });
                }
            });
            if(arr.length > 0){
                $scope.updatePosition(arr);
            }
        };

        $gridstack.on('change', function(event, items){
            if($scope.ready == 1 && items){
                $scope.serializeWidgetMap(items);
            }
        });

        $gridstack.on('removed', function(event, items){
            for(let i = 0; i < items.length; i++){
                //console.log('item removed');
                //console.log(items[i].id);
            }
        });

        $gridstack.on('click', '.jarviswidget-delete-btn', function(){
            let $widget = $(this).closest(".grid-stack-item");
            //console.log($widget[0].attributes['data-gs-id'].nodeValue);
            if($scope.openEditModals.indexOf($widget[0].attributes['data-gs-id'].nodeValue) >= 0){
                $scope.openEditModals.splice($scope.openEditModals.indexOf($widget[0].attributes['data-gs-id'].nodeValue, 1));
                if($scope.openEditModals.length == 0){
                    $scope.gridstack.movable('.grid-stack-item', true);
                    $scope.gridstack.resizable('.grid-stack-item', true);
                }
            }
            $scope.deletedWidgets.push($widget[0].attributes['data-gs-id'].nodeValue);
            $scope.gridstack.removeWidget($widget);
            $scope.deleteWidget($widget[0].attributes['data-gs-id'].nodeValue);
        });


        /*  //funktioniert irgendwie, soll jedoch über server -> create und js load() neu aufgebaut werden (wg ID)
        $scope.addWidgetTest = function(){
            console.log('add!');
            let node_orig =  {
                x: 12 * Math.random(),
                y: 5 * Math.random(),
                width: 1 + 3 * Math.random(),
                height: 1 + 3 * Math.random()
            };
            let node =  {
                x: 0,
                y: 0,
                width: 4,
                height: 3,
                type_id: 1,
            };

            let newhtml = '<div><div id="xd" class="grid-stack-item-content"/>'+$scope.getWidgetContent(node.type_id)+'<div/>';
            $scope.gridstack.addWidget(     //return added element
                $(newhtml),
                node.x, node.y, node.width, node.height
            );
            //$scope.gridstack.movable(el, false);
            let divElement = angular.element(document.getElementById('xd'));
            let appendHtml = $compile($scope.getWidgetContent(node.type_id))($scope);
            divElement.append(appendHtml);
            $('.grid-stack-item').draggable({cancel: "div.not-draggable" });

            $scope.saveGrid();
        };
        */


        $('.widget-toolbar').on('click', '.addWidget', function(){
            //console.log(this.getAttribute("data-type-id"));
            //$scope.ready=0;
            $http.post('/dashboards/add.json?angular=true',
                {
                    'tabId': $scope.tab.id,
                    'typeId': this.getAttribute("data-type-id")
                }
            ).then(function(result){
                //console.log(result);
                $scope.getPreparedWidgets();
            });
        });


        $gridstack.on('click', '.jarviswidget-edit-btn', function(){
            $(this).closest('.grid-stack-item-content').find('.jarviswidget-editbox').toggle('medium');
            let $gsi = $(this).closest('.grid-stack-item');

            let height = $gsi[0].getAttribute("data-gs-height");
            if(!$gsi[0].getAttribute("data-gs-height-orig")){
                $gsi[0].setAttribute("data-gs-height-orig", height);
            }
            let height_orig = $gsi[0].getAttribute("data-gs-height-orig");
            //console.log($gsi[0].attributes['data-gs-id'].nodeValue);
            if(height > height_orig || parseInt($(this).closest('.grid-stack-item-content').find('.jarviswidget-editbox').css("height"))>0){   //will be closed
                $scope.openEditModals.splice($scope.openEditModals.indexOf($gsi[0].attributes['data-gs-id'].nodeValue, 1));
                $gsi[0].setAttribute("data-gs-height", (parseInt(height_orig)));
                if($scope.openEditModals.length == 0){
                    $scope.gridstack.movable('.grid-stack-item', true);
                    $scope.gridstack.resizable('.grid-stack-item', true);
                }
            }else{  //will be opened
                $scope.openEditModals.push($gsi[0].attributes['data-gs-id'].nodeValue);
                $scope.gridstack.movable('.grid-stack-item', false);
                $scope.gridstack.resizable('.grid-stack-item', false);
                $gsi[0].setAttribute("data-gs-height", (parseInt(height_orig) + 4));
            }
            //console.log($gsi[0].getAttribute("data-gs-height"));

            return false;
        });

        $gridstack.on('click', '[data-widget-setstyle]', function(){
            //console.log(this.attributes["data-widget-setstyle"].nodeValue);
            //console.log($(this).closest('.grid-stack-item-content').find('.jarviswidget')[0].attributes["data-widget-attstyle"].nodeValue);
            let oldstyle = $(this).closest('.grid-stack-item-content').find('.jarviswidget')[0].attributes["data-widget-attstyle"].nodeValue;
            let newstyle = this.attributes["data-widget-setstyle"].nodeValue;
            if(!this.attributes["data-widget-setstyle"].nodeValue){
                newstyle = "bg-color-white";
            }
            $(this).closest('.grid-stack-item-content').find('.jarviswidget')[0].classList.remove(oldstyle);
            $(this).closest('.grid-stack-item-content').find('.jarviswidget')[0].classList.add(newstyle);
            $(this).closest('.grid-stack-item-content').find('.jarviswidget')[0].attributes["data-widget-attstyle"].nodeValue = newstyle;

            let $widget = $(this).closest(".grid-stack-item");
            let newcolor = this.className;
            $scope.updateColor($widget[0].attributes['data-gs-id'].nodeValue, newcolor);
            return false;
        });


        $scope.tabRotate = function(){
            let tabRotateShowNextTab = false;
            if($scope.tabRotateInterval == 0){
                $interval.cancel($scope.rotationTimer);
            }
            if($scope.tabRotateLastTab != 0 && $scope.tabRotateLastTab != $scope.tab.id){
                $scope.tabRotateLastTab = $scope.tab.id;
            }
            if($scope.tabs[$scope.tabs.length - 1].DashboardTab.id == $scope.tabRotateLastTab){
                $scope.tabRotateLastTab = 0;
            }
            $scope.tabs.some(function(tab){
                let tabId = tab.DashboardTab.id;
                if(tabRotateShowNextTab || $scope.tabRotateLastTab == 0){
                    $scope.tabRotateLastTab = tabId;
                    $scope.tab.id = tabId;
                    return true;
                }
                if($scope.tabRotateLastTab == tabId){
                    tabRotateShowNextTab = true;
                }
            });
        };

        $scope.hideRotationSavesMessage = function(){
            $interval.cancel($scope.rotationMessageTimer);
            $scope.showRotationSavesMessage = false;
        };

        $scope.saveTabRotateInterval = function(){
            $http.post('/dashboards/saveTabRotationInterval.json?angular=true',
                {
                    'value': $scope.tabRotateInterval
                }
            ).then(function(result){
                //console.log("interval saved! - "+result);
                $scope.showRotationSavesMessage = true;
                if($scope.rotationMessageTimer) $interval.cancel($scope.rotationMessageTimer);
                $scope.rotationMessageTimer = $interval($scope.hideRotationSavesMessage, 3000);
            });
        };

        $scope.toTimeString = function(seconds){
            if(seconds == 0){
                return "disabled";
            }
            return (new Date(seconds * 60000)).toUTCString().match(/(\d\d:\d\d)/)[0] + " minutes";
        };

        $scope.$watch('tabRotateInterval', function(){
            $scope.tabRotateTimeString = $scope.toTimeString($scope.tabRotateInterval);
            if($scope.rotationTimer) $interval.cancel($scope.rotationTimer);
            if($scope.tabRotateInterval > 0){
                $scope.rotationTimer = $interval($scope.tabRotate, parseInt($scope.tabRotateInterval + '000'));
                //console.log("Rotation interval: " + $scope.tabRotateInterval);
            }
        });

    });