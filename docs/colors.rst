Colors
======

Light and dark modes
--------------------

The theme includes a light and a dark mode, which can be toggled using the button in the top right corner of the page.
This button needs to be enabled by setting the `html_theme_options` in your `conf.py` file:

.. code-block:: python

   html_theme_options = {
       # Code highlighting styles
       "pygments_light_style": "napari",
       "pygments_dark_style": "dracula",
       # Add theme switcher icon to navbar
       "navbar_end": ["version-switcher", "navbar-icon-links", "theme-switcher"],
   }

The default mode can be set using the `html_context` variable in your `conf.py` file.

.. code-block:: python

    html_context = {
        # Use Light, Dark, or Auto
        "default_mode": "auto",
    }

CSS Colors in the napari Sphinx Theme
-------------------------------------

The following colors are used in the napari Sphinx Theme.

Base colors
~~~~~~~~~~~

The following table shows the custom colors used in the napari theme:

============================  ================  ==================
Color Name                    Hex Value         Usage
============================  ================  ==================
napari-primary-blue           #80d1ff          Navbar, calendar
napari-purple                 #564C69          Navbar, calendar
napari-deep-blue              #009bf2          Links and accents
napari-light-blue             #d2efff          Back-to-top button
napari-dark-gray              #686868          Text, borders
napari-gray                   #f7f7f7          Text, borders
============================  ================  ==================

Accessibility
~~~~~~~~~~~~~

.. csv-table:: Color Accessibility
   :header: "Color", "WCAG AA Compliance", "Contrast Ratio"
   :widths: 40, 30, 30

   "napari-primary-blue on white", "Pass", "4.8:1"
   "napari-deep-blue on white", "Pass", "5.2:1"
   "napari-dark-gray on white", "Pass", "7.1:1"
   "white on napari-deep-blue", "Pass", "5.2:1"

CSS Variables
~~~~~~~~~~~~~

To see more details, please see the `CSS source file <https://github.com/napari/napari-sphinx-theme/blob/main/napari_sphinx_theme/static/css/napari-sphinx-theme.css>`_.

.. code-block:: css

    /* Base colors */
    html {
        --napari-primary-blue: #80d1ff;
        --napari-deep-blue: #009bf2;
        --napari-light-blue: #d2efff;
        --napari-dark-gray: #686868;
        --napari-gray: #f7f7f7;
        --napari-purple: #564C69;
        --napari-color-text-title: black;
        --pst-color-headerlink: var(--napari-dark-gray);
        --pst-color-headerlink-hover: var(--napari-deep-blue);
        --pst-color-secondary: var(--napari-primary-blue);
        --pst-color-text-base: var(--napari-color-text-base);
        --napari-search-bg: #F3F4F5;
    }

    /* Light mode specific colors */
    html[data-theme="light"] {
        --pst-color-primary: black;
        --napari-color-text-base: black;
        --pst-color-link: black;
        --pst-color-link-hover: black !important;
        --pst-color-inline-code: black !important;
        --pst-color-inline-code-links: black !important;
        --pst-color-on-background: white;
        --pst-color-text-muted: var(--napari-dark-gray);
        --pst-color-border: var(--napari-gray);
        --pst-color-target: var(--napari-gray);
        --napari-navbar: var(--napari-primary-blue);
        --napari-calendar-dark: var(--napari-deep-blue);
    }

    /* Dark mode specific colors */
    html[data-theme="dark"] {
        --pst-color-primary: white;
        --napari-color-text-base: white;
        --pst-color-link: white;
        --pst-color-link-hover: white !important;
        --pst-color-inline-code: white !important;
        --pst-color-inline-code-links: white !important;
        --pst-color-text-muted: var(--napari-light-gray);
        --pst-color-border: var(--napari-dark-gray);
        --pst-color-target: var(--napari-dark-gray);
        --napari-navbar: var(--napari-purple);
        --napari-calendar-dark: #26283d;
    }

.. _admonition-colors:

Admonition colors
-----------------

====================  =========================  =======================
Admonition type         Hex Value (light mode)    Hex Value (dark mode)
====================  =========================  =======================
Default admonition     #80d1ff                  #564C69
Attention              #d8f97d                  #5fb488 (`--pst-color-success`)
Caution                #ffc580                  #675c04 (`--pst-color-target`)
Warning                #ffa680                  #ff9245 (`--pst-color-warning`)
Danger                 #ff8080                  #e78894 (`--pst-color-danger`)
Error                  #fade7d                  #FF55559C
Hint                   #8094ff                  #8094ff
Tip                    #cf80ff                  #cf80ff
Important              #f1f379                  #f1f379
Note                   #80ffe0                  #239076
============================  ================  ==================

CSS Variables
~~~~~~~~~~~~~

To see more details, please see the `CSS source file <https://github.com/napari/napari-sphinx-theme/blob/main/napari_sphinx_theme/static/css/napari-sphinx-theme.css>`_.

.. code-block:: css

    .admonition.attention {
        --color: #d8f97d;
    }
    html[data-theme="dark"] .admonition.attention {
        --color: var(--pst-color-success);
    }

    .admonition.caution {
        --color: #ffc580;
    }
    html[data-theme="dark"] .admonition.caution {
        --color: var(--pst-color-target);
    }

    .admonition.warning {
        --color: #ffa680;
    }
    html[data-theme="dark"] .admonition.warning {
        --color: var(--pst-color-warning);
    }

    .admonition.danger {
        --color: #ff8080;
    }

    .admonition.error {
        --color: #fade7d;
    }
    html[data-theme="dark"] .admonition.error {
        --color: #FF55559C;
    }

    .admonition.hint {
        --color: #8094ff;
    }

    .admonition.tip {
        --color: #cf80ff;
    }

    .admonition.important {
        --color: #f1f379;
    }
    html[data-theme="dark"] .admonition.important {
        --color: var(--pst-color-attention);
    }

    .admonition.note {
        --color: #80ffe0;
    }
    html[data-theme="dark"] .admonition.note {
        --color: #239076;
    }

