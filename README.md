# Enterprise Architect Scripts
A collection of scripts that we have found helpful when using enterprise architect.

This consists of:

## Removing Annoying Connector scripts

So you want to model a set of scenarios using EA with connectors or links between different elements (e.g. Dependency, Trace etc). Then you want to model another scenario using the same elements and..... Oh no, EA keeps on adding the relationships across all of these diagrams and now I have a real maintenance headache trying to keep all of the diagrams clean. 

### The problem explained

Let's say that you want to add a diagram with some relationships between classes:

![Diagram showing links between classes](README_files/the_problem_1.png)

#### Remove_All_Connectors.js

This is a Javascript file that should be added to EA Project Browser Group script. It removes all connectors on a diagram as if the user had clicked on each connector and selected "Hide Connector". The connector still remains in the model but is no longer visible on the diagram on which this script was run.


#### Freeze_Connectors.js

This is a Javascript file that should be added to EA Project Browser Group script. It takes a snapshot of all of the connectors currently visible on a diagram. 


#### Remove_Unfrozen_Connectors.js

This is a Javascript file that should be added to EA Project Browser Group script. It hides all of the connectors that have not been "Frozen".
