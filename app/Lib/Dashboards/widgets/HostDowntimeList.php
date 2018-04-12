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
class HostDowntimeList extends Widget {
    public $isDefault = true;
    public $icon = 'fa-power-off';
    public $element = 'host_downtime_list';
    public $width = 10;
    public $height = 20;
    public $hasInitialConfig = true;
    public $directive = "dashboard-widget-host-downtime-list-directive";

    public $initialConfig = [
        'WidgetHostDowntimeList' => [
            'limit'                  => 5,
            'paging_interval'        => 0,
            'paging_autostart'       => 0,
            'show_is_running'        => 0,
            'show_was_not_cancelled' => 0,
            'show_was_cancelled'     => 0,
            'hide_expired'           => 1,
        ],
    ];

    public function __construct (\Controller $controller, $QueryCache) {
        parent::__construct($controller, $QueryCache);
        $this->typeId = 5;
        $this->title = __('Host downtime list');
    }


    public function getRestoreConfig ($tabId) {
        $restoreConfig = [
            'dashboard_tab_id' => $tabId,
            'type_id'          => $this->typeId,
            'row'              => 24,
            'col'              => 0,
            'width'            => $this->width,
            'height'           => $this->height,
            'title'            => $this->title,
            'color'            => $this->defaultColor,
            'directive'        => $this->directive
        ];

        return $restoreConfig;
    }
}
