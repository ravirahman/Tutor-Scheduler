function studentCancelCommitment(data) {
    if (!validateHash_(data)) {

        throw "Bad Hash";
    }
    if (!data.userEmail) {
        throw "You are not logged in. Please use your " + orgAccountName + " Account.";
    }


    //validate that the user owns the commitment, and then mark it as false -- and append the message that the tutor requested it be canceled
    var studentEmail = data.userEmail;
    var ownsCommitment = false;
    var tutorSheet = SpreadsheetApp.openById(sheetId);
    var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
    var range = pairingAssignments.getDataRange();
    var rangeArray = range.getValues();
    var myCommitments = [];
    var message;
    rangeArray.shift();
    for (var i = 0; i < rangeArray.length; i++) {
        var row = rangeArray[i];
        if (row[2] == studentEmail && row[0] == data.pairId) {
            ownsCommitment = true;
            if (row[16] === false) {
                throw "This tutoring commitment has already been canceled";
            }
            message = "Student Canceled Commitment";
            if (row[13] == false) {
                message = "Student canceled request before it was fulfilled";
            }
            break;
        }
    }
    if (!ownsCommitment) {
        throw "You do not own this tutoring commitment.";
    }
    Logger.log("about to cancel");
    Logger.log(row[0]);
    MatcherCancelCommitment_(row[0],message,"STUDENT");
    return {
        success: true
    };

}
