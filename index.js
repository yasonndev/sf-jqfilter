(function($) {
    $.fn.entityFilter = function(options) {
        const settings = $.extend({
            dataSource: [],
            initialSelected: [], // Может быть массивом ID или объектов
            placeholder: 'Abr abr igval',
            maxSuggestions: 5,
            mapping: {
                id: 'id',
                name: 'name'
            },
            onSelect: null,
            onRemove: null,
            onChange: null,
        }, options);

        return this.each(function() {
            const $container = $(this);
            let selectedEntities = [];
            const mapping = settings.mapping;

            // init it
            if (Array.isArray(settings.initialSelected)) {
                if (settings.initialSelected.length > 0) {
                    if (typeof settings.initialSelected[0] === 'number') {
                        selectedEntities = settings.initialSelected
                            .map(id => settings.dataSource.find(item => item[mapping.id] === id))
                            .filter(item => !!item);
                    } else {
                        selectedEntities = [...settings.initialSelected];
                    }
                }
            }

            // Create main elements
            const $filterBox = $('<div>').addClass('filter-box');
            const $selectedContainer = $('<div class="selected-entities">').css({ display: 'block' });
            const $input = $('<input>')
                .attr('type', 'text')
                .addClass('search-input form-control')
                .attr('placeholder', settings.placeholder);

            const $suggestions = $('<div>')
                .addClass('suggestions-container')
                .hide();

            const $clearInput = $(
                  '<div class="btn-search-clear">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">'
                + '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>'
                + '</svg>'
                + '</div>'
            ).click(() => {
                $input.val('').focus();
                $suggestions.hide();
            });

            // Build initial structure
            $filterBox.append($input)
                .append($clearInput)
                .append($suggestions)
                .append($selectedContainer);
            $container.append($filterBox);

            // Добавляем метод для получения выбранных ID
            $container.data('getSelectedIds', () =>
                selectedEntities.map(item => item[mapping.id])
            );

            // Update selected entities display
            function updateSelected() {
                $selectedContainer.empty();
                selectedEntities.forEach(entity => {
                    const $entity = $('<div>')
                        .addClass('selected-entity')
                        .html('<div>' + entity[mapping.name] + '</div>')
                        .append($('<div class="remove">'
                            + '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">'
                            + '<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>'
                            + '</svg>'
                            + '</div>'));

                    $entity.find('.remove').click(() => {
                        selectedEntities = selectedEntities.filter(e => e[mapping.id] !== entity[mapping.id]);
                        updateSelected();
                    });

                    $selectedContainer.append($entity);
                });

                if (settings.onChange) settings.onChange(selectedEntities);
            }

            // Show suggestions
            function showSuggestions(results) {
                $suggestions.empty().show();
                results.slice(0, settings.maxSuggestions).forEach(entity => {
                    const $item = $('<div>')
                        .addClass('suggestion-item')
                        .html('<div class="icon">'
                            + '</div>'
                            + '<div class="caption">' + entity[mapping.name] + '</div>')
                        .click(() => {
                            if (!selectedEntities.find(e => e[mapping.id] === entity[mapping.id])) {
                                selectedEntities.push(entity);
                                updateSelected();
                                if (settings.onSelect) settings.onSelect(entity);
                            }
                            $input.val('').focus();
                            $suggestions.hide();
                        });
                    $suggestions.append($item);
                });
            }

            // Handle input
            $input.on('input', function() {
                const query = $(this).val().toLowerCase();
                const results = typeof settings.dataSource === 'function' ?
                    settings.dataSource(query) :
                    settings.dataSource.filter(item =>
                        item.user_login.toLowerCase().includes(query)
                    );
                showSuggestions(results);
            });

            // Hide suggestions when clicking outside
            $(document).mouseup(e => {
                if (!$filterBox.is(e.target) && $filterBox.has(e.target).length === 0) {
                    $suggestions.hide();
                }
            });

            // Initialize
            updateSelected();
        });
    };
}(jQuery));

// Example usage
// <div id="filter-box" class="mb-4"></div>
$(document).ready(function() {
    $('#filter-box').entityFilter({
        dataSource: controllers,
        initialSelected: [5625, 745, 2059, 1437, 1547],
        placeholder: 'enter here',
        mapping: {
            id: 'user_id',
            name: 'user_login'
        },
        maxSuggestions: 21,
        onSelect: function(selected) {
            // console.table('Selected:', selected);
        },
        onRemove: function(removed) {
            // console.table('Rmoved:', removed);
        },
        onChange: function(selected) {

            selected_ids = selected.map(item => item.user_id);

            console.log(selected_ids);
        }
    });
});
