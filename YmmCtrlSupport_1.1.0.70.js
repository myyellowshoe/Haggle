var stateBag = "", interval = null, loadNext = true;
var statePairs = null, iterator = 0;
var activeList = null, activeStateKey = "", defaultItemText = "";
var filterStateKey = "";
var categoryStateKey = "";
var isReloadingState = false;

var valueHandlers = {};
var PriceRangeMaximumStateKey = "";
var PriceRangeMinimumStateKey = "";
var ZipCodeStateKey = "";

function AddValueHandler(key, list)
{
    var keyExists = false;
    for (var currKey in valueHandlers)
    {
        if (currKey == key)
        {
            keyExists = true;
            break;
        }
    }
    
    if (keyExists)
        valueHandlers[key].push(list);
    else
        valueHandlers[key] = new Array(list);
}
 
function SetStateValue(key, value)
{
    document.forms[0].elements[key].value = value;	
    stateBag = window.location.hash;
    
    var pairs = stateBag.substring(1, stateBag.length).split("&");
    for (var i = 0; i < pairs.length; i++)
    {
        if (key == pairs[i].substring(0, pairs[i].indexOf("=")))
        { 
            var newPair = key + "=" + value;
            window.location.hash = stateBag.replace(eval("/" + pairs[i] + "/"), newPair);

            return;
        }
    }
    
    window.location.hash += (stateBag == "" ? "" : "&") + key + "=" + value;
    stateBag = window.location.hash;
}

function SetPrevState()
{
    var frm = document.forms[0]; 
    if (window.location.search != "" && setState)
    {
        var query = window.location.search.substring(1, window.location.search.length);
        var queryPairs = query.split("&");
        var dictionary = {}, hashValues = [];

        for (var i = 0; i < queryPairs.length; i++)
        {
            var pairValues = queryPairs[i].split("=");
            dictionary[pairValues[0]] = pairValues[1];
        }

        for (var key in valueHandlers)
            if (dictionary[key] != null)
            {
                // make sure the dictionary key is a list and not an event handler (which is picked up in safari)
                if (key.options != null)
                { 
                    hashValues.push(key + "=" + dictionary[key]);
                }
            }
            
        if (hashValues.length > 0)
            window.location.hash = hashValues.join("&");
    }

    if (window.location.hash != stateBag)
    {
        stateBag = window.location.hash;
        if  (stateBag.length > 1)
        { 
            // Parse the hash values
            statePairs = stateBag.substring(1, stateBag.length).split("&");
            StartStateReload();
        }
    }
}

function SetOptionValue(list, value, executeHandler)
{
    var len = list.options.length;
    
    for (var i = 0; i < len; i++)
    {
        if (list.options[i].value == value)
        {
            list.options[i].selected = true;
            
            if (executeHandler)
                ExecuteHandler(list);
            break;
        }
    }
}

function ExecuteHandler(list)
{
    var handler = list.onchange.toString();
    handler = handler.substring(handler.indexOf('{') + 1, handler.indexOf('}') - 1);
    handler = handler.replace(/this./gi, "list.");

    eval(handler);
}

function StartStateReload()
{	
    isReloadingState = true;
	interval = setInterval("CheckResponse()", 5);	
}

function StopStateReload()
{
	clearInterval(interval);
	delete interval;
	
    isReloadingState = false;	
}

function CheckResponse()
{
    if (iterator <= statePairs.length - 1)
    {
        if (loadNext)
        {
            var values = statePairs[iterator++].split("=");
            var lists = valueHandlers[values[0]];
            
            // Only execute the handler for the first list
            for (var i = 0; i < lists.length; i++)
                SetOptionValue(lists[i], values[1], i == 0 ? true : false);
        }
    }
    else
    {
        StopStateReload();
    }
}

function UpdateList(listItems, listItemDelimiter, currentDisplayType)
{
    var list = activeList;
    clearList(list)    

    if (listItems)
    { 
        var listItemsArray = listItems.split(",");
       
        if (currentDisplayType=="NewCarAllModels")
        {
            addElement(list, "All " + defaultItemText + "s", "-1");
        }
        else
        {
            addElement(list, "Select " + defaultItemText + "...", "0");
        }
                    
        for (i=0; i < listItemsArray.length; i++)
        {
            if (listItemDelimiter != "")
            { 
                var listItemParts = listItemsArray[i].split(listItemDelimiter);
                addElement(list, listItemParts[1], listItemParts[0]);
            }
            else
            {
                addElement(list, listItemsArray[i], listItemsArray[i]);
            }   
        }    

        if(defaultItemText == "Year" && currentDisplayType == "QuickDealerPriceQuote")
        { 
            list.options[1].selected = true;
            ExecuteHandler(list);
        }

        loadNext = true;    
    } 
    else
    {
        list.disabled = false;
        if (currentDisplayType=="NewCarAllModels")
        {       
            addElement(list, "All " + defaultItemText + "s", "-1");
        }
        else
        {       
            addElement(list, "Select " + defaultItemText + "...", "0");
        }
        list.disabled = true;
    }    
}

function clearList(list) 
{
    var i = 0;
    var o = list.options;

    for (i = o.length; i >= 0; --i)
    o[i] = null;
    list.disabled = true;
}

function addElement(list, text_in, value_in)
{
    var o = list.options;
    var nIdx;
    if (o.length < 0) //IE for Mac 4.5 sets length to -1 if list is empty
    nIdx = 0;
    else
    nIdx = o.length;

    o[nIdx] = new Option(text_in, value_in);
    list.disabled = false;
}

function OnServiceCallComplete(result)
{
    if (isReloadingState)
    {
        var lists = valueHandlers[activeStateKey];
        var listLen = lists.length;
        
        for (var j = 0; j < listLen; j++)
            PopulateResults(lists[j], result);
    }
    else
    {
       PopulateResults(activeList, result);       
    }
    
    loadNext = true;
}

