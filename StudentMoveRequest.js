function studentMoveRequest(data) {
    if (!validateHash_(data)) {
        throw "Bad Hash";
    }
    if (!data.userEmail) {
        throw "You are not logged in. Please use your " + orgAccountName + " Account.";
    }
    try {
        var scheduleData = {};
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var keyParts = key.split(".");
                if (keyParts[0] == "times" && data[key] != false && data[key] != "false" && (data[key] == "onCampus" || data[key] == "offCampus")) {
                    scheduleData[keyParts[1]] = data[key];
                }
            }
        }
        //validate the data

        //that you own the request
        var pairingId = data.pairId;
        var studentEmail = data.userEmail;
        var tutorSheet = SpreadsheetApp.openById(sheetId);
        var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
        var range = pairingAssignments.getDataRange();
        var rangeArray = range.getValues();
        rangeArray.shift();
        var rownumber = 0;
        for (var i = 0; i < rangeArray.length; i++) {
            var row = rangeArray[i];
            if (row[2] == studentEmail && row[0] == pairingId) {
                rownumber = i;
                break;
            }
        }
        if (rownumber == 0) {
            throw "The pairingId is invalid.";
        }

        //duration: should have a value
        var duration;

        var durationValue = data.duration;
        if (!durationValue || durationValue == "false") {
            throw "Please select how long you would like a tutor.";
        }

        var description = data.description;
        if (description == false || description == "") {
            throw "Please enter a short description.";
        }

        if (durationValue == "semester") {
            duration = currentSemester;
        }
        else if (durationValue == "season") {
            duration = currentSeason;
        }
        else {
            duration = "FULL";
        }


        //cell-phone
        var cellPhone = data["cell-phone"];
        if (!/^((([0-9]{3}))|([0-9]{3}))[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/.test(cellPhone)) {
            throw "Please Enter your Cell Phone";
        }
        cellPhone = stripPhone(cellPhone);


        //scheduleData is populated correctly. Now shove the data into the table

        //first we need to load the tutor's schedule
        var nextRow = pairingAssignments.getLastRow() + 1;
        var tutorFindResults = MatcherFind_(row[4],row[5],row[6],row[7],row[8],scheduleData,duration,[]);
        if (tutorFindResults.success == false) {
            return {
                success: false,
                message: tutorFindResults.message
            };
        }
        //ok cool. so there are tutors available

        if (row[13] == false) {
            //if we don't yet have a tutor assigned to this student, modify the existing row:
            //we set row 3 (phone number) and 10-13 (available,duration,desc,contactedtutors)

            var values = [[JSON.stringify(scheduleData),duration,description,JSON.stringify(tutorFindResults.tutors)]];
            Logger.log("rownumber is" + (rownumber+1));
            var thisAssignmentRange = pairingAssignments.getRange(rownumber+2, 4, 1, 1);
            thisAssignmentRange.setValues([[cellPhone]]);

            var thisAssignmentRange2 = pairingAssignments.getRange(rownumber+2, 10, 1, 4);
            thisAssignmentRange2.setValues(values);

            var thisAssignmentRange = pairingAssignments.getRange(rownumber+2, 17, 1, 3); //clear the false and message
            thisAssignmentRange.setValues([["","",""]]);

            tutorFindResults.tutors.forEach(function(tutor) {
                Logger.log(JSON.stringify(tutor));
                MatcherContactTutor_(row[0],tutor.tutorEmail);
            });
            return {
                success: true
            };
        }

        else {

            //ok so we have a tutor assgined to this student. let's see if our tutor is available during the specified time slots
            var tutorEmail = row[13];
            var currentTutorAvailable = false;
            var currentTutor = null;
            var exponsestudent = false;
            tutorFindResults.tutors.forEach(function(tutor) {
                if (tutor.tutorEmail == tutorEmail) {
                    currentTutor = tutor;
                    currentTutorAvailable = true;
                }
            });

            if (currentTutorAvailable && data.keepTutor == "true") { //if our current tutor is available, chuck everyone else from the array. Else, use the array as-is.
                tutorFindResults.tutors = [currentTutor];
                exponsestudent = true;
            }
            if (currentTutorAvailable && data.keepTutor == "false") { //if our current tutor is available but they're not wanted, chuck 'em from the array
                var tutorIndex = tutorFindResults.tutors.indexOf(currentTutor);
                tutorFindResults.tutors.splice(tutorIndex);
            }


            if (!currentTutorAvailable && data.keepTutor == "true") {
                //our tutor is not available, and the student doesn't want someone else.
                return {
                    success: false,
                    message: "Unfortunately, your current tutor is not available during the times you specified.\n"
                    + "Please increase your availability, change the duration, or allow us to match you with another tutor (by selecting 'Anyone works!' for item #4)."
                };
            }
            if (currentTutorAvailable && tutorFindResults.tutors.length < 1 && data.keepTutor == "false") { //only the current tutor is available, and we don't want them!
                return {
                    success: false,
                    message: "Unfortunately, your current tutor is the ONLY tutor available during the times you specified.\n"
                    + "Please increase your availability, change the duration, or allow us to match you with your current tutor (by selecting 'Anyone works!' for item #4)."
                };
            }
            //if we got here, then we're good to insert a new row and contact every still inside tutorFindResults
            var values = [[nextRow,new Date().toLocaleString(),data.userEmail,cellPhone,row[4],row[5],row[6],row[7],row[8],JSON.stringify(scheduleData),duration,description,JSON.stringify(tutorFindResults.tutors)]];


            var thisAssignmentRange = pairingAssignments.getRange(nextRow, 1, 1, 13);
            thisAssignmentRange.setValues(values);

            tutorFindResults.tutors.forEach(function(tutor) {
                MatcherContactTutor_(nextRow,tutor.tutorEmail,exponsestudent);
            });

            return {
                success: true
            };
        }
    }
    catch(e) {
        Logger.log(e);
        return {
            success: false,
            message: e
        };
    }
}
