!INC Local Scripts.EAConstants-JScript

/***********************************************************************************
 *   _  _____ ____  ____  _____ 
 *  | |/ /_ _/ ___||  _ \| ____|
 *  | ' / | |\___ \| |_) |  _|  
 *  | . \ | | ___) |  __/| |___ 
 *  |_|\_\___|____/|_|   |_____|
 *
 ***********************************************************************************
 *  Copyright (c) 2019 KISPE Space Systems Ltd.
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 ***********************************************************************************
 * This code removes ALL connectors from a diagram. NOTE: The connector will still 
 * exist in the model but will be hidden on the diagram you are running this script 
 * on (it is the equivalent of Right-clicking each connector and selecting 
 * "Hide On Diagram". NOTE: this script needs to be launched from the project browser
 ***********************************************************************************
 * Script Name: Remove all Connectors
 * Author: Paul Madle
 * Purpose: To remove all connectors from a diagram, any diagram
 * Date: 17/09/2019
 ***********************************************************************************/

/*
 * Project Browser Script main function
 */
function OnProjectBrowserScript()
{
	Repository.EnsureOutputVisible( "Script" );
	
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	switch ( treeSelectedType )
	{
		// You can only run this script from a diagram in the roject Browser
		case otDiagram :
		{
			// Code for when a diagram is selected
			Session.Output('Starting Remove all connector Script');
			var theDiagram as EA.Diagram;
			theDiagram = Repository.GetTreeSelectedObject();
			removeDiagramLinks(theDiagram);
			Session.Output('Finished Remove all connector Script');
			break;
		}
		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

OnProjectBrowserScript();


// This rather long winded code removes connectors on diagrams
// It is fetched and adapted from https://sparxsystems.com/forums/smf/index.php/topic,2587.0.html.
// WARNING: the Path attribute of the DisplayLink object is used to hold state information required 
// by further scripts. This may cause problems later.
function removeDiagramLinks(dDiagram)
{
	var elementIDs = [];
	var iIndex;
    var  dobjs as EA.Collection; 
	dobjs = dDiagram.DiagramObjects;
	var element;
	var iInnerIndex;
	var dobj as EA.DiagramObject;
	var connector as EA.Connector;
	var dlink as EA.DiagramLink;
	
	// get an arraylist of all of the IDs of all the Diagram Objects 
    for (iIndex = 0 ; iIndex < dobjs.Count ; iIndex++)
	{
		dobj = dobjs.GetAt(iIndex);
		elementIDs.push(dobj.ElementID);
	}

    // loop through each element	
	for (iIndex = 0 ; iIndex < dobjs.Count ; iIndex++)
    {
		dobj = dobjs.GetAt(iIndex);
		
		element = Repository.GetElementByID(dobj.ElementID);
			
		// go through the connectors
        for (iInnerIndex = 0 ; iInnerIndex < element.Connectors.Count ; iInnerIndex++)
        {
			connector = element.Connectors.GetAt(iInnerIndex);
			
			// if a connector goes between objects within the diagram
            if ((elementIDs.indexOf(connector.ClientID) >= 0) &&
                (elementIDs.indexOf(connector.SupplierID) >= 0))
            {	
				// create a displaylink object and set to hidden in order to remove the connector.
				Session.Output('Removing Connector ' + connector.ConnectorID);
				dlink = dDiagram.DiagramLinks.AddNew("", connector.Type);
				dlink.ConnectorID = connector.ConnectorID;
				dlink.Update();
				dlink.Path = 'CREATED BY SCRIPT'; // NOTE: this is used by further scripts, it is the only way I can maintain state.
				dlink.IsHidden = true;
				dlink.Update();
			}
		}
    }
	
	// Use loads of methods to update the diagram and commit to the database.
	dDiagram.DiagramLinks.Refresh();

    if (dDiagram.Update())
	{
		Repository.ReloadDiagram(dDiagram.DiagramID);
	}
}
