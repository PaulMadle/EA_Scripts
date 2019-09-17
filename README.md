# Enterprise Architect Scripts
A collection of scripts that we have found helpful when using enterprise architect.

This consists of:

Remove_All_Connectors.js
========================

This is a Javascript file that should be added to EA Project Browser Group script. It removes all connectors on a diagram as if the user had clicked on each connector and selected "Hide Connector". The connector still remains in the model but is no longer visible on the diagram on which this script was run.


Freeze_Connectors.js
====================

This is a Javascript file that should be added to EA Project Browser Group script. It takes a snapshot of all of the connectors currently visible on a diagram. 


Remove_Unfrozen_Connectors.js
=============================

This is a Javascript file that should be added to EA Project Browser Group script. It hides all of the connectors that have not been "Frozen".
