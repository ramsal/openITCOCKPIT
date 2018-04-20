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
    </div>

    <div class="widget-body padding-0">
        <div class="row no-padding">

            <div class="col-xs-12 text-center">
                <div class="text-center" style="height: 199px; width: 399px;margin-left: auto; margin-right: auto;">
                    <canvas id="myChart{{id}}"></canvas>
                </div>
                <div class="text-center font-xs margin-top-10">
                    <?php if ($this->Acl->hasPermission('index', 'hosts')): ?>
                        <div class="col-md-4 no-padding">
                            <a href="/hosts/index?filter%5BHoststatus.current_state%5D%5B0%5D=1&amp;sort=Hoststatus.last_state_change&amp;direction=desc">
                                <i class="fa fa-square ok"></i>
                                {{widget.up[0]}} ({{widget.up[1]}} %)
                            </a>
                        </div>
                        <div class="col-md-4 no-padding">
                            <a href="/hosts/index?filter%5BHoststatus.current_state%5D%5B1%5D=1&amp;sort=Hoststatus.last_state_change&amp;direction=desc">
                                <i class="fa fa-square critical"></i>
                                {{widget.down[0]}} ({{widget.down[1]}} %)
                            </a>
                        </div>
                        <div class="col-md-4 no-padding">
                            <a href="/hosts/index?filter%5BHoststatus.current_state%5D%5B2%5D=1&amp;sort=Hoststatus.last_state_change&amp;direction=desc">
                                <i class="fa fa-square unknown"></i>
                                {{widget.unreachable[0]}} ({{widget.unreachable[1]}} %)
                            </a>
                        </div>
                    <?php else: ?>
                        <div class="col-md-4 no-padding">
                            <i class="fa fa-square ok"></i>
                            {{widget.up[0]}} ({{widget.up[1]}} %)
                        </div>
                        <div class="col-md-4 no-padding">
                            <i class="fa fa-square critical"></i>
                            {{widget.down[0]}} ({{widget.down[1]}} %)
                        </div>
                        <div class="col-md-4 no-padding">
                            <i class="fa fa-square unknown"></i>
                            {{widget.unreachable[0]}} ({{widget.unreachable[1]}} %)
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

</div>