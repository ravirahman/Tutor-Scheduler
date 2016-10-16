function tutorRequestApproval(data) {
  try {
    if (!validateHash_(data)) {
      throw "Bad Hash";
    }
    if (!data.userEmail) {
      throw "You are not logged in. Please use your " + orgAccountName + " account.";
    }
        //teacher-email: should be an email
    var teacherEmail = data["teacher-email"];
    
    Logger.log(teacherEmail);
    
    Logger.log("got here");
    
    if (! (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(teacherEmail)) || !isTeacher(teacherEmail) || teacherEmail.substr(teacherEmail.length - 11) != "@" + domain) {
      throw "Please enter your teacher's email address";
    }
    
    var courseValue = data.course;
    if (!courseValue || courseValue.toLowerCase() == "false") {
      throw "Please select a course.";
    }
    Logger.log(courseValue);

    var courseInfo = JSON.parse(courseValue);
    //make sure that a row for this student and class doesn't exist.
    
    var tutorSheet = SpreadsheetApp.openById(sheetId);
    var classHistory = tutorSheet.getSheetByName("TutorClassHistory");
    
    var range = classHistory.getDataRange();
    var rangeArray = range.getValues();
    
    Logger.log("still on");
    
    for (var i = 1; i < rangeArray.length; i++) { //first row is the header row
       var row = rangeArray[i];
       //row[0] = student email; row[1] = subject; row[2] = class; row[3] = level; row[4] = course; row[5] = teacher; row[6] = dateCompleted; row[7] = teacher description; row[8] = teacherApproved slots
       if (row[0] == data.userEmail && row[1] == courseInfo.subject && row[2] == courseInfo.class && row[3] == courseInfo.level && row[4] == courseInfo.name) {
       
         throw "You already " + (row[8] ? "are approved": "requested approval") + " in this course";
       }
    }
    //ok not in here. create a new row
    
    Logger.log("passed duplicates");
    
    var nextRow = classHistory.getLastRow() + 1;
    
    var nextRowRange = classHistory.getRange(nextRow, 1, 1, 7);
    var date = new Date();
    var dateString = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    nextRowRange.setValues([[data.userEmail,courseInfo.subject,courseInfo.class,courseInfo.level,courseInfo.name,teacherEmail,dateString]]);
    
    var studentFirstName = getFirstName(data.userEmail);
    var studentLastName = getLastName(data.userEmail);
    
    var teacherFirstName = getFirstName(teacherEmail);
    var teacherLastName = getLastName(teacherEmail);
    
    //send an email to the teacher
    var htmlbody = "<html><head></head><body style='font-size: 14px;'>Dear " + teacherFirstName + " " + teacherLastName + ",<br />"
    + "<br />"
    + "Your student <b>" + studentFirstName + " " + studentLastName + "</b> wants to be a tutor in " + courseInfo.name + "</b>.<br />"
    + "<br />"
    + "As " + studentFirstName + "'s teacher, please <a href='" + baseAppUrl + "?page=teacher-approve-tutor&requestId=" + nextRow + "'>let TutorMilton know</a> whether " + studentFirstName + " is qualified to tutor in this subject.<br />"
    + "<br />"
    + "Thanks,<br />"
    + groupName + "</body></html>";
    
    var plainBody = "Dear " + teacherFirstName + " " + teacherLastName + ",\r\n"
    + "\r\n"
    + "Your student " + studentFirstName + " " + studentLastName + " requested approval for tutoring in " + courseInfo.name + ".\r\n"
    + "\r\n"
    + "As " + studentFirstName + "'s teacher, please let TutorMilton know (by clicking the link below) whether " + studentFirstName + " is qualified to tutor in this subject.\r\n"
    + baseAppUrl + "?page=teacher-approve-tutor&requestId=" + nextRow + "\r\n"
    + "\r\n"
    + "Thanks,\r\n"
    + groupName;
    
    var emailSubject = studentFirstName + " " + studentLastName + " tutoring in " + courseInfo.name;
    
    Logger.log("about to send email");
    
    MailApp.sendEmail(teacherEmail, emailSubject, plainBody,{
      htmlBody: htmlbody
    });
    
    Logger.log("sent email; about to return");
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
