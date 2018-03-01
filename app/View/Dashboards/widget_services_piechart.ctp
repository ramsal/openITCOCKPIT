<?php echo $this->element('Dashboard/widget_header'); ?>

<div class="content" style="">

    <!-- widget edit box -->
    <div class="jarviswidget-editbox not-draggable" style="display: none;">
        <!-- This area used as dropdown edit box -->
        <input class="form-control" type="text" placeholder="Widget title" ng-model="title"
               ng-model-options="{debounce: 1000}">
        <span class="note"><i class="fa fa-check text-success"></i> Change title to update and save instantly</span>

    </div>

    <div class="widget-body padding-0">
        <div class="row no-padding">
            <div class="col-xs-12 text-center">
                <canvas id="myChart{{id}}"></canvas>
                <div class="text-center font-xs margin-top-10">
                    <div class="col-md-3 no-padding">
                        <a href="/services/index?filter%5BServicestatus.current_state%5D%5B0%5D=1&sort=Servicestatus.last_state_change&direction=desc">
                            <i class="fa fa-square ok"></i>
                            {{widget.ok[0]}} ({{widget.ok[1]}} %) </a>
                    </div>
                    <div class="col-md-3 no-padding">
                        <a href="/services/index?filter%5BServicestatus.current_state%5D%5B1%5D=1&sort=Servicestatus.last_state_change&direction=desc">
                            <i class="fa fa-square warning"></i>
                            {{widget.warning[0]}} ({{widget.warning[1]}} %) </a>
                    </div>
                    <div class="col-md-3 no-padding">
                        <a href="/services/index?filter%5BServicestatus.current_state%5D%5B2%5D=1&sort=Servicestatus.last_state_change&direction=desc">
                            <i class="fa fa-square critical"></i>
                            {{widget.critical[0]}} ({{widget.critical[1]}} %) </a>
                    </div>
                    <div class="col-md-3 no-padding">
                        <a href="/services/index?filter%5BServicestatus.current_state%5D%5B3%5D=1&sort=Servicestatus.last_state_change&direction=desc">
                            <i class="fa fa-square unknown"></i>
                            {{widget.unknown[0]}} ({{widget.unknown[1]}} %) </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>