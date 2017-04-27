import ko from 'knockout';
import templateMarkup from 'text!./playground-doc-pane.html';
import marked from 'marked';
import { notify } from 'app/notifications';
import * as SysGlobalObservables from 'app/sys-global-observables';
import lessons from 'app/lessons';
import SysFileSystem from 'app/sys-filesystem';
import sysRuntime from 'app/sys-runtime';
import LiveEdit from 'app/live-edit';

class PlaygroundDocPane {
    constructor(params) {
        this.docHtml = ko.observable('');
        const processFunc = params.doc.format === 'markdown' ? marked : (data) => data;
        if (params.doc.url) {
            $.get(params.doc.url, (data) => {
                this.docHtml(processFunc(data));
            });
        } else {
            this.docHtml(processFunc(params.doc.text));
        }
        this.fs = SysFileSystem;
        this.live_edit =LiveEdit
        this.runtestBtnEnable = ko.pureComputed(() => {
            /*
            const ready = !(this.compileStatus() === 'Waiting' || this.compileStatus() === 'Compiling');
            if (ready) {
                notify('The compiler is now online', 'green');
            } else {
                notify('The compiler is currently busy', 'yellow');
            }
            return ready;
            */
            
            return true
        });

        SysGlobalObservables.runtestBtnEnable(this.runtestBtnEnable);

        const $runtestBtn = $('#runtest-btn');
        $runtestBtn.click(() => {
            // params.compileCallback();
            // $compileBtn.popover('hide');
            console.log("Run button is clicked" + params.doc.testcode)
            // Write testcode to /home/user/tests/test.c
            this.fs.writeFile("test.c", params.doc.testcode)
            //LiveEdit.runCode("gcc test.c program.c -o program")
            sysRuntime.sendExecCmd("echo \\#\\#\\#GCC_COMPILE\\#\\#\\#;clear;pwd;gcc test.c program.c -o program;clear;./program;")
            //sysRuntime.sendExecCmd("./program")
        });

        // Initialize Bootstrap popovers
        $runtestBtn.popover();
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: PlaygroundDocPane, template: templateMarkup };
