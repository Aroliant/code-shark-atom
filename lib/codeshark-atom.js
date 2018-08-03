'use babel';

import {
    CompositeDisposable
} from 'atom';
import SelectListView from './select-list-view'

export default {

    modalPanel: null,
    items: [],

    activate() {

        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'codeshark-atom:toggle': () => this.toggle()
        }));

    },

    deactivate() {
        this.subscriptions.dispose();
    },

    toggle() {

        if (atom.config.get('CodeShark.apikey') == "") {
            //No Api Key

        } else {

            function insertCode(id) {
                var id = id;
                var request = require('request');
                var url = 'https://api.codeshark.live/api/program/';

                var options = {
                    url: url.concat(id),
                    headers: {
                        'X-API-Key': atom.config.get("CodeShark.apikey")
                    }
                };

                function callback(error, response, body) {

                    var itemsArray = []

                    if (!error && response.statusCode == 200) {
                        var res = JSON.parse(body);

                        if (res.success == true) {
                            let editor = atom.workspace.getActiveTextEditor();
                            editor.insertText(res.program.program)
                        }
                    }
                }

                request.post(options, callback);
            }

            function showSearchingView(items) {
                var allItems = items;

                const selectListView = new SelectListView({
                    items: allItems,

                    elementForItem: (item) => {
                        const li = document.createElement('li')
                        li.textContent = item.name
                        return li
                    },

                    didConfirmSelection: (item) => {
                        insertCode(item.id);
                        this.modalPanel.hide()
                    },

                    didCancelSelection: () => {
                        this.modalPanel.hide()
                    }

                });

                this.modalPanel = atom.workspace.addModalPanel({
                    item: selectListView.element,
                    visible: true
                });
                selectListView.focus();
            }

            var request = require('request');

            var options = {
                url: 'https://api.codeshark.live/api/programs/',
                headers: {
                    'X-API-Key': atom.config.get("CodeShark.apikey")
                }
            };

            function callback(error, response, body) {

                var itemsArray = []

                if (!error && response.statusCode == 200) {
                    var res = JSON.parse(body);

                    if (res.success == true) {
                        for (var i = 0; i < res.programs.length; i++) {

                            var it = {
                                name: res.programs[i].title,
                                id: res.programs[i].program_id
                            }

                            itemsArray.push(it)
                        }

                        this.items = itemsArray;
                        showSearchingView(this.items);
                    }

                }
            }
            request.post(options, callback);
        }

    }

};
