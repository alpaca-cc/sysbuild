import ko from 'knockout';
import templateMarkup from 'text!./compiler-controls.html';
import { notify } from 'app/notifications';
import * as SysGlobalObservables from 'app/sys-global-observables';

class CompilerControls {
    constructor(params) {
        this.gccOptsError = params.gccOptsError;
        this.buildCmd = params.buildCmd;
        this.execCmd = params.execCmd;
        this.compileStatus = params.compileStatus;
        this.compileBtnTooltip = params.compileBtnTooltip;
        this.test_checked = false;
        this.defaultBuildCmd = this.buildCmd();
        this.runtestBuildCmd = 'gcc -lm -Wall -fmax-errors=10 -Wextra program.c test.c -o program';
        this.compileBtnEnable = ko.pureComputed(() => {
            const ready = !(this.compileStatus() === 'Waiting' || this.compileStatus() === 'Compiling');
            if (ready) {
                notify('The compiler is now online', 'green');
            } else {
                notify('The compiler is currently busy', 'yellow');
            }
            return ready;
        });

        SysGlobalObservables.compileBtnEnable(this.compileBtnEnable);

        const $compileBtn = $('#compile-btn');
        $compileBtn.click(() => {
            params.compileCallback();
            $compileBtn.popover('hide');
        });

        // Initialize Bootstrap popovers
        $compileBtn.popover();
        // We don't want the "gcc opts errors" popover to be dismissed when clicked
        $('#gccoptions').popover().click((e) => { e.preventDefault(); });

        const $runtestCheckbox = $('#runtestCheckbox');
        $runtestCheckbox.click(() => {
            this.test_checked = !this.test_checked;
            if (this.test_checked) {
                this.buildCmd(this.runtestBuildCmd);
            } else {
                this.buildCmd(this.defaultBuildCmd);
            }
        });
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: CompilerControls, template: templateMarkup };
