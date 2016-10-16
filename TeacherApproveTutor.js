function teacherApproveTutor(data) {
    try {
        if (!validateHash_(data)) {
            throw "Bad Hash";
        }
        if (!data.userEmail) {
            throw "You are not logged in. Please use your " + orgAccountName + " account.";
        }

        var approveStatus = data.approvalStatus;
        var notes = data.notes;
        var id = data.id;

        Logger.log(approveStatus);
        Logger.log(notes);
        Logger.log(id);

        var tutorSheet = SpreadsheetApp.openById(sheetId);
        var classHistory = tutorSheet.getSheetByName("TutorClassHistory");

        var range = classHistory.getDataRange();
        var rangeArray = range.getValues();

        var row = rangeArray[id-1];
        Logger.log("have the row");
        if (row[5].toLowerCase() != data.userEmail.toLowerCase()) {
            throw "You are not the teacher for this entry";
        }
        Logger.log("passed the first check");
        if (row[8]) {
            throw "This student has already been approved in this course";
        }
        Logger.log("got here");
        var studentEmail = row[0];
        var studentFirstName = getFirstName(studentEmail);
        var studentLastName = getLastName(studentEmail);

        var teacherFirstName = getFirstName(data.userEmail);
        var teacherLastName = getLastName(data.teacherEmail);

        var amendRange = classHistory.getRange(id,8,1,2);
        amendRange.setValues([[notes,approveStatus]]);
        //send an email to the student
        var htmlbody = "<html><head></head><body style='font-size: 14px;'>Dear " + studentFirstName + ",<br />"
            + "<br />"
            + "Your teacher " + teacherFirstName + " " + teacherLastName + " <b>" + (approveStatus.toLowerCase() === "true" ? "approved" : "did not approve") + "</b> you as a tutor in <b>" + row[4] + "</b>.<br />"
            + "<br />"
            + "Sincerely,<br />"
            + groupName + "</body></html>";

        var plainBody = "Dear " + studentFirstName + ",\r\n"
            + "\r\n"
            + "Your teacher " + teacherFirstName + " " + teacherLastName + " " + (approveStatus.toLowerCase() === "true"  ? "approved" : "did not approve") + " you as a tutor in " + row[4] + ".\r\n"
            + "\r\n"
            + "Sincerely,\r\n"
            + groupName;

        var emailSubject = row[4] + " Tutoring";
        MailApp.sendEmail(studentEmail, emailSubject, plainBody,{
            htmlBody: htmlbody
        });
        return {
            success: true
        };
    }
    catch(e) {
        return {
            success: false,
            message: e
        }
    }
}
