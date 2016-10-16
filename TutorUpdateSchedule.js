function tutorUpdateSchedule(data) {
  if (!validateHash_(data)) {
    throw "Bad Hash";
  }
      if (!data.userEmail) {
      throw "You are not logged in. Please use your " + orgAccountName + " account.";
    }
  try {
    var scheduleData = {};
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var keyParts = key.split(".");
        Logger.log(keyParts);
        if (keyParts[0] == "times" && data[key] != false && data[key] != "false" && (data[key] == "onCampus" || data[key] == "offCampus")) {
          if (!scheduleData.hasOwnProperty(keyParts[1])) {
            scheduleData[keyParts[1]] = {};
          }
          scheduleData[keyParts[1]][keyParts[2]] = data[key]; 
        }
      }
    }
    //scheduleData is populated correctly. Now shove the data into the table
    
    //first we need to load the tutor's schedule
    var tutorSheet = SpreadsheetApp.openById(sheetId);
    var tutorList = tutorSheet.getSheetByName("TutorList");
    var range = tutorList.getDataRange();
    var rangeValues = range.getValues();
    for (var i = 1; i < rangeValues.length; i++) {
      var row = rangeValues[i];
      //row[0] = email; row[1] = phone; row[2] = json of available slots; row[3] = json of occupied slots
      if (row[0] == data.userEmail) {
        var thisTutorRange = tutorList.getRange(i + 1, 2, 1, 2);
        var cellPhone = data["cell-phone"];
        if (!/^((([0-9]{3}))|([0-9]{3}))[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/.test(cellPhone)) {
          throw "Please Enter your Cell Phone";
        }
        thisTutorRange.setValues([[data["cell-phone"],JSON.stringify(scheduleData)]]);
        break;
      }
    }
      return {
      success: true
    }
  }
  catch(e) {
    return {
      success: false,
      message: e
    }
  }
}
