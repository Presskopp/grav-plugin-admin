import $ from 'jquery';
import Immutable from 'immutable';
import '../utils/jquery-utils';

let FormLoadState = {};

const DOMBehaviors = {
    attach() {
        this.preventUnload();
        this.preventClickAway();
    },

    preventUnload() {
        if ($._data(window, 'events') && ($._data(window, 'events').beforeunload || []).filter((event) => event.namespace === '_grav')) {
            return;
        }

        // Catch browser uri change / refresh attempt and stop it if the form state is dirty
        $(window).on('beforeunload._grav', () => {
            if (Instance.equals() === false) {
                return 'You have made changes on this page that you have not yet confirmed. If you navigate away from this page you will lose your unsaved changes.';
            }
        });
    },

    preventClickAway() {
        let selector = 'a[href]:not([href^="#"])';

        if ($._data($(selector).get(0), 'events') && ($._data($(selector).get(0), 'events').click || []).filter((event) => event.namespace === '_grav')) {
            return;
        }

        // Prevent clicking away if the form state is dirty
        // instead, display a confirmation before continuing
        $(selector).on('click._grav', function(event) {
            let isClean = Instance.equals();
            if (isClean === null || isClean) { return true; }

            event.preventDefault();

            let destination = $(this).attr('href');
            let modal = $('[data-remodal-id="changes"]');
            let lookup = $.remodal.lookup[modal.data('remodal')];
            let buttons = $('a.button', modal);

            let handler = function(event) {
                event.preventDefault();
                let action = $(this).data('leave-action');

                buttons.off('click', handler);
                lookup.close();

                if (action === 'continue') {
                    $(window).off('beforeunload');
                    window.location.href = destination;
                }
            };

            buttons.on('click', handler);
            lookup.open();
        });
    }
};

export default class FormState {
    constructor(options = {
        ignore: [],
        form_id: 'blueprints'
    }) {
        this.options = options;
        this.refresh();

        if (!this.form || !this.fields.length) { return; }
        FormLoadState = this.collect();
        DOMBehaviors.attach();
    }

    refresh() {
        this.form = $(`form#${this.options.form_id}`).filter(':noparents(.remodal)');
        this.fields = $(`form#${this.options.form_id} *, [form="${this.options.form_id}"]`).filter(':input:not(.no-form)').filter(':noparents(.remodal)');

        return this;
    }

    collect() {
        if (!this.form || !this.fields.length) { return; }

        let values = {};
        this.refresh().fields.each((index, field) => {
            field = $(field);
            let name = field.prop('name');
            let type = field.prop('type');
            let tag = field.prop('tagName').toLowerCase();
            let value;

            switch (type) {
                case 'checkbox':
                case 'radio':
                    value = field.is(':checked');
                    break;
                default:
                    value = field.val();
            }

            if (tag === 'select' && value === null) {
                value = '';
            }

            if (name && !~this.options.ignore.indexOf(name)) {
                values[name] = value;
            }
        });

        return Immutable.OrderedMap(values);
    }

    // When the form doesn't exist or there are no fields, `equals` returns `null`
    // for this reason, _NEVER_ check with !Instance.equals(), use Instance.equals() === false
    equals() {
        if (!this.form || !this.fields.length) { return null; }
        return Immutable.is(FormLoadState, this.collect());
    }
};

export let Instance = new FormState();

export { DOMBehaviors };