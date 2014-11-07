//[Header]
// Christophe Aeschlimann
// Comments : chli@romandie.com 
//
// Created for Media Portal Community
// Visit http://mediaportal.sourceforge.net
//

// *******************
// * Quick Use Guide *
// *******************

// Prerequisite :
// -------------
// Logos.psd
// Adobe Photoshop CS or 7 with scripting plugin :
// http://www.adobe.com/support/downloads/detail.jsp?ftpID=1536  
   

// Open logos.psd file with Photoshop (tested with CS2 version)
// Modify the background or keep it invisible for transparent background
// Modify the shape color or shape
// Add any logo you want in the "Logos" groups
// For each logo in the "Logos" group a new png file will be created in the 
//	 directory where the Logos.psd has been opened.
// WARNING : The files created use the layers names for their filenames 
// 	so avoid forbidden characters like '/' and so on or it will crash when saving
// Once everything is done go to File/Scripts/Browse... and open this file.
// Files created

// This script can be freely distributed / modified as long as this header is unchanged.
// [/Header]

// [Code]
displayDialogs = DialogModes.NO;

saveOptions = new PNGSaveOptions();

//check that a document is opened and that it has been saved
//if ((documents.length != 0) && (activeDocument.saved))
if ((documents.length != 0))
{

	//get active document
	var AD = activeDocument;
	//get current paths
	var currentFolder = AD.path;
	//get all the layers from the group of layers named "Logos"
	var myLogos = AD.layerSets.getByName("Logos");
	var myEffects = AD.layerSets.getByName("Effects");

	//Progress windows
	var progressWindow = createProgressWindow("Progress...",0, myLogos.layers.length, false, true);
	progressWindow.isDone = false;
	progressWindow.onCancel = function() 
	{
		this.isDone = true;
		return true;  // return 'true' to close the window
	}

	//Hide all effects
	progressWindow.text = ("Hiding effects ");
	for(j=0;j<myEffects.layers.length;j++)
	{
		myEffects.layers[j].visible = 0
		if (progressWindow.isDone)
		{
			break;
		}
	}

	//Hide all logos
	HideAllLogos(myLogos);
    myLogos.visible = 1;
	//Loop thru all effets combinations
	var doLoop=true;
	for(i=0;i<loopEffects(myEffects.layers.length);i++)
	{
		if (progressWindow.isDone)
		{
			break;
		}
		SetMyEffects(myEffects.layers.length-1);

		var tempFolderName = "";
		for(j=0;j<myEffects.layers.length;j++)
		{
			if(myEffects.layers[j].visible != 0)
			{
				tempFolderName = tempFolderName + myEffects.layers[j].name;
			}
		}
		if(tempFolderName == "")
		{
			tempFolderName="Plain";
		}
		//create a new subfolder
		var tempFolder = new Folder (currentFolder+"/" + tempFolderName);
		if(tempFolderName == "Black" || 
		   tempFolderName == "Blue"  || 
		   tempFolderName == "Plain" ||
		   tempFolderName == "Glass" ||
		   tempFolderName == "GlassBlue" ||
		   tempFolderName == "GlassBlack" ||
		   tempFolderName == "GlassDefault" )
		{
			tempFolder.create();
		
			//for each layers in the logos group
			SaveFiles(myLogos,tempFolderName);
		}
	}
	progressWindow.close();

	alert("PNG files saved !");
}
else
{
	alert("Please first save the document or open logos.psd!");
}

function SaveFiles(currObj,strTitle)
{
	progressWindow.text = ("Progressing "+ strTitle);
	var i=0;
	for(i=0;i<currObj.layers.length;i++)
	{
		if (progressWindow.isDone)
		{
			break;
		}
		if(tempFolderName==strTitle)
		{
			progressWindow.updateProgress(i);
		}
		//make the current layer visible
		currObj.layers[i].visible = 1;	
		if(currObj.layers[i].typename == 'LayerSet')
		{
			SaveFiles(currObj.layers[i],strTitle + "-" + currObj.layers[i].name);
			progressWindow.text = ("Progressing "+ strTitle);
		}
		else
		{
			var fileNameBody = currObj.layers[i].name+".png";
			fileNameBody = fileNameBody.replace(/[:\/\\*\?\"\<\>\|]/g, "_");  // '/\:*?"<>|' -> '_'
			newFile = new File(tempFolder+"/" + fileNameBody);
			AD.saveAs (newFile,saveOptions, true, Extension.LOWERCASE);
		}
		currObj.layers[i].visible = 0;	
	}
}

function HideAllLogos(CurrObj)
{
	var i=0;
	for(i=0;i<CurrObj.layers.length;i++)
	{
		if (progressWindow.isDone)
		{
			break;
		}
		//hide it
		CurrObj.layers[i].visible = 0;
		if(CurrObj.layers[i].typename == 'LayerSet' )
		{
			progressWindow.text = ("Hiding all logos - " + CurrObj.layers[i].name);
			HideAllLogos(CurrObj.layers[i]);
		}
	}
}

function SetMyEffects(n)
{
	if(myEffects.layers[n].visible == 1)
	{
		myEffects.layers[n].visible = 0;
		if(n !=0)
		{
			SetMyEffects(n - 1);
		}
	}
	else
	{
		myEffects.layers[n].visible = 1;
	}
}

function loopEffects(n)
{
	if(n==0)
	{
		return 1;
	}
	else
	{
		return loopEffects(n-1)*2;
	}
}
//
// createProgressWindow
//   title     the window title
//   min       the minimum value for the progress bar
//   max       the maximum value for the progress bar
//   parent    the parent ScriptUI window (opt)
//   useCancel flag for having a Cancel button (opt)
//   
//   onCancel  This method will be called when the Cancel button is pressed.
//             This method should return 'true' to close the progress window
//
function createProgressWindow(title, min, max, parent, useCancel) {
  var win = new Window('palette', title);
  win.bar = win.add('progressbar', undefined, min, max);
  win.bar.preferredSize = [300, 20];

  win.parent = undefined;

  if (parent) {
    if (parent instanceof Window) {
      win.parent = parent;
    } else if (useCancel == undefined) {
      useCancel = parent;
    }
  }

  if (useCancel) {
    win.cancel = win.add('button', undefined, 'Cancel');
    win.cancel.onClick = function() {
      try {
        if (win.onCancel) {
          var rc = win.onCancel();
          if (rc || rc == undefined) {
            win.close();
          }
        } else {
          win.close();
        }
      } catch (e) {
        alert(e);
      }
    }
  }

  win.updateProgress = function(val) {
    var win = this;
    win.bar.value = val;
    // recenter the progressWindow if desired
    // win.center(win.parent);
    win.show();
    win.hide();
    win.show();
  }
  win.center(win.parent);
  win.show();
  return win;
};
// [/Code]