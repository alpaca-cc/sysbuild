import * as SysGlobalObservables from 'app/sys-global-observables';

class LiveEdit {
    constructor(_runtime) {
        this.runtime = _runtime;

        const updateCompileButton = () => {
            const ready = this.runtime.ready();
            SysGlobalObservables.vmState(ready ? 'Running' : 'Booting');
            SysGlobalObservables.compileStatus(ready ? 'Ready' : 'Waiting');
        };

        updateCompileButton(); // Maybe sys is already up and running

        this.runtime.addListener('ready', () => {
            updateCompileButton();
        });

        // Setup callbacks so that the UI can invoke functions on this class
        // as well as on the runtime.
        SysGlobalObservables.focusTerm(this.runtime.focusTerm.bind(this.runtime));
        SysGlobalObservables.runCode(this.runCode.bind(this));
    }

    escapeHtml(unsafe) {
        // stackoverflow.com/questions/6234773/
        return unsafe
             .replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
    }

    processGccCompletion(result) {
        SysGlobalObservables.gccErrorCount(0);
        SysGlobalObservables.gccWarningCount(0);

        if (!result) {
            // cancelled
            SysGlobalObservables.compileStatus('Cancelled');
            return;
        }

        // null if cancelled
        // result = { 'exitcode':gcc_exit_code, 'stats':stats,'annotations':annotations,'gcc_ouput':gcc_output}

        this.runtime.sendKeys('tty0', 'clear\n');

        const aceAnnotations = [];
        const buildCmdErrors = [];
        result.annotations.forEach((annotation) => {
            if (annotation.isBuildCmdError) {
                buildCmdErrors.push(annotation);
            } else {
                aceAnnotations.push(annotation);
            }
        });

        SysGlobalObservables.editorAnnotations(aceAnnotations);
        SysGlobalObservables.lastGccOutput(result.gccOutput);
        SysGlobalObservables.gccErrorCount(result.stats.error);
        SysGlobalObservables.gccWarningCount(result.stats.warning);
        SysGlobalObservables.gccOptsError(buildCmdErrors.map((error) => error.text).join('\n'));

        if (result.exitCode === 0) {
            SysGlobalObservables.compileStatus(result.stats.warning > 0 ? 'Warnings' : 'Success');
            this.runtime.sendExecCmd(SysGlobalObservables.execCmd());
        } else {
            SysGlobalObservables.compileStatus('Failed');
        }
    }

    runCode(buildCmd) {
        SysGlobalObservables.fileBrowser.saveActiveFile();
        if (buildCmd.startsWith('gcc')) {
            const callback = this.processGccCompletion.bind(this);
            SysGlobalObservables.compileStatus('Compiling c');
            this.runtime.startBuild(buildCmd, callback);
        } else if (buildCmd.startsWith('g++')) {
            // let startTime = new Date().getTime();
            const callback = this.processCppCompletion.bind(this);
            this.runCppCode(buildCmd, callback);
            // let endTime = this.runCppCode(buildCmd, callback);
            // console.log(startTime, endTime);
            // console.log("duration [ms] = " + (endTime - startTime));
        }
    }

    processCppCompletion() {
        const runtime = this.runtime;
        // setTimeout(function() {
        //     runtime.sendKeys('tty0', 'chmod 755 hello\n');
        // }, 1500);
        // // setTimeout(function() {
        // //     runtime.sendKeys('tty0', 'clear\n');
        // // }, 1100);
        // // setTimeout(function() {
        // //     runtime.sendKeys('tty0', './hello\n');
        // // }, 1200);
        // this.runtime.sendKeys('tty0', 'clear\n');
        // this.runtime.sendKeys('tty0', 'chmod 755 hello\n');
        // this.runtime.sendKeys('tty0', './hello\n');
        // let endTime = new Date().getTime();
        // return endTime;
        // this.runtime.sendExecCmd(SysGlobalObservables.execCmd());
    }

    runCppCode(buildCmd, callback) {
        // TODO: add compile error handling, add buildCmd handling
        this.sourceCode = SysGlobalObservables.editor.getText();
        SysGlobalObservables.compileStatus('Compiling c++');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:5000/compile/api/v1/compile?compiler=g%2B%2B', true);

        // Send the proper header information along with the request
        xhr.setRequestHeader('Content-type', 'text/plain');
        xhr.setRequestHeader('Accept', 'application/octet-stream');
        xhr.responseType = 'arraybuffer';

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                const content = new Uint8Array(xhr.response);
                SysGlobalObservables.fileBrowser.fs.writeBinaryFile('/' + 'hello', content);
            }
        };
        xhr.send(this.sourceCode);

        callback();
        // let endTime = callback();
        // return endTime;
    }
}

export default LiveEdit;
