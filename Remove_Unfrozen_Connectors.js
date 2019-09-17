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
 * This script runs through the connectors on a diagram and hides any connectors
 * that have not been frozen using the "Freeze Connectors" script. This is useful
 * in the case where connectors have been added to other diagrams and have now
 * infected this diagram.
 ***********************************************************************************
 * Script Name: Remove Unfrozen Connectors
 * Author: Paul Madle
 * Purpose: To cleanup the connectors on a given diagram to end up with those
 * that are applicable to this diagram and not other diagrams.
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
//		// this script operates on a diagram selected in the project browser.
		case otDiagram :
		{
			// Code for when a diagram is selected
			Session.Output('Starting Remove connector Script');
			var theDiagram as EA.Diagram;
			theDiagram = Repository.GetTreeSelectedObject();
			removeDiagramLinks(theDiagram);
			Session.Output('Finished Remove connector Script');
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


// This routine removes connectors that are not applicable to this diagram (i.e. 
// have been added on other diagrams, causing an infection on this diagram).
// It works by running through the connectors specified in the central model (variable "connector" and 
// identifying if a Diagram Link (variable "existingLink") has been created within this diagram (this may 
// or may not be the case). If a connector has not been frozen then it is hidden (by the creation of a 
// diagram link that is hidden). Simple really! :-S
// It is loosely based on https://sparxsystems.com/forums/smf/index.php/topic,2587.0.html
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
	var existingLink as EA.DiagramLink;
	var iInnerInnerIndex;
	var bHideConnector = true;
	
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
				bHideConnector = true;
				
				
				// go through the current links associated with the current diagram (i.e. within the diagram links)
				for (iInnerInnerIndex = 0 ; iInnerInnerIndex < dDiagram.DiagramLinks.Count ; iInnerInnerIndex++)
				{
					
					existingLink = dDiagram.DiagramLinks.GetAt(iInnerInnerIndex);
					
					Session.Output ('Analysing existing link ID ' + existingLink.ConnectorID + ' against model connector ' + connector.ConnectorID);
					
					// if the link already exists on the diagram, do not hide it... this is from the freeze routine.
					if ((existingLink.ConnectorID == connector.ConnectorID) &&
                        (existingLink.Path == 'CREATED BY SCRIPT'))	// this Path attribute holds the data to say that this link was "Frozen"					
					{
						Session.Output('Not removing connector ' + existingLink.ConnectorID + ' it has been added/removed from this diagram');
						bHideConnector = false;
					}
				}
			
				if (bHideConnector == true)
				{
					// remove the connector by creating another diagram link (weird, I know)
					Session.Output('Removing Connector ' + connector.ConnectorID);
					dlink = dDiagram.DiagramLinks.AddNew("", connector.Type);
					dlink.ConnectorID = connector.ConnectorID;
					dlink.Update();
					existingLink.Path == 'CREATED BY SCRIPT'; // WARNING, this Path attribute is used to state that the link is frozen.
					dlink.IsHidden = true;
					dlink.Update();
				}
            }
        }
    }
    
	
	// Use a plethora of API to commit the changes to the model... 
	dDiagram.DiagramLinks.Refresh();

    if (dDiagram.Update())
	{
		Repository.ReloadDiagram(dDiagram.DiagramID);
	}
}
