<?php
// Copyright (C) <2015>  <it-novum GmbH>
//
// This file is dual licensed
//
// 1.
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, version 3 of the License.
//
//	This program is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

// 2.
//	If you purchased an openITCOCKPIT Enterprise Edition you can use this file
//	under the terms of the openITCOCKPIT Enterprise Edition license agreement.
//	License agreement and license key will be shipped with the order
//	confirmation.

class DashboardsController extends AppController {
    //public $layout = 'Admin.default';
    public $layout = 'angularjs';
    public $helpers = [
        'PieChart',
        'Status',
        'Monitoring',
        'Bbcode',
        'Dashboard',
        'Html'
    ];
    public $components = [
        'Bbcode',
    ];
    public $uses = [
        MONITORING_HOSTSTATUS,
        MONITORING_SERVICESTATUS,
        MONITORING_PARENTHOST,
        'Host',
        'DashboardTab',
        'Widget',
        'WidgetHostStatusList',
        'WidgetServiceStatusList',
        'Service',
        MONITORING_OBJECTS,
        'Rrd',
        'User',
        'Servicegroup',
        'Hostgroup',
        'WidgetTacho',
        'WidgetNotice',
        'MapModule.Map',
        'GraphgenTmpl',
    ];

    const UPDATE_DISABLED = 0;
    const CHECK_FOR_UPDATES = 1;
    const AUTO_UPDATE = 2;

    public function beforeFilter () {
        require_once APP . 'Lib' . DS . 'Dashboards' . DS . 'DashboardHandler.php';
        //Dashboard is allays allowed
        if ($this->Auth->loggedIn() === true) {
            $this->Auth->allow();
        }
        parent::beforeFilter();
        if ($this->Auth->loggedIn() === true) {
            $this->DashboardHandler = new Dashboard\DashboardHandler($this);
        }
    }

    public function widget_tachometer () {
        if ($this->isApiRequest()) {

            $tachometer = [];

            if (isset($this->request->query['widgetId'])) {
                $widgetId = $this->request->query['widgetId'];
                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            'WidgetTacho',
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        $tachometer = $widget;
                    }
                }
            }

