function tutorCancelCommitment(data) {
  if (!validateHash_(data)) {
    throw "Bad Hash";
  }
  if (!data.userEmail) {
    throw "You are not logged in. Please use your " + orgAccountName + " account.";
  }
  
  //validate that the user owns the commitment, and then mark it as false -- and append the message that the tutor requested it be canceled
  var ownsCommitment = false;
  var tutorSheet = SpreadsheetApp.openById(sheetId);
  var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
  var range = pairingAssignments.getDataRange();
  var rangeArray = range.getValues();
  var myCommitments = [];
  rangeArray.shift();
  for (var i = 0; i < rangeArray.length; i++) {
    var row = rangeArray[i];
    if (row[13] == data.userEmail && row[0] == data.pairId) {
      ownsCommitment = true;
      if (row[16] != true) {
        throw "This tutoring commitment has already been canceled";
      }
      break;
    }
  }
  if (!ownsCommitment) {
    throw "You do not own this tutoring commitment.";
  }
  Logger.log("about to cancel");
  MatcherCancelCommitment_(row[0],"Tutor Canceled Commitment","TUTOR");
  return {
    success: true
  };
}