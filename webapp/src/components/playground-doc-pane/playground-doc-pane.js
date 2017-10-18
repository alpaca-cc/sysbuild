import ko from 'knockout';
import templateMarkup from 'text!./playground-doc-pane.html';
import marked from 'marked';
import { notify } from 'app/notifications';
import * as SysGlobalObservables from 'app/sys-global-observables';
import lessons from 'app/lessons';
import SysFileSystem from 'app/sys-filesystem';
import sysRuntime from 'app/sys-runtime';

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

        sysRuntime.addListener('ready', () => {
            this.fs = SysFileSystem;
            if (params.doc.testcode) {
                this.fs.writeFile('test.c', params.doc.testcode);
            }
        });
        /*

        */
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: PlaygroundDocPane, template: templateMarkup };