function GetYmmHash(object)
{
    if (typeof(object)!='undefined')
    {
        var objName= object.name;
        var list = objName.split('$');
        var objHash = list[list.length-1].split('_');
    }
    return eval(objHash[0]+"_"+objHash[1]+"_displayType");
}

function PopulateResults(list, result)
{
    list.options.length = 0;
    var displayTypeAjax = GetYmmHash(list);
    if (result)
    {
        list.disabled = false;
        if (displayTypeAjax=="NewCarAllModels")
        {
            list.options[0] = new Option("All " + defaultItemText + "s", "-1");
        }
        else
        {
            list.options[0] = new Option("Select " + defaultItemText + "...", "0");        
        }

        for (var i = 1; i <= result.length; i++) 
        {
            var displayText; 
            var index;

            if (defaultItemText == "Year") 
            {
                index = result[i - 1].Id;
                displayText = result[i -1].Id;
            } 
            else if (defaultItemText == "Trim")
            {
                index = result[i - 1].Key;
                displayText = result[i - 1].Value;
            }
            else
            {
                index = result[i - 1].Id;
                displayText = result[i - 1].Name;
            } 

            list.options[i] = new Option(displayText, index);
        }
       
        if(defaultItemText == "Year" && displayTypeAjax == "QuickDealerPriceQuote")
        { 
            list.options[1].selected = true;
            ExecuteHandler(list);
        }
       
        if(defaultItemText == "Trim" && (displayTypeAjax == "NewCarCompareVehicles" || displayTypeAjax == "QuickDealerPriceQuote" || displayTypeAjax == "UsedCarCompareVehicles"))
        {
            list.options[1].selected = true;
            ExecuteHandler(list);             
        }  
    }
    else
    {
        list.disabled = false;
        list.options[0] = new Option("No " + defaultItemText + "s Found...", "0");
        list.disabled = true;
    }
}

function SetListLoadingMessage(list, defaultText, stateKey)
{
	list.options.length = 0;
    list.disabled = false;
    list.options[0] = new Option("Loading...", "0");
    list.disabled = true;
        
    activeStateKey = stateKey;    
    activeList = list;
    defaultItemText = defaultText;
}

function DisableList(list)
{
    ResetList(list, true);
}

function ResetList(list, disable)
{
    if (list != null)
    {
        list.disabled = disable;
        list.selectedIndex = 0;
    }
}

// This function applies to both new and used cars.
function validateSelectionOptions(id)
{
    var currentDisplayType = eval(id+"_displayType");
    var valid = true;
    var currValidationList = eval(id + "_validationList");
    for (var currKey in currValidationList)
    {    
        list =  currValidationList[currKey];

        // currentValidationList in Safari contains more than just the dropdown items (ie attachEvent).  
        // need to verify currKey is an option list, otherwise will blows up Safari
        if (list.options != null) 
        { 
            if (list.options.selectedIndex == 0 && list.options[list.options.selectedIndex].value!=-1)
            {
                var keyValue = currKey.substring(0, currKey.indexOf("Id"));
                alert('Please Select a ' + keyValue + '.');   
                valid = false;
                break;
            }
            else
            {
                SetStateValue(currKey, list.options[list.options.selectedIndex].value);
            }
        } 
    }
   
    if (document.forms[0].SelectionHistory)
        document.forms[0].SelectionHistory.value = '';
        
    if (document.forms[0].VehicleId && currentDisplayType != "QuickDealerPriceQuote")
        document.forms[0].VehicleId.value = '';
       
    if (document.forms[0].WebCategoryId && !enableCategoryFilter )
         document.forms[0].WebCategoryId.value = '';
         
    return valid;
}

function GetFilterValue()
{  
    var filterField = document.forms[0].elements[filterStateKey];
    return (filterField != null && enableAttributeFilter) ? filterField.value : "";
}

function GetCategoryValue()
{  
    var categoryField = document.forms[0].elements[categoryStateKey];
    return (categoryField != null && enableCategoryFilter) ? categoryField.value : "";
}

function GetPriceRangeMaximum()
{  
    var PriceRangeMaximumField = document.forms[0].elements[PriceRangeMaximumStateKey];
    return (PriceRangeMaximumField != null && enablePriceRangeFilter) ? PriceRangeMaximumField.value : "";
}

function GetPriceRangeMinimum()
{  
    var PriceRangeMinimumField = document.forms[0].elements[PriceRangeMinimumStateKey];
    return (PriceRangeMinimumField != null && enablePriceRangeFilter) ? PriceRangeMinimumField.value : "";
}

function GetZipCode()
{  
    var ZipCodeField = document.forms[0].elements[ZipCodeStateKey];
    return (ZipCodeField != null && enableZipCodeFilter) ? ZipCodeField.value : "";
}

function resetDropDown(selectBox, originalWidth)
{
    if (document.all) 
    { 
        selectBox.style.width = originalWidth;
    }
}           
     
function growDropDown(selectBox)
{
    // causes problems in some browsers, limit with document.all 
    if (document.all) 
    {
        var characterLength = 7;
        var originalWidth =  selectBox.style.width.replace("px", "");
        for(var i=0;i<selectBox.options.length;i++) 
        {
            if (selectBox.options[i].text.length*characterLength > originalWidth) 
            {
                selectBox.style.width = 'auto';
                break;
            }
        }
    }         
}        

//function OnTimeout(result) 
//{
//    // TODO: Replace with different error handling
//    alert("Timed out");
//}

function OnError(result) 
{ 
    // TODO: Replace with different error handling
    alert("Error: " + result.get_message());
    //alert("Stack trace: " + result.get_stackTrace());
}