            $this->set(compact(['tachometer']));
            $this->set('_serialize', ['tachometer']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_traffic_light () {
        if ($this->isApiRequest()) {

            $traffic_light = [];

            if (isset($this->request->data['params']['widgetId'])) {
                $widgetId = $this->request->data['params']['widgetId'];

                if ($this->Widget->exists($widgetId)) {

                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        if (isset($this->request->data['params']['serviceId'])) {
                            $serviceId = $this->request->data['params']['serviceId'];
                            if (!$this->Service->exists($serviceId)) {
                                throw new NotFoundException('Invalid service');
                            }
                            if ($widget['Widget']['service_id'] != $serviceId) {
                                $widget['Widget']['service_id'] = $serviceId;
                                $this->Widget->saveAll($widget);
                                //$this->Widget->saveField('service_id', $serviceId);
                                $this->DashboardTab->id = $widget['DashboardTab']['id'];
                                $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
                            }
                        }
                        if ($widget['Widget']['service_id']) {
                            if (!$this->Service->exists($widget['Widget']['service_id'])) {
                                throw new NotFoundException('Invalid service');
                            }
                            $service = $this->Service->find('first', [
                                'recursive'  => -1,
                                'fields'     => [
                                    'Service.id',
                                    'Service.uuid'
                                ],
                                'conditions' => [
                                    'Service.id' => $widget['Widget']['service_id']
                                ]
                            ]);

                            $ServicestatusFields = new \itnovum\openITCOCKPIT\Core\ServicestatusFields($this->DbBackend);
                            $ServicestatusFields->currentState()->nextCheck()->isFlapping();
                            $servicestatus = $this->Servicestatus->byUuid($service['Service']['uuid'], $ServicestatusFields);

                            if (isset($servicestatus['Servicestatus'])) {
                                $Servicestatus = new \itnovum\openITCOCKPIT\Core\Servicestatus(
                                    $servicestatus['Servicestatus']
                                );
                            } else {
                                $traffic_light = [
                                    'serviceId' => $widget['Widget']['service_id'],
                                ];
                                $error = 'servicestatus not available';
                                $this->set(compact(['error', 'traffic_light']));
                                $this->set('_serialize', ['error', 'traffic_light']);
                                return;
                            }

                            $traffic_light = [
                                'serviceId'     => $widget['Widget']['service_id'],
                                'current_state' => $Servicestatus->currentState(),
                                'next_check'    => $Servicestatus->getNextCheck(),
                                'is_flapping'   => $Servicestatus->isFlapping()
                            ];
                        }

                    }
                }
            }

            $this->set(compact(['traffic_light']));
            $this->set('_serialize', ['traffic_light']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_service_status_list () {
        if ($this->isApiRequest()) {

            $service_status_list = [];

            if (isset($this->request->query['widgetId'])) {
                $widgetId = $this->request->query['widgetId'];

                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            'WidgetServiceStatusList',
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        $service_status_list = $widget['WidgetServiceStatusList'];
                    }
                }
            }

            $this->set(compact(['service_status_list']));
            $this->set('_serialize', ['service_status_list']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_host_status_list () {
        if ($this->isApiRequest()) {

            $host_status_list = [];

            if (isset($this->request->query['widgetId'])) {
                $widgetId = $this->request->query['widgetId'];

                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            'WidgetHostStatusList',
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        $host_status_list = $widget['WidgetHostStatusList'];
                    }
                }
            }

            $this->set(compact(['host_status_list']));
            $this->set('_serialize', ['host_status_list']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_service_downtime_list () {
        if ($this->isApiRequest()) {

            $service_downtime_list = [];

            if (isset($this->request->query['widgetId'])) {
                $widgetId = $this->request->query['widgetId'];

                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            'WidgetServiceDowntimeList',
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        $service_downtime_list = $widget['WidgetServiceDowntimeList'];
                    }
                }
            }

            $this->set(compact(['service_downtime_list']));
            $this->set('_serialize', ['service_downtime_list']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_host_downtime_list () {
        if ($this->isApiRequest()) {

            $host_downtime_list = [];

            if (isset($this->request->query['widgetId'])) {
                $widgetId = $this->request->query['widgetId'];

                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            'WidgetHostDowntimeList',
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        $host_downtime_list = $widget['WidgetHostDowntimeList'];
                    }
                }
            }

            $this->set(compact(['host_downtime_list']));
            $this->set('_serialize', ['host_downtime_list']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_hosts_piechart () {
        if ($this->isApiRequest()) {

            $hosts_piechart = [];

            $this->set(compact(['hosts_piechart']));
            $this->set('_serialize', ['hosts_piechart']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_services_piechart () {
        if ($this->isApiRequest()) {

            $services_piechart = [];

            $this->set(compact(['services_piechart']));
            $this->set('_serialize', ['services_piechart']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_parent_outages () {
        if ($this->isApiRequest()) {

            $parent_outages = [];
            /*
            require_once 'widgets'.DS.'Widget.php';
            require_once 'widgets'.DS.'QueryCache.php';
            $QueryCache = new Widget\QueryCache($this->Controller);
            $parent_outages = $QueryCache->parentOutages();
            */

            $this->set(compact(['parent_outages']));
            $this->set('_serialize', ['parent_outages']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_welcome () {
        if ($this->isApiRequest()) {

            $welcome = [];

            /*
            if ($this->Auth->user('image') != null && $this->Auth->user('image') != '') {
                if (file_exists(WWW_ROOT.'userimages'.DS.$this->Auth->user('image'))) {
                    $welcome['image'] = $this->Html->image('/userimages'.DS.$this->Auth->user('image'), ['width' => 120, 'height' => 'auto', 'id' => 'userImage', 'style' => 'border-left: 3px solid #40AC2B;']);
                } else {
                    $welcome['image'] =  $this->Html->image('fallback_user.png', ['width' => 120, 'height' => 'auto', 'id' => 'userImage', 'style' => 'border-left: 3px solid #40AC2B;']);
                }
            } else {
                $welcome['image'] =  $this->Html->image('fallback_user.png', ['width' => 120, 'height' => 'auto', 'id' => 'userImage', 'style' => 'border-left: 3px solid #40AC2B;']);
            }
            */

            $UserTime = new \itnovum\openITCOCKPIT\Core\Views\UserTime($this->Auth->user('timezone'), $this->Auth->user('dateformat'));
            $welcome['date'] = $UserTime->format(time());
            $welcome['timezone'] = h($this->Auth->user('timezone'));
            $welcome['hosts'] = 1337;
            $welcome['services'] = 1337;

            $this->set(compact(['welcome']));
            $this->set('_serialize', ['welcome']);
            return;
        }
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function widget_header () {

        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);
        return;
    }

    public function getPreparedWidgets ($tabId = null) {
        if (!$this->isApiRequest()) {
            //throw new MethodNotAllowedException();
            return;
        }

        $userId = $this->Auth->user('id');
        $tab = [];
        if ($tabId !== null && is_numeric($tabId)) {
            $tab = $this->DashboardTab->find('first', [
                'conditions' => [
                    'user_id' => $this->Auth->user('id'),
                    'id'      => $tabId,
                ],
            ]);
        }
        //No tab given, select first tab of the user
        if (empty($tab)) {
            $tab = $this->DashboardTab->find('first', [
                'conditions' => [
                    'user_id' => $this->Auth->user('id'),
                ],
                'order'      => [
                    'position' => 'ASC',
                ],
            ]);
        }
        if (empty($tab)) {
            //No tab found. Create one
            $result = $this->DashboardTab->createNewTab($userId);
            if ($result) {
                $tabId = $result['DashboardTab']['id'];
                //Fill new tab with default dashboards
                $this->Widget->create();
                $defaultWidgets = $this->DashboardHandler->getDefaultDashboards($tabId);
                $this->Widget->saveAll($defaultWidgets);
                //normalize data for controller workflow
                $tab = $this->DashboardTab->findById($tabId);
            }
        } else {
            $tabId = $tab['DashboardTab']['id'];
        }
        //var_dump($tab);
        $preparedWidgets = $this->DashboardHandler->prepareForRender($tab);

        /*foreach ($preparedWidgets as $key => $preparedWidget) {
            $preparedWidgets[$key]['Widget']['directive'] = 'dashboard-widget-welcome-directive';
        }*/


        $this->set(compact(['preparedWidgets']));
        $this->set('_serialize', ['preparedWidgets']);
    }

    public function index ($tabId = null) {
        if (!$this->isApiRequest()) {
            //throw new MethodNotAllowedException();
            return;
        }

        $allWidgets = $this->DashboardHandler->getAllWidgets();

        //Find all tabs of the user, to create tab bar
        $tabs = $this->DashboardTab->find('all', [
            'recursive'  => -1,
            'contain'    => [],
            'conditions' => [
                'user_id' => $this->Auth->user('id'),
            ],
            'order'      => [
                'position' => 'ASC',
            ],
        ]);

        //Find shared tabs
        $this->DashboardTab->bindModel([
            'belongsTo' => [
                'User',
            ],
        ]);
        $_sharedTabs = $this->DashboardTab->find('all', [
            'recursive'  => -1,
            'contain'    => [
                'User' => [
                    'fields' => [
                        'User.id',
                        'User.usergroup_id',
                        'User.firstname',
                        'User.lastname',
                    ],
                ],
            ],
            'fields'     => [
                'DashboardTab.id',
                'DashboardTab.name',
            ],
            'conditions' => [
                'shared' => 1,
            ],
            'order'      => [
                'User.id' => 'ASC',
            ],
        ]);
        $sharedTabs = [];
        foreach ($_sharedTabs as $sharedTab) {
            $sharedTabs[$sharedTab['DashboardTab']['id']] = $sharedTab['User']['firstname'] . ' ' . $sharedTab['User']['lastname'] . DS . $sharedTab['DashboardTab']['name'];
        }

        //Get tab rotate interval
        $user = $this->User->find('first', [
            'recursive'  => -1,
            'contain'    => [],
            'conditions' => [
                'User.id' => $this->Auth->user('id'),
            ],
            'fields'     => [
                'dashboard_tab_rotation',
            ],
        ]);
        $tabRotateInterval = $user['User']['dashboard_tab_rotation'];


        $this->set(compact(['allWidgets', 'tabs', 'sharedTabs', 'tabRotateInterval']));
        $this->set('_serialize', ['allWidgets', 'tabs', 'sharedTabs', 'tabRotateInterval']);

        return;
    }


    public function add () {
        $this->layout = 'plain';
        $this->set('excludeActionWrapper', true);

        if ($this->request->is('post')) {
            if (isset($this->request->data['typeId']) && isset($this->request->data['tabId'])) {
                $typeId = $this->request->data['typeId'];
                $tabId = $this->request->data['tabId'];
                $tab = $this->DashboardTab->find('first', [
                    'recursive'  => -1,
                    'contain'    => [],
                    'conditions' => [
                        'user_id' => $this->Auth->user('id'),
                        'id'      => $tabId,
                    ],
                ]);
                //Check if the tab exists and is owned by the user
                if (!empty($tab)) {
                    $_widget = $this->DashboardHandler->getWidgetByTypeId($typeId, $tabId);
                    debug($_widget);
                    $this->Widget->create();
                    if ($this->Widget->saveAll($_widget)) {
                        $_widget['Widget']['id'] = $this->Widget->id;
                        $this->set('widget', $_widget);
                    }
                }
            }
        }

        return;
    }

    public function createTab () {
        $error = ['Post or put request is needed'];
        if ($this->request->is('post') || $this->request->is('put')) {
            $error = ['name' => ['Required fields are not transmitted']];
            if (isset($this->request->data['dashboard']['name'])) {
                $tabName = $this->request->data['dashboard']['name'];
                $userId = $this->Auth->user('id');
                $error = ['name' => ['Name is not valid']];
                if (mb_strlen($tabName) > 0) {
                    $result = $this->DashboardTab->createNewTab($userId, [
                        'name' => $tabName,
                    ]);
                    if (isset($result['DashboardTab']['id'])) {
                        /*$this->redirect([
                            'action' => 'index',
                            $result['DashboardTab']['id'],
                        ]);*/
                        $action = true;
                        $this->set(compact(['action']));
                        $this->set('_serialize', ['action']);
                        return;
                    }
                }
            }
        }
        $this->set(compact(['error']));
        $this->set('_serialize', ['error']);
        return;
    }

    public function createTabFromSharing () {
        $error = null;
        $sourceTabId = $this->request->data('dashboard.source_tab');
        $sourceTab = $this->DashboardTab->find('first', [
            'recursive'  => -1,
            'contain'    => [],
            'conditions' => [
                'id'     => $sourceTabId,
                'shared' => 1,
            ],
        ]);
        if (empty($sourceTab)) {
            $error = ['source_tab' => [__('Invalid tab')]];
            //throw new NotFoundException(__('Invalid tab'));
        } else {
            $userId = $this->Auth->user('id');
            $newTab = $this->DashboardTab->createNewTab($userId, [
                'name'              => $sourceTab['DashboardTab']['name'],
                'source_tab_id'     => $sourceTab['DashboardTab']['id'],
                'check_for_updates' => 1,
            ]);

            if ($this->Widget->copySharedWidgets($sourceTab, $newTab, $userId) === false) {
                //$this->setFlash(__('Tab copied successfully'));
                $action = true;
                $this->set(compact(['action']));
                $this->set('_serialize', ['action']);
                return;
            }
            $error = ['source_tab' => [__('Could not use shared tab')]];
            /*$this->setFlash(__('Could not use shared tab'), false);
            $this->redirect(['action' => 'index']);*/
        }
        $this->set(compact(['error']));
        $this->set('_serialize', ['error']);
        return;
    }

    public function renameTab () {
        if (($this->request->is('post') || $this->request->is('put')) && $this->isApiRequest()) {
            $error = ['name' => ['Required fields are not transmitted']];
            if (isset($this->request->data['dashboard']['name']) && isset($this->request->data['dashboard']['id'])) {
                $error = ['name' => ['Name is not valid']];
                $tabName = $this->request->data['dashboard']['name'];
                $tabId = $this->request->data['dashboard']['id'];
                $userId = $this->Auth->user('id');
                if (mb_strlen($tabName) > 0) {
                    $result = $this->DashboardTab->find('first', [
                        'recursive'  => -1,
                        'contain'    => [],
                        'conditions' => [
                            'id'      => $tabId,
                            'user_id' => $userId,
                        ],
                    ]);
                    if (!empty($result)) {
                        $this->DashboardTab->id = $tabId;
                        if ($this->DashboardTab->saveField('name', $tabName)) {
                            /*$this->redirect([
                                'action' => 'index',
                                $tabId,
                            ]);*/
                            $action = true;
                            $this->set(compact(['action']));
                            $this->set('_serialize', ['action']);
                            return;
                        }
                    }
                }
            }

            $this->set(compact(['error']));
            $this->set('_serialize', ['error']);
        }
        /* $this->setFlash(__('Could not rename tab'), false);
        $this->redirect([
            'action' => 'index',
            $tabId,
        ]); */
    }

    public function updateTabPosition () {
        if (($this->request->is('post') || $this->request->is('put')) && $this->isApiRequest()) {
            $error = ['Required fields are not transmitted'];
            if (isset($this->request->data['dashboard']['id']) &&
                isset($this->request->data['dashboard']['position'])) {

                $error = ['Invalid tab position'];
                $tabPosition = $this->request->data['dashboard']['position'];
                $tabId = $this->request->data['dashboard']['id'];
                $userId = $this->Auth->user('id');
                if ($tabPosition > 0) {
                    $result = $this->DashboardTab->find('first', [
                        'recursive'  => -1,
                        'contain'    => [],
                        'conditions' => [
                            'id'      => $tabId,
                            'user_id' => $userId,
                        ],
                    ]);
                    if (!empty($result)) {
                        $this->DashboardTab->id = $tabId;
                        if ($this->DashboardTab->saveField('position', $tabPosition)) {
                            $action = true;
                            $this->set(compact(['action']));
                            $this->set('_serialize', ['action']);
                            return;
                        }
                    }
                }
            }
            $this->set(compact(['error']));
            $this->set('_serialize', ['error']);
        }
    }

    public function deleteTab ($tabId = null) {
        if (!$this->DashboardTab->exists($tabId)) {
            throw new NotFoundException(__('Invalid tab'));
        }

        if (!$this->request->is('post') || !$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }

        $tab = $this->DashboardTab->findById($tabId);
        $userId = $this->Auth->user('id');
        if ($tab['DashboardTab']['user_id'] == $userId) {
            $this->DashboardTab->id = $tab['DashboardTab']['id'];
            if ($this->DashboardTab->delete()) {
                $action = true;
                $this->set(compact(['action']));
                $this->set('_serialize', ['action']);
                return;
            }
        }

        $action = false;
        $this->set(compact(['action']));
        $this->set('_serialize', ['action']);
        return;
    }

    public function restoreDefault ($tabId = null) {
        $tab = $this->DashboardTab->find('first', [
            'conditions' => [
                'user_id' => $this->Auth->user('id'),
                'id'      => $tabId,
            ],
        ]);
        if (empty($tab) || $tab['DashboardTab']['id'] == null) {
            throw new NotFoundException(__('Invalid tab'));
        }
        if ($this->Widget->deleteAll(['Widget.dashboard_tab_id' => $tab['DashboardTab']['id']])) {
            $defaultWidgets = $this->DashboardHandler->getDefaultDashboards($tabId);
            foreach($defaultWidgets as $widget){
                $this->Widget->create();
                $this->Widget->saveAll($widget);
            }
            $this->DashboardTab->id = $tabId;
            $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
        }
        $this->redirect(['action' => 'index', $tabId]);
    }

    public function updateTitle () {
        $this->autoRender = false;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }
        if (isset($this->request->data['widgetId']) && isset($this->request->data['title'])) {
            $widgetId = $this->request->data['widgetId'];
            $title = $this->request->data['title'];
            $userId = $this->Auth->user('id');
            if ($this->Widget->exists($widgetId)) {
                $widget = $this->Widget->findById($widgetId);
                if ($widget['DashboardTab']['user_id'] == $userId) {
                    $widget['Widget']['title'] = $title;
                    $this->Widget->save($widget);
                }
            }
        }
    }

    public function updateColor () {
        $this->autoRender = false;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }
        if (isset($this->request->data['widgetId']) && isset($this->request->data['color'])) {
            $widgetId = $this->request->data['widgetId'];
            $color = $this->request->data['color'];
            $userId = $this->Auth->user('id');
            if ($this->Widget->exists($widgetId)) {
                $widget = $this->Widget->findById($widgetId);
                if ($widget['DashboardTab']['user_id'] == $userId) {
                    $widget['Widget']['color'] = str_replace('bg-', 'jarviswidget-', $color);
                    $this->Widget->save($widget);
                }
            }
        }
    }

    public function updatePosition () {
        $this->autoRender = false;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }
        //var_dump($this->request->data[0]);
        if (isset($this->request->data['tabId']) && isset($this->request->data[0])) {
            $userId = $this->Auth->user('id');
            $tab = $this->DashboardTab->find('first', [
                'recursive'  => -1,
                'contain'    => [
                    'Widget',
                ],
                'conditions' => [
                    'id'      => $this->request->data['tabId'],
                    'user_id' => $userId,
                ],
            ]);
            if (!empty($tab)) {
                $widgetIds = Hash::extract($tab['Widget'], '{n}.id');
                $data = [];
                foreach ($this->request->data as $widget) {
                    if (is_array($widget) && isset($widget['id'])) {
                        if (in_array($widget['id'], $widgetIds)) {
                            $data[] = [
                                'id'     => $widget['id'],
                                'row'    => $widget['row'],
                                'col'    => $widget['col'],
                                'width'  => $widget['width'],
                                'height' => $widget['height'],
                            ];
                        }
                    }
                }
                if (!empty($data)) {
                    $this->Widget->saveAll($data);
                    $this->DashboardTab->id = $tab['DashboardTab']['id'];
                    $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
                }
            }
        }
    }

    public function deleteWidget () {
        $this->autoRender = false;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }
        if (isset($this->request->data['widgetId'])) {
            $widgetId = $this->request->data['widgetId'];
            $userId = $this->Auth->user('id');
            if ($this->Widget->exists($widgetId)) {
                $widget = $this->Widget->find('first', [
                    'contain'    => [
                        'DashboardTab',
                    ],
                    'conditions' => [
                        'Widget.id' => $widgetId,
                    ],
                ]);
                if ($widget['DashboardTab']['user_id'] == $userId) {
                    $this->Widget->delete($widget['Widget']['id']);
                    $this->DashboardTab->id = $widget['DashboardTab']['id'];
                    $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
                }
            }
        }
    }

    public function saveTabRotationInterval () {
        if (!$this->request->is('post')) {
            throw new MethodNotAllowedException();
        }
        $this->autoRender = false;
        if (isset($this->request->data['value'])) {
            if (is_numeric($this->request->data['value'])) {
                $userId = $this->Auth->user('id');
                $user = $this->User->find('first', [
                    'recursive'  => -1,
                    'contain'    => [],
                    'conditions' => [
                        'User.id' => $userId,
                    ],
                    'fields'     => [
                        'User.id',
                        'User.dashboard_tab_rotation',
                    ],
                ]);
                $this->User->id = $user['User']['id'];
                $this->User->saveField('dashboard_tab_rotation', $this->request->data['value']);
            }
        }
    }

    public function startSharing ($tabId) {
        $userId = $this->Auth->user('id');
        $tab = $this->DashboardTab->find('first', [
            'recursive'  => -1,
            'contain'    => [],
            'conditions' => [
                'id'      => $tabId,
                'user_id' => $userId,
            ],
            'fields'     => [
                'id',
                'user_id',
            ],
        ]);
        if (empty($tab)) {
            throw new NotFoundException(__('Invalid tab'));
        }

        $this->DashboardTab->id = $tabId;
        $this->DashboardTab->saveField('shared', 1);
        $this->redirect([
            'action' => 'index',
            $tabId,
        ]);
    }

    public function stopSharing ($tabId) {
        $userId = $this->Auth->user('id');
        $tab = $this->DashboardTab->find('first', [
            'recursive'  => -1,
            'contain'    => [],
            'conditions' => [
                'id'      => $tabId,
                'user_id' => $userId,
            ],
            'fields'     => [
                'id',
                'user_id',
            ],
        ]);
        if (empty($tab)) {
            throw new NotFoundException(__('Invalid tab'));
        }

        $this->DashboardTab->id = $tabId;
        $this->DashboardTab->saveField('shared', 0);
        $this->redirect([
            'action' => 'index',
            $tabId,
        ]);
    }


    public function saveStatuslistSettings () {
        $this->layout = "blank";
        $error = null;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }

        if (isset($this->request->data['widgetId']) && isset($this->request->data['settings']) && isset($this->request->data['widgetTypeId'])) {
            $widgetId = $this->request->data['widgetId'];
            $settings = $this->request->data['settings'];
            $widgetTypeId = $this->request->data['widgetTypeId'];

            if ($widgetTypeId == 9 || $widgetTypeId == 10) {
                if ($widgetTypeId == 9) {
                    $contain = 'WidgetHostStatusList';
                }

                if ($widgetTypeId == 10) {
                    $contain = 'WidgetServiceStatusList';
                }
                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            $contain,
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        foreach ($settings as $dbField => $value) {
                            if ($value !== null && isset($widget[$contain][$dbField])) {
                                $widget[$contain][$dbField] = $value;
                            }
                        }
                        $this->Widget->saveAll($widget);
                        $this->DashboardTab->id = $widget['DashboardTab']['id'];
                        $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
                    }
                }
            }
        }
        $this->set(compact(['error']));
        $this->set('_serialize', ['error']);
        return;
    }

    public function saveDowntimeListSettings () {
        $this->layout = "blank";
        $error = null;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }

        if (isset($this->request->data['widgetId']) && isset($this->request->data['settings']) && isset($this->request->data['widgetTypeId'])) {
            $widgetId = $this->request->data['widgetId'];
            $settings = $this->request->data['settings'];
            $widgetTypeId = $this->request->data['widgetTypeId'];

            if ($widgetTypeId == 5 || $widgetTypeId == 6) {
                if ($widgetTypeId == 5) {
                    $contain = 'WidgetHostDowntimeList';
                }

                if ($widgetTypeId == 6) {
                    $contain = 'WidgetServiceDowntimeList';
                }
                if ($this->Widget->exists($widgetId)) {
                    $userId = $this->Auth->user('id');
                    $widget = $this->Widget->find('first', [
                        'contain'    => [
                            $contain,
                            'DashboardTab',
                        ],
                        'conditions' => [
                            'Widget.id' => $widgetId,
                        ],
                    ]);
                    if ($widget['DashboardTab']['user_id'] == $userId) {
                        foreach ($settings as $dbField => $value) {
                            if ($value !== null && isset($widget[$contain][$dbField])) {
                                $widget[$contain][$dbField] = $value;
                            }
                        }
                        $this->Widget->saveAll($widget);
                        $this->DashboardTab->id = $widget['DashboardTab']['id'];
                        $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
                    }
                }
            }
        }
        $this->set(compact(['error']));
        $this->set('_serialize', ['error']);
        return;
    }

    public function getTachoPerfdata ($serviceId) {
        $this->layout = 'blank';
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }
        if (!$this->Service->exists($serviceId)) {
            throw new NotFoundException('Invalid service');
        }

        $service = $this->Service->find('first', [
            'recursive'  => -1,
            'fields'     => [
                'Service.id',
                'Service.uuid'
            ],
            'conditions' => [
                'Service.id' => $serviceId
            ]
        ]);

        $ServicestatusFields = new \itnovum\openITCOCKPIT\Core\ServicestatusFields($this->DbBackend);
        $ServicestatusFields->perfdata()->nextCheck();
        $servicestatus = $this->Servicestatus->byUuid($service['Service']['uuid'], $ServicestatusFields);

        if (isset($servicestatus['Servicestatus'])) {
            $Servicestatus = new \itnovum\openITCOCKPIT\Core\Servicestatus(
                $servicestatus['Servicestatus']
            );
        } else {
            $error = 'servicestatus not available';
            $this->set(compact(['error']));
            $this->set('_serialize', ['error']);
            return;
        }


        $perfdata = [];
        $_perfdata = $this->Rrd->parsePerfData($Servicestatus->getPerfdata());
        $keys = ['current', 'unit', 'warn', 'crit', 'min', 'max'];
        foreach ($_perfdata as $dsName => $data) {
            foreach ($keys as $key) {
                if (isset($data[$key])) {
                    if ($data[$key] == '' && $key !== 'unit') {
                        $data[$key] = 0;
                    }
                    $perfdata[$dsName][$key] = $data[$key];
                } else {
                    $perfdata[$dsName][$key] = 0;
                }
            }
            if ($perfdata[$dsName]['unit'] !== '%') {
                if ($perfdata[$dsName]['max'] == 0) {
                    $perfdata[$dsName]['max'] = $perfdata[$dsName]['warn'] + $perfdata[$dsName]['crit'];
                }
                $perfdata[$dsName]['crit'] = ($perfdata[$dsName]['crit'] / $perfdata[$dsName]['max']) * 100;
                $perfdata[$dsName]['warn'] = ($perfdata[$dsName]['warn'] / $perfdata[$dsName]['max']) * 100;
            } else {
                if ($perfdata[$dsName]['max'] == 0) {
                    $perfdata[$dsName]['max'] = 100;
                }
            }
        }

        $next_check = $Servicestatus->getNextCheck();

        $this->set(compact(['perfdata', 'next_check']));
        $this->set('_serialize', ['perfdata', 'next_check']);
        return;
    }

    public function saveTachoConfig () {
        $this->layout = 'blank';
        $error = null;
        if (!$this->isApiRequest()) {
            throw new MethodNotAllowedException();
        }

        if ($this->request->is('post') || $this->request->is('put')) {
            $tachoConfig = $this->request->data['settings'];
            $service_id = $this->request->data['service_id'];
            $widgetTachoId = null;
            if (isset($this->request->data['tacho_id']) && is_numeric($this->request->data['tacho_id'])) {
                $widgetTachoId = $this->request->data['tacho_id'];
            }

            $requiredKeys = [
                'data_source',
                'min',
                'max',
                'warn',
                'crit',
                'widget_id'
            ];
            foreach ($requiredKeys as $key) {
                if (!isset($tachoConfig[$key]) || $tachoConfig[$key] === '' || !isset($service_id)) {
                    $error = [__('One or more parameters are missing' . $key)];
                    $this->set(compact(['error']));
                    $this->set('_serialize', ['error']);
                    return;
                }
            }

            $userId = $this->Auth->user('id');

            if (!$this->Widget->exists($tachoConfig['widget_id'])) {
                $error = [__('Widget not found')];
            } else {
                $widget = $this->Widget->find('first', [
                    'contain'    => [
                        'WidgetTacho',
                        'DashboardTab',
                    ],
                    'conditions' => [
                        'Widget.id' => $tachoConfig['widget_id'],
                    ],
                ]);

                foreach ($tachoConfig as $dbField => $value) {
                    if ($value !== null) {
                        $widget['WidgetTacho'][$dbField] = $value;
                    }
                }

                if ($widgetTachoId !== null) {
                    $tachoConfig['id'] = $widgetTachoId;
                    if ($widget['DashboardTab']['user_id'] == $userId) {

                        $this->Widget->saveAll($widget);
                        $this->Widget->saveField('service_id', $service_id);
                        $this->DashboardTab->id = $widget['DashboardTab']['id'];
                        $this->DashboardTab->saveField('modified', date('Y-m-d H:i:s'));
                    }
                } else {
                    $data = [
                        'WidgetTacho' => $widget['WidgetTacho']
                    ];
                    if ($this->WidgetTacho->save($data)) {
                        $this->Widget->id = $widget['WidgetTacho']['widget_id'];
                        $this->Widget->saveField('service_id', $service_id);

                        $widget = $this->Widget->find('first', [
                            'contain'    => [
                                'WidgetTacho',
                                'DashboardTab',
                            ],
                            'conditions' => [
                                'Widget.id' => $tachoConfig['widget_id'],
                            ],
                        ]);
                        $TachoId = $widget['WidgetTacho']['id'];

                    } else {
                        $error = __('Tacho could not be saved');
                    }
                }

            }

        }
        if (isset($TachoId)) {
            $this->set(compact(['error', 'TachoId']));
            $this->set('_serialize', ['error', 'TachoId']);
            return;
        }
        $this->set(compact(['error']));
        $this->set('_serialize', ['error']);
        return;
    }


}
