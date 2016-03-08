import $ from 'jquery';
import packages from '../utils/packages';

// Themes Switcher Warning
$(document).on('mousedown', '[data-remodal-target="theme-switch-warn"]', (event) => {
    let name = $(event.target).closest('[data-gpm-theme]').find('.gpm-name a:first').text();
    let remodal = $('.remodal.theme-switcher');

    remodal.find('strong').text(name);
    remodal.find('.button.continue').attr('href', $(event.target).attr('href'));
});

// Removing theme
$(document).on('click', '[data-theme-action="remove-theme"]', (event) => {
    packages.handleRemovingPackage('theme', event);
});

$(document).on('click', '[data-theme-action="remove-dependency-package"]', (event) => {
    packages.handleRemovingDependency('theme', event);
});

// Opened the add new theme modal
$(document).on('click', '[data-theme-action="get-package-dependencies"]', (event) => {
    packages.handleGettingPackageDependencies('theme', event);
});

// Install a theme dependencies and the theme
$(document).on('click', '[data-theme-action="install-dependencies-and-package"]', (event) => {
    packages.handleInstallingDependenciesAndPackage('theme', event);
});

// Install a theme
$(document).on('click', '[data-theme-action="install-package"]', (event) => {
    packages.handleInstallingPackage('theme', event);
});

