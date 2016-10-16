function MatcherContactTutor_(pairingId,tutorEmail,exposeStudentInfo) {
    //we need to get the courseName, duration, and description with the pairing id from the spreadsheet
    var tutorSheet = SpreadsheetApp.openById(sheetId);
    var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
    var range = pairingAssignments.getDataRange();
    var rangeArray = range.getValues();
    rangeArray.shift();
    var courseName;
    var duration;
    var description;
    var validId = false;
    var times;
    for (var i = 0; i < rangeArray.length; i++) {
        var row = rangeArray[i];
        if (row[0] == pairingId) {
            duration = row[10];
            courseName = row[7];
            description = row[11];
            validId = true;
            //we need to parse through row 12 to determine whether or not
            var tutorsContacted = (function(){ try { return JSON.parse(row[12]) } catch(e) { return {} }})();
            for (var j = 0; j < tutorsContacted.length; j++) {
                var tc = tutorsContacted[j];
                if (tc.tutorEmail == tutorEmail) {
                    times = tc.sortedPeriods;
                    break;
                }
            }
            break;
        }
    }
    if (!validId) {
        return false;
    }

    var durationName = getDurationName(duration);

    //in the email, we will use the ___Names array
    var days = [];
    var periods = [];
    var daynames = [];
    var periodNames = [];
    var locations = [];
    var locationNames = [];

    for (var i = 0; i < times.length; i++) {
        var periodInfo = times[i];
        if (periodInfo.wait >= 3 && i > 3) { //at this point, give it to another tutor (if wait would be 3+ days and we already offered 3 times). Times is already sorted from shortest wait to greatest wait.
            break;
        }
        var time = periodInfo.period;
        var day = time.substring(0,3);
        days.push(day);
        daynames.push(getDayName(day));
        var period = time.substring(3,5);
        periods.push(period);
        periodNames.push(getPeriodName(period));

        var location = periodInfo.location;
        locations.push(location);
        locationNames.push(getLocationName(location));

    }
    var tutorFirstName = getFirstName(tutorEmail);
    var tutorLirstName = getLastName(tutorEmail);
    var questionHTML = "Are you available to tutor a student";
    var opener = "The student can meet at";
    var questionPlain = questionHTML;
    if (exposeStudentInfo) {
        questionHTML = "Are you available to continue to tutor <b>" + getFirstName(row[2]) + " " + getLastName(row[2]) + "</b>";
        questionPlain = "Are you available to continue to tutor " + getFirstName(row[2]) + " " + getLastName(row[2]);
        opener = getFirstName(row[2]) + " would like to reschedule to";
    }

    var htmltimelist = [];
    var plaintimelist = [];
    for (var i = 0; i < days.length; i++) {
        var perferred = i == 0 ? " (perferred)" : "";
        htmltimelist.push("<li>" + daynames[i] + ", " + periodNames[i] + ", " + locationNames[i] + perferred + "</li>");
        plaintimelist.push(" -  " + daynames[i] + ", " + periodNames[i] + ", " + locationNames[i] + perferred + "\r\n");
    }
    var htls = "";
    var ptls = "";
    for (var i = 0; i < days.length; i++) {
        htls += htmltimelist[i];
        ptls += plaintimelist[i];
    }
    var htmlbody = "<html><head></head><body style='font-size: 14px;'>Dear " + tutorFirstName + ",<br />"
        + "<br />"
        + questionHTML + " for the <b>" + durationName.toLowerCase() + "</b> in <b>" + courseName + "</b>?<br />"
        + opener + " (in order of preference):<br />"
        + "<ul style='margin-top: 0;'>"
        + htls
        + "</ul>"
        + "Description: " + description + "<br />"
        + "<br />"
        + "So, are you available?<br />"
        + "<b>Yes, I'm in</b>: Great! Please <a href='" + baseAppUrl + "?page=tutor-accept-request&pairid=" + pairingId + "'>confirm that you can accept this commitment</a>.<br />"
        + "<b>Sorry, I can't</b>: Please <a href='" + baseAppUrl + "?page=tutor-update-schedule'>update your tutoring availability schedule</a> so we know when you're actually free.<br />"
        + "<br />"
        + "Love,<br />"
        + groupName + "</body></html>";

    var plainBody = "Dear " + tutorFirstName + ",\r\n"
        + "\r\n"
        + questionPlain + " for the " + durationName.toLowerCase() + " in " + courseName + "?\r\n"
        + opener + " (in order of preference):\r\n"
        + ptls
        + "\r\n"
        + "Description: " + description + "\r\n"
        + "\r\n"
        + "So, are you available?\r\n"
        + "Yes, I'm in: Great! Please confirm that you can accept this commitment by clicking here: " + baseAppUrl + "?page=tutor-accept-request&pairid=" + pairingId + "\r\n"
        + "Sorry, I can't: Please update your tutoring availability schedule so we know when you're actually free. Click here: " + baseAppUrl + "\r\n"
        + "\r\n"
        + "Love,\r\n"
        + groupName;

    var emailSubject = "Can you tutor a student in " + courseName + "?";
    MailApp.sendEmail(tutorEmail, emailSubject, plainBody,{
        htmlBody: htmlbody
    });
    return true;
}