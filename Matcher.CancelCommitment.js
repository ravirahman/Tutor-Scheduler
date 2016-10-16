function MatcherCancelCommitment_(pairId,reason,canceler,supressEmail) {//private, unexposed function. No validation
    //add in the reason into the row
    var tutorSheet = SpreadsheetApp.openById(sheetId);
    var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
    var range = pairingAssignments.getDataRange();
    var rangeArray = range.getValues();
    rangeArray.shift();
    for (var i = 0; i < rangeArray.length; i++) {
        var row = rangeArray[i];
        if (row[0] == pairId) {
            if (row[16] === false) {
                return {
                    success: false,
                    message: "This tutoring commitment has already been canceled"
                }
            }
            var updateRange = pairingAssignments.getRange(i+2, 17, 1, 3);
            updateRange.setValues([[false,new Date().toLocaleString(),row[18] + "\n" + reason]]);
            break;
        }
    }

    if (row[13] != false) { //if we have a tutor
        //go into the TutorList and remove that period from the occupied list
        var tutorList = tutorSheet.getSheetByName("TutorList");
        var range1 = tutorList.getDataRange();
        var rangeValues = range1.getValues();
        for (var i = 1; i < rangeValues.length; i++) {
            var row2 = rangeValues[i];
            //row[0] = email; row[1] = phone; row[2] = json of available slots; row[3] = json of occupied slots
            if (row2[0] == row[13]) {
                var thisTutorRange = tutorList.getRange(i + 1, 4, 1, 1);
                var thisTutorValues = thisTutorRange.getValues();
                var currentCommitments = (function(){try { return JSON.parse(thisTutorValues[0][0]) } catch(e) { return {} }})();
                if (!currentCommitments.hasOwnProperty(row[10])) {
                    currentCommitments[row[10]] = {};
                }
                currentCommitments[row[10]][row[14]] = undefined;
                thisTutorRange.setValues([[JSON.stringify(currentCommitments)]]);
                break;
            }
        }

        //delete the calendar series
        var events = Calendar.Events.list(calendarId, {
            sharedExtendedProperty: "tutorPaidId=" + row[0]
        });
        if (events.items.length > 0) {
            for (var i = 0; i < events.items.length; i++) {
                var eventId = events.items[i].id;
                Logger.log("eventId:" + eventId);
                Logger.log("calendarId: "  + calendarId);
                Calendar.Events.remove(calendarId, eventId);
            }
        }
    }
    if (!supressEmail) {
        var studentEmail = row[2];
        var tutorEmail = row[13];

        var duration = row[10];
        var durationName = getDurationName(duration);
        var htmlcalinfo = "";
        var plaincalinfo = htmlcalinfo;
        var extraname = "";
        var extraemail = "";
        if (row[13] != false) {
            var time = row[14];
            var day = time.substring(0,3);
            var dayName = getDayName(day);

            var period = time.substring(3,5);
            var periodName = getPeriodName(period);


            var location = JSON.parse(row[9])[time];
            var locationName = getLocationName(location);

            Logger.log("has extra");
            extraname = " and " + getFirstName(tutorEmail);
            extraemail = "," + row[13];
            htmlcalinfo = "<b>" + dayName + "</b>, <b>" + periodName + "</b>, <b>" + locationName + "</b><br />";
            plaincalinfo = dayName + ", " + periodName + ", " + locationName + "\r\n";
        }
        Logger.log("sending email...");

        //send an email to the student
        var htmlbody = "<html><head></head><body style='font-size: 14px;'>Dear " + getFirstName(studentEmail) + extraname + ",<br />"
            + "<br />"
            + "Your tutoring commitment has been canceled:<br />"
            + "<br />"
            + "<b>" + row[7] + "</b> for the <b>" + durationName + "</b> during<br />"
            + htmlcalinfo
            + "<br />"
            + "<b>Reason</b>: " + reason  + "<br />"
            + "<br />"
            + getFirstName(studentEmail) + " -- if you still want a tutor, please <a href='" + baseAppUrl + "?page=student-new-request'>submit a new request</a>.<br />"
            + "<br />"
            + "Love,<br />"
            + groupName + "</body></html>";

        var plainBody = "Dear " + getFirstName(studentEmail) + extraname + ",\r\n"
            + "\r\n"
            + "Your tutoring commitment has been canceled:\r\n"
            + "\r\n"
            + row[7] + " for the " + durationName + " during\r\n"
            + plaincalinfo
            + "\r\n"
            + "Reason: " + reason + "\r\n"
            + "\r\n"
            + getFirstName(studentEmail) + " -- if you still want a tutor, please submit a new request at:\r\n"
            + baseAppUrl + "?page=student-new-request.\r\n"
            + "\r\n"
            + "Love,\r\n"
            + groupName;

        var emailSubject = row[7] + " Tutoring";
        MailApp.sendEmail(studentEmail + extraemail, emailSubject, plainBody,{
            htmlBody: htmlbody
        });
    }
}