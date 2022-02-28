========
Calendar
========

The napari calendar is an HTML element you can include anywhere using the
``napari-calendar`` directive:

.. code-block:: rst

   .. napari-calendar::

To use the calendar, you'll need to find out the calendar ID of the calendar you
want to use, and create a Google Calendar API token:
https://console.developers.google.com/flows/enableapi?apiid=calendar

Next, you'll need to pass the calendar ID and API key to the Sphinx build
process as environment variables:

.. code-block:: sh

   GOOGLE_CALENDAR_ID=calendar-id GOOGLE_CALENDAR_API_KEY=api-key sphinx-build -b=html docs/ dist/

.. napari-calendar::

-------
Filters
-------

The calendar also includes filters for specific meetings. This can be enabled
using the ``show-filters`` option. Right now, this is hardcoded for napari
meetings, but in the future we could make it configurable.

.. code-block:: rst

   .. napari-calendar::
      :show-filters:

.. napari-calendar::
   :show-filters:
