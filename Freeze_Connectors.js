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
 * This code takes a snapshot of the diagram connectors so that further connectors 
 * can be removed at a later date. It creates DisplayLink objects for each connector 
 * unless the connector is already hidden on the diagram. WARNING: the frozen state 
 * is held in attribute "Path" within the DisplayLink object. 
 ***********************************************************************************
 * Script Name: Freeze Connectors
 * Author: Paul Madle
 * Purpose: to Freeze connectors against a diagram
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
		// This code only runs on a diagram object in the Project Browser.
		case otDiagram :
		{
			// Code for when a diagram is selected
			var theDiagram as EA.Diagram;
			Session.Output('Starting Freeze connector Script');
			theDiagram = Repository.GetTreeSelectedObject();
			freezeDiagramLinks(theDiagram);
			Session.Output('Finished Freeze connector Script');
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


// This routine freezes all of the links on a diagram
// It is based on code here: https://sparxsystems.com/forums/smf/index.php/topic,2587.0.html
// WARNING: The frozen state for a connector is stored in the "Path" attibute associated with a DiagramLink
// This may cause problems in the future but it was the only way I could find to save the state of the link.
function freezeDiagramLinks(dDiagram)
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
	var existingLink as EA.DiagramLink;
	var iInnerInnerIndex;
	var bAddConnector = true;
	
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
				// this boolean controls if a link will be hidden or not.
				bAddConnector = true;
				
				
				// go through the current diagram links associated with the current diagram
				for (iInnerInnerIndex = 0 ; iInnerInnerIndex < dDiagram.DiagramLinks.Count ; iInnerInnerIndex++)
				{
					existingLink = dDiagram.DiagramLinks.GetAt(iInnerInnerIndex);
					
					Session.Output ('Analysing existing link ID ' + existingLink.ConnectorID + ' which IsHidden = ' + existingLink.IsHidden + ' against model connector ' + connector.ConnectorID);
					
					// if the link already exists on the diagram and it is hidden, do not recreate the Diagram Link... The link has been intentionally hidden.
					if ((existingLink.ConnectorID == connector.ConnectorID) &&
                        (existingLink.IsHidden == 1))						
					{
						Session.Output('Not Adding connector ' + existingLink.ConnectorID + ' it has been removed from this diagram previously');
						bAddConnector = false;
					}
				}
			
				if (bAddConnector == true)
				{
					Session.Output('Adding Connector ' + connector.ConnectorID);
					dlink = dDiagram.DiagramLinks.AddNew("", connector.Type);
					dlink.ConnectorID = connector.ConnectorID;
					dlink.Update();
					dlink.Path = 'CREATED BY SCRIPT'; // WARNING, this is how state is maintained... Could be problematic in the future.
					dlink.Update();
				}
            }
        }
    }
    
	// Use all of the APIs to refresh and commit data to the database.
	
	dDiagram.DiagramLinks.Refresh();

    if (dDiagram.Update())
	{
		Repository.ReloadDiagram(dDiagram.DiagramID);
	}
}
