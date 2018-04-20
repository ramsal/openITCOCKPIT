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

namespace Dashboard\Widget;
class ServiceStatusList extends Widget {
    public $isDefault = false;
    public $icon = 'fa-list-alt';
    public $element = 'service_status_list';
    public $width = 10;
    public $height = 20;
    public $hasInitialConfig = true;
    public $directive = "dashboard-widget-service-status-list-directive";

    public $initialConfig = [
        'WidgetServiceStatusList' => [
            'limit'             => 5,
            'paging_interval'   => 0,
            'paging_autostart'  => 0,
            'show_ok'           => 0,
            'show_warning'      => 1,
            'show_critical'     => 1,
            'show_unknown'      => 1,
            'show_acknowledged' => 0,
            'show_downtime'     => 0,
        ],
    ];

    public function __construct (\Controller $controller, $QueryCache) {
        parent::__construct($controller, $QueryCache);
        $this->typeId = 10;
        $this->title = __('Service status list');
    }

}
