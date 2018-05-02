<header dashboard-widget-header-directive=""
        class="ui-draggable-handle pointer"
        wtitle="title"
        wid="id"
        update-title="updateTitle({id:id,title:title})">
</header>

<div class="content" style="">

    <!-- widget edit box -->
    <div class="jarviswidget-editbox not-draggable" style="display: none;">
        <!-- This area used as dropdown edit box -->
        <input class="form-control" type="text" placeholder="Widget title" ng-model="title"
               ng-model-options="{debounce: 1000}">
        <span class="note"><i class="fa fa-check text-success"></i>
            <?php echo __('Change title to update and save instantly'); ?>
        </span>
        <hr>
        <div class="col col-xs-12" ng-show="widget.host_id">
            <select id="grafanaHost-{{id}}"
                    data-placeholder="<?php echo __('Please select...'); ?>"
                    class="form-control"
                    chosen="services"
                    ng-options="grafanaHost.GrafanaDashboard.host_id as grafanaHost.Host.name for grafanaHost in widget.GrafanaHostList"
                    ng-model="widget.host_id">
            </select>
        </div>
    </div>


    <div class="widget-body padding-0 not-draggable">
        <div class="col col-xs-12" ng-show="(!widget.host_id && !error) || error == 'Invalid widget configuration'">
            <select id="grafanaHost-{{id}}"
                    data-placeholder="<?php echo __('Please select...'); ?>"
                    class="form-control"
                    chosen="services"
                    ng-options="grafanaHost.GrafanaDashboard.host_id as grafanaHost.Host.name for grafanaHost in widget.GrafanaHostList"
                    ng-model="widget.host_id">
            </select>
        </div>
        <div class="col col-xs-12" ng-show="error">
            <p ng-bind="error" class="font-lg text-danger margin-top-10"></p>
        </div>
        <iframe id="grafana-iframe-{{id}}"
                ng-show="widget.host_id && !error"
                style="border: 0px none; overflow: hidden;"
                scrolling="no"
                width="100%"
                height="100%">
        </iframe>
    </div>
</div>
