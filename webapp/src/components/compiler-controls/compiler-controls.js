import ko from 'knockout';
import templateMarkup from 'text!./compiler-controls.html';
import { notify } from 'app/notifications';
import * as SysGlobalObservables from 'app/sys-global-observables';

class CompilerControls {
    constructor(params) {
        // console.log('The params for CompilerControls is: ', params);
        this.gccOptsError = params.gccOptsError;
        this.buildCmd = params.buildCmd;
        this.execCmd = params.execCmd;
        this.compileStatus = params.compileStatus;
        this.compileBtnTooltip = params.compileBtnTooltip;
        // For c++ commands
        this.selectedLanguage = SysGlobalObservables.editorSelectedLanguage;
        this.defaultCppBuildCmd = params.defaultCppBuildCmd;
        this.defaultCppExecCmd = params.defaultCppExecCmd;
        this.lastLanguage = 'c';
        this.lastBuildCmd = this.buildCmd();
        this.lastExecCmd = this.execCmd();
        this.editor = SysGlobalObservables.editor;
        // For tests running
        this.test_checked = false;
        this.defaultBuildCmd = this.buildCmd();
        this.runtestBuildCmd = params.testCmd;

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

        this.runtestBtnEnable = ko.pureComputed(() => {
            let ret = true;
            if (this.runtestBuildCmd === undefined || this.selectedLanguage() === 'c++') {
                ret = false;
            }
            return ret;
        });

        SysGlobalObservables.runtestBtnEnable(this.runtestBtnEnable);

        const $compileBtn = $('#compile-btn');
        $compileBtn.click(() => {
            // SysGlobalObservables.editor = this.editor;
            params.compileCallback();
            $compileBtn.popover('hide');
        });

        // Initialize Bootstrap popovers
        $compileBtn.popover();
        // We don't want the "gcc opts errors" popover to be dismissed when clicked
        $('#gccoptions').popover().click((e) => { e.preventDefault(); });

        // Check if run test box is checked.
        const $runtestCheckbox = $('#runtestCheckbox');
        $runtestCheckbox.click(() => {
            this.test_checked = !this.test_checked;
                if (this.test_checked) {
                    this.buildCmd(this.runtestBuildCmd);
                    this.lastBuildCmd = this.buildCmd();
                } else {
                    this.buildCmd(this.defaultBuildCmd);
                    this.lastBuildCmd = this.buildCmd();
                }
        });

        this.selectedLanguage.subscribe(() => {
            if (this.selectedLanguage() !== this.lastLanguage) {
                this.lastLanguage = this.selectedLanguage();
                if (this.selectedLanguage() === 'c++') {
                    this.buildCmd(this.defaultCppBuildCmd);
                    this.execCmd(this.defaultCppExecCmd);
                } else if (this.selectedLanguage() === 'c') {
                    this.buildCmd(this.lastBuildCmd);
                    this.execCmd(this.lastExecCmd);
                }
            }
        });
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: CompilerControls, template: templateMarkup };
