<header dashboard-widget-header-directive=""
        class="ui-draggable-handle pointer"
        wtitle="title"
        wid="id"
        update-title="updateTitle({id:id,title:title})">
</header>

<div class="content">

    <!-- widget edit box -->
    <div class="jarviswidget-editbox not-draggable" style="display: none;">
        <!-- This area used as dropdown edit box -->
        <input class="form-control" type="text" placeholder="Widget title" ng-model="title"
               ng-model-options="{debounce: 1000}">
        <span class="note"><i class="fa fa-check text-success"></i>
            <?php echo __('Change title to update and save instantly'); ?>
        </span>
        <hr>
        <div class="form-group smart-form">
            <div class="col-xs-6">
                <label class="checkbox small-checkbox-label display-inline margin-right-5">
                    <input type="checkbox" name="checkbox" checked=""
                           ng-model="downtimeListSettings.minify"
                           ng-model-options="{debounce: 500}">
                    <i class="checkbox-primary"></i>
                    <?php echo __('Minify list'); ?>
                </label>
                <label ng-show="downtimeListSettings.minify" class="small-checkbox-label display-inline margin-right-5">
                    <input type="number" min="0" name="limitbox" style="height:0px;"
                           ng-model="downtimeListSettings.limit"
                           ng-model-options="{debounce: 500}">
                    <?php echo __('Limit (0=default user setting)'); ?>
                </label>
            </div>
            <div class="col-xs-6" ng-show="downtimeListSettings.minify">
                <label class="checkbox small-checkbox-label display-inline margin-right-5">
                    <input type="checkbox" name="checkbox" checked="checked"
                           ng-model="downtimeListSettings.filter.isRunning"
                           ng-model-options="{debounce: 500}">
                    <i class="checkbox-primary"></i>
                    <?php echo __('Is running'); ?>
                </label>

                <label class="checkbox small-checkbox-label display-inline margin-right-5">
                    <input type="checkbox" name="checkbox" checked="checked"
                           ng-model="downtimeListSettings.filter.DowntimeHost.was_not_cancelled"
                           ng-model-options="{debounce: 500}">
                    <i class="checkbox-primary"></i>
                    <?php echo __('Was not cancelled'); ?>
                </label>

                <label class="checkbox small-checkbox-label display-inline margin-right-5">
                    <input type="checkbox" name="checkbox" checked="checked"
                           ng-model="downtimeListSettings.filter.DowntimeHost.was_cancelled"
                           ng-model-options="{debounce: 500}">
                    <i class="checkbox-primary"></i>
                    <?php echo __('Was cancelled'); ?>
                </label>

                <label class="checkbox small-checkbox-label display-inline margin-right-5">
                    <input type="checkbox" name="checkbox" checked="checked"
                           ng-model="downtimeListSettings.filter.hideExpired"
                           ng-model-options="{debounce: 500}">
                    <i class="checkbox-primary"></i>
                    <?php echo __('Hide expired'); ?>
                </label>
            </div>
        </div>
    </div>

    <div ng-show="downtimeListSettings.minify" class="widget-body padding-0 not-draggable">
        <div class="table-responsive" style="overflow-y: auto; height: {{widgetheight}}px;">
            <table class="table table-bordered table-striped">
                <tbody>
                <tr ng-repeat="downtime in downtimes">
                    <td title="{{ downtime.Host.hostname }}" class="dashboard-table">
                        <?php if ($this->Acl->hasPermission('browser', 'services')): ?>
                            <a href="/services/browser/{{ downtime.Host.id }}">
                                {{ downtime.Host.hostname }}/{{ downtime.Service.servicename }}
                            </a>
                        <?php else: ?>
                            {{ downtime.Host.hostname }}/{{ downtime.Service.servicename }}
                        <?php endif; ?>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div ng-show="!downtimeListSettings.minify" class="widget-body padding-0 not-draggable" style="overflow:hidden;">

        <div class="padding-10" style="border: 1px solid #c3c3c3;">
            <div class="row">
                <div class="col-xs-2">
                    <a href="javascript:void(0);" ng-show="paging_autostart" ng-click="pausePaging()"
                       data-widget-id="21" title="<?php echo __('disable paging'); ?>"
                       class="btn btn-default btn-xs stopRotation btn-primary"><i class="fa fa-pause"></i></a>
                    <a href="javascript:void(0);" ng-show="!paging_autostart"
                       ng-click="startPaging()" data-widget-id="21" title="<?php echo __('enable paging'); ?>"
                       class="btn btn-default btn-xs startRotation btn-primary"><i class="fa fa-play"></i></a>
                </div>
                <div class="col-xs-4 height-45px">
                    <div class="form-group form-group-slider">

                        <label class="display-inline">
                            <?php echo __('Paging interval:'); ?>
                            <span class="note" id="PagingInterval_human">
                                {{pagingTimeString}}
                            </span>
                        </label>

                        <div class="slidecontainer">
                            <input type="range" step="5" min="0" max="300" class="slider"
                                   ng-model="viewPagingInterval" ng-mouseup="savePagingInterval()">
                        </div>

                    </div>
                </div>
                <div class="col-xs-6 ">
                    <div class="form-group smart-form">
                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="downtimeListSettings.filter.isRunning"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('Is running'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="downtimeListSettings.filter.DowntimeHost.was_not_cancelled"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('Was not cancelled'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="downtimeListSettings.filter.DowntimeHost.was_cancelled"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('Was cancelled'); ?>
                        </label>

                        <label class="checkbox small-checkbox-label display-inline margin-right-5">
                            <input type="checkbox" name="checkbox" checked="checked"
                                   ng-model="downtimeListSettings.filter.hideExpired"
                                   ng-model-options="{debounce: 500}">
                            <i class="checkbox-primary"></i>
                            <?php echo __('Hide expired'); ?>
                        </label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12 col-md-6">
                    <div class="form-group smart-form">
                        <label class="input"> <i class="icon-prepend fa fa-filter"></i>
                            <input type="text" class="input-sm"
                                   placeholder="<?php echo __('Filter by host name'); ?>"
                                   ng-model="downtimeListSettings.filter.Host.name"
                                   ng-model-options="{debounce: 500}">
                        </label>
                    </div>
                </div>
                <div class="col-xs-12 col-md-6">
                    <div class="form-group smart-form">
                        <label class="input"> <i class="icon-prepend fa fa-filter"></i>
                            <input type="text" class="input-sm"
                                   placeholder="<?php echo __('Filter by service name'); ?>"
                                   ng-model="downtimeListSettings.filter.Service.name"
                                   ng-model-options="{debounce: 500}">
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div ng-show="!downtimes.length" class="text-center text-success">
            <h5 class="padding-top-50">
                <i class="fa fa-check"></i>
                <?php echo __('Currently are no services in scheduled downtime'); ?>
            </h5>
        </div>

        <div ng-show="downtimes.length" id="mobile_table{{id}}" class="mobile_table margin-top-10"
             style="overflow: hidden; height: 200px;">
            <table id="host_list"
                   class="table table-striped table-hover table-bordered smart-form"
                   style="">
                <thead>
                <tr>
                    <th class="no-sort"><?php echo __('Running'); ?></th>

                    <th class="no-sort" ng-click="orderBy('Host.name')">
                        <i class="fa" ng-class="getSortClass('Host.name')"></i>
                        <?php echo __('Host'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('Service.name')">
                        <i class="fa" ng-class="getSortClass('Service.name')"></i>
                        <?php echo __('Service'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('DowntimeService.author_name')">
                        <i class="fa" ng-class="getSortClass('DowntimeService.author_name')"></i>
                        <?php echo __('User'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('DowntimeService.comment_data')">
                        <i class="fa" ng-class="getSortClass('DowntimeService.comment_data')"></i>
                        <?php echo __('Comment'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('DowntimeService.scheduled_start_time')">
                        <i class="fa" ng-class="getSortClass('DowntimeService.scheduled_start_time')"></i>
                        <?php echo __('Start'); ?>
                    </th>
                    <th class="no-sort" ng-click="orderBy('DowntimeService.scheduled_end_time')">
                        <i class="fa" ng-class="getSortClass('DowntimeService.scheduled_end_time')"></i>
                        <?php echo __('End'); ?>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="downtime in downtimes">
                    <td class="text-center">
                        <downtimeicon downtime="downtime.DowntimeService"></downtimeicon>
                    </td>

                    <td>
                        <?php if ($this->Acl->hasPermission('browser', 'hosts')): ?>
                            <a href="/hosts/browser/{{ downtime.Host.id }}">
                                {{ downtime.Host.hostname }}
                            </a>
                        <?php else: ?>
                            {{ downtime.Host.hostname }}
                        <?php endif; ?>
                    </td>

                    <td>
                        <?php if ($this->Acl->hasPermission('browser', 'services')): ?>
                            <a href="/services/browser/{{ downtime.Service.id }}">
                                {{ downtime.Service.servicename }}
                            </a>
                        <?php else: ?>
                            {{ downtime.Service.servicename }}
                        <?php endif; ?>
                    </td>

                    <td>
                        {{downtime.DowntimeService.authorName}}
                    </td>
                    <td>
                        {{downtime.DowntimeService.commentData}}
                    </td>
                    <td>
                        {{downtime.DowntimeService.scheduledStartTime}}
                    </td>
                    <td>
                        {{downtime.DowntimeService.scheduledEndTime}}
                    </td>
                </tr>
                </tbody>
            </table>

        </div>

        <div ng-show="downtimes.length" class="dt-toolbar-footer">
            <div class="col-xs-12 col-sm-4">
                <div class="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite">
                    Showing <span class="txt-color-darken">{{ paging.widget.from }}</span>
                    to <span class="txt-color-darken">{{ paging.widget.to }}</span>
                    of <span class="text-primary">{{ paging.count }}</span> entries
                </div>
            </div>
            <div class="col-xs-12 col-sm-8">
                <div class="dataTables_paginate paging_numbers" id="DataTables_Table_0_paginate">
                    <ul class="pagination pagination-sm">
                        <li class="paginate_button cursor-pointer" aria-controls="DataTables_Table_0" tabindex="0"
                            ng-repeat="i in [].constructor(paging.pageCount) track by $index"
                            ng-class="$index+1==paging.page ? 'active' : ''">
                            <a ng-click="setPage( $index+1 )">{{ $index+1 }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </div>
</div>