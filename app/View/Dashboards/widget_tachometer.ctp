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
        <div class="row margin-bottom-10">
            <input class="form-control" type="text" placeholder="Widget title" ng-model="title"
                   ng-model-options="{debounce: 1000}">
            <span class="note">
                <i class="fa fa-check text-success"></i>
                <?php echo __('Change title to update and save instantly'); ?>
            </span>
        </div>

        <div class="row margin-top-10">
            <div class="col col-xs-12">
                <select id="ServiceId"
                        data-placeholder="<?php echo __('Please select...'); ?>"
                        class="form-control"
                        chosen="services"
                        callback="loadServices"
                        ng-options="value.id as value.label group by value.group for value in services"
                        ng-model="widget.serviceId"
                >
                </select>
            </div>
        </div>

        <div class="row margin-top-10">
            <label class="col col-md-3 control-label margin-top-8">
                <?php echo __('Datasource'); ?>
            </label>
            <div class="col col-xs-9">
                <select id="ServiceId"
                        data-placeholder="<?php echo __('Please select...'); ?>"
                        class="form-control"
                        chosen="datasources"
                        callback="loadDatasources"
                        ng-options="value.id as value.label for value in datasources"
                        ng-model="widget.datasource"
                >
                </select>
            </div>
        </div>
        <div class="row margin-top-10">
            <label class="col col-md-3 control-label margin-top-8">
                <?php echo __('Minimum'); ?>
            </label>
            <div class="col col-xs-9">
                <input class="form-control" type="text" placeholder="<?php echo __('Minimum'); ?>"
                       ng-model="widget.minval"
                       ng-model-options="{debounce: 1000}">
            </div>
        </div>
        <div class="row margin-top-10">
            <label class="col col-md-3 control-label margin-top-8">
                <?php echo __('Maximum'); ?>
            </label>
            <div class="col col-xs-9">
                <input class="form-control" type="text" placeholder="<?php echo __('Maximum'); ?>"
                       ng-model="widget.maxval"
                       ng-model-options="{debounce: 1000}">
            </div>
        </div>
        <div class="row margin-top-10">
            <label class="col col-md-3 control-label margin-top-8">
                <?php echo __('Warning'); ?> %
            </label>
            <div class="col col-xs-9">
                <input class="form-control" type="text" placeholder="<?php echo __('Warning'); ?> %"
                       ng-model="widget.warnPercent"
                       ng-model-options="{debounce: 1000}">
            </div>
        </div>
        <div class="row margin-top-10">
            <label class="col col-md-3 control-label margin-top-8">
                <?php echo __('Critical'); ?> %
            </label>
            <div class="col col-xs-9">
                <input class="form-control" type="text" placeholder="<?php echo __('Critical'); ?> %"
                       ng-model="widget.critPercent"
                       ng-model-options="{debounce: 1000}">
            </div>
        </div>

    </div>


    <div class="widget-body padding-0 not-draggable">

        <div class="text-center">
            <?php if ($this->Acl->hasPermission('browser', 'services')): ?>
                <a ng-attr-href="{{ widget.serviceId ? url : '#none'}}">
                    <canvas style="margin: 0px auto 0px auto;" id="canvas-{{id}}"></canvas>
                </a>
            <?php else: ?>
                <canvas style="margin: 0px auto 0px auto;" id="canvas-{{id}}"></canvas>
            <?php endif; ?>
        </div>

    </div>
</div>
