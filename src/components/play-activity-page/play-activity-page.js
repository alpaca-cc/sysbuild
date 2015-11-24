import ko from 'knockout';
import templateMarkup from 'text!./play-activity-page.html';

class PlayActivityPage {
    constructor(params) {
        this.message = ko.observable('Hello from the play-activity-page component!');
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: PlayActivityPage, template: templateMarkup };
