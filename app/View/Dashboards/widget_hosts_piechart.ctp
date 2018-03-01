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
                    <div class="col-md-4 no-padding">
                        <a href="/hosts/index?filter%5BHoststatus.current_state%5D%5B0%5D=1&amp;sort=Hoststatus.last_state_change&amp;direction=desc">
                            <i class="fa fa-square ok"></i>
                            {{widget.up[0]}} ({{widget.up[1]}} %) </a>
                    </div>
                    <div class="col-md-4 no-padding">
                        <a href="/hosts/index?filter%5BHoststatus.current_state%5D%5B1%5D=1&amp;sort=Hoststatus.last_state_change&amp;direction=desc">
                            <i class="fa fa-square critical"></i>
                            {{widget.down[0]}} ({{widget.down[1]}} %) </a>
                    </div>
                    <div class="col-md-4 no-padding">
                        <a href="/hosts/index?filter%5BHoststatus.current_state%5D%5B2%5D=1&amp;sort=Hoststatus.last_state_change&amp;direction=desc">
                            <i class="fa fa-square unknown"></i>
                            {{widget.unreachable[0]}} ({{widget.unreachable[1]}} %) </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>