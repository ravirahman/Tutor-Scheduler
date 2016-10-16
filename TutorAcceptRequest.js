function tutorAcceptRequest(data) {
    if (!validateHash_(data)) {
        throw "Bad Hash";
    }
    if (!data.userEmail) {
        throw "You are not logged in. Please use your " + orgAccountName + " Account.";
    }
    var pairId = parseInt(data.pairid);
    var period = data.times;
    var tutorEmail = data.userEmail;
    var tutorSheet = SpreadsheetApp.openById(sheetId);
    var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
    var range = pairingAssignments.getDataRange();
    var rangeArray = range.getValues();
    rangeArray.shift();
    var validId = false;
    var foundATutor = false;
    for (var i = 0; i < rangeArray.length; i++) {
        var row = rangeArray[i];
        if (row[0] == pairId) {
            validId = true;
            if ((row[13] != false && row[13] != "") || row[16] === false) {
                foundATutor = true;
                break;
            }
            //validate the period
            var ap = (function(){try { return JSON.parse(row[9]); } catch(e) { return {} }})();
            if (!ap.hasOwnProperty(period)) { //row9 are student marked available periods
                return {
                    success: false,
                    message: "Invalid time"
                };
            }
            var locationAbbr = ap[period];
            //ok valid period

            //ok go ahead and insert the tutor's email into TutorAccepted and the period into the Period
            var editRange = pairingAssignments.getRange(i + 2, 14, 1, 4);
            var datestring = new Date().toLocaleString();
            editRange.setValues([[tutorEmail,period,datestring,true]]);

            //create the calendar series and send out the invitation

            var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var startdate = getStartDate(row[10]);
            var enddate = getEndDate(row[10]);
            var meeting = period;
            var day = period.substring(0,3);
            var periodTime = period.substring(3,5);
            var recurrence = CalendarApp.newRecurrence();
            var firstdate = null;
            var tutorFirstName = getFirstName(tutorEmail);
            var tutorLastName = getLastName(tutorEmail);
            var studentEmail = row[2];
            var studentFirstName = getFirstName(studentEmail);
            var studentLastName = getLastName(studentEmail);
            var durationName = getDurationName(row[10]);

            //get the tutor's cell phone

            var tutorList = tutorSheet.getSheetByName("TutorList");
            var tlrange = tutorList.getDataRange();
            var tlarray = tlrange.getValues();
            var tutorCellPhone;
            tlarray.shift();
            tlarray.forEach(function(tutorrowentry) {
                if (tutorrowentry[0] == tutorEmail) {
                    tutorCellPhone = formatPhone(tutorrowentry[1]);
                }
            });

            var studentCellPhone = formatPhone(row[3]);
            var locationName = getLocationName(locationAbbr);


            for (var dsdate in schedule) {
                if (schedule.hasOwnProperty(dsdate)) {
                    var cmonth = dsdate.substring(1,3);
                    var cday = dsdate.substring(3,5);
                    var cyear = "20" + dsdate.substring(5,7);
                    var today = new Date(monthNames[cmonth-1] + " " + cday + ", " + cyear); //not actual today's date, but the date of the current event to create.
                    var sday = schedule[dsdate];
                    if (today.getTime() >= startdate.getTime() && today.getTime() <= enddate.getTime()) {
                        var actualDayOfWeek;
                        switch(today.getDay()) {
                            case 0:
                                actualDayOfWeek = "SUN";
                                break;
                            case 1:
                                actualDayOfWeek = "MON";
                                break;
                            case 2:
                                actualDayOfWeek = "TUE";
                                break;
                            case 3:
                                actualDayOfWeek = "WED";
                                break;
                            case 4:
                                actualDayOfWeek = "THU";
                                break;
                            case 5:
                                actualDayOfWeek = "FRI";
                                break;
                            case 6:
                                actualDayOfWeek = "SAT";
                                break;
                        }
                        var academicPeriods = ["p1","p2","p3","p4","p5","p6","p7","p8"]; //academic periods follow monday/tuesday schedule swaps; non-academic periods following the actual calendar day
                        var isAnAcademicPeriod = academicPeriods.indexOf(periodTime) !== -1;

                        if (//check to see if the class meets on this day of school.
                        (isAnAcademicPeriod && (day == sday))
                        || (!isAnAcademicPeriod && (day == actualDayOfWeek))
                        ) {
                            var startTime = getPeriodStartTime(periodTime);
                            var endTime = getPeriodEndTime(periodTime);
                            var startDate = new Date(today.getTime());
                            var endDate = new Date(today.getTime());
                            startDate.setHours(startTime.substring(0,startTime.indexOf(":")));
                            startDate.setMinutes(startTime.substring(startTime.indexOf(":")+1));
                            endDate.setHours(endTime.substring(0,endTime.indexOf(":")));
                            endDate.setMinutes(endTime.substring(endTime.indexOf(":")+1));
                            //ok so startDate and endDate are the actual period start and end times
                            Logger.log(startDate);
                            Logger.log(endDate);
                            Logger.log("...");
                            var monthName = monthNames[cmonth-1];
                            Calendar.Events.insert({
                                anyoneCanAddSelf: false,
                                attendees: [
                                    {
                                        email: tutorEmail,
                                        displayName: getFirstName(tutorEmail) + " " + getLastName(tutorEmail),
                                        responseStatus: "accepted"
                                    },
                                    {
                                        email: studentEmail,
                                        displayName: getFirstName(studentEmail) + " " + getLastName(studentEmail),
                                        responseStatus: "accepted"
                                    }
                                ],
                                description: "A virtual introduction: \r\n"
                                + "\r\n"
                                + "Student: " + studentFirstName + " " + studentLastName + " (cell phone: " + studentCellPhone + ")\r\n"
                                + "Tutor: " + tutorFirstName + " " + tutorLastName + " (cell phone: " + tutorCellPhone + ")\r\n",
                                end: {
                                    dateTime: endDate.toISOString(),
                                    timeZone: "America/New_York"
                                },
                                extendedProperties: {
                                    shared: {
                                        tutorPaidId: pairId
                                    }
                                },
                                location : locationName,
                                reminders: {
                                    useDefault: false
                                },
                                start: {
                                    dateTime: startDate.toISOString(),
                                    timeZone: "America/New_York"
                                },
                                summary: row[7] + " Tutoring"
                            }, calendarId);
                        }
                    }
                }
            }


            //go into tutorlist and mark the tutor as occupied
            var tutorList = tutorSheet.getSheetByName("TutorList");
            var range1 = tutorList.getDataRange();
            var rangeValues = range1.getValues();
            for (var i = 1; i < rangeValues.length; i++) {
                var row2 = rangeValues[i];
                //row[0] = email; row[1] = phone; row[2] = json of available slots; row[3] = json of occupied slots
                if (row2[0] == tutorEmail) {
                    var thisTutorRange = tutorList.getRange(i + 1, 4, 1, 1);
                    var thisTutorValues = thisTutorRange.getValues();
                    var currentCommitments = (function(){try { return JSON.parse(thisTutorValues[0][0]) } catch(e) { return {} }})();
                    if (!currentCommitments.hasOwnProperty(row[10])) {
                        currentCommitments[row[10]] = {};
                    }
                    currentCommitments[row[10]][period] = pairId;
                    thisTutorRange.setValues([[JSON.stringify(currentCommitments)]]);
                    break;
                }
            }
            //send an email to tutor and student


            var locationNameExplicit = locationAbbr == "onCampus" ? "Cox Library, 3rd Floor" : "Virtual Meeting";
            var dayName =  getDayName(day);

            var periodName = getPeriodName(periodTime);

            var htmlbody = "<html><head></head><body style='font-size: 14px;'>Dear " + getFirstName(studentEmail) + " and " + getFirstName(tutorEmail) + ",<br />"
                + "<br />"
                + "Here's your <b>" + row[7] + "</b> tutoring commitment.<br />"
                + "<br />"
                + "A virtual introduction:<br />"
                + "<br />"
                + "Student: <b>" + studentFirstName + " " + studentLastName + "</b> (cell phone: " + studentCellPhone + ")<br />"
                + "Tutor: <b>" + tutorFirstName + " " + tutorLastName + "</b> (cell phone: " + tutorCellPhone + ")<br />"
                + "<br />"
                + "When: " + "<b>" + dayName + "</b>, <b>" + periodName + "</b> for the <b>" + durationName + "</b><br />"
                + "Where: <b>" + locationNameExplicit + "</b> <br />"
                + "<br />"
                + "Both, feel free to contact each other DIRECTLY (for example, if you would like to meet somewhere else or to arrange a virtual meeting). Thank you!<br />"
                + "<br />"
                + "Love,<br />"
                + groupName + "</body></html>";

            var plainBody = "Dear " + getFirstName(studentEmail) + " and " + getFirstName(tutorEmail) + ",\r\n"
                + "\r\n"
                + "Here's your " + row[7] + " tutoring commitment.\r\n"
                + "\r\n"
                + "A virtual introduction:\r\n"
                + "\r\n"
                + "Student: " + studentFirstName + " " + studentLastName + " (cell phone: " + studentCellPhone + ")\r\n"
                + "Tutor: " + tutorFirstName + " " + tutorLastName + " (cell phone: " + tutorCellPhone + ")\r\n"
                + "\r\n"
                + "When: " + dayName + ", " + periodName + " for the " + durationName + "\r\n"
                + "Where: " + locationNameExplicit + "\r\n"
                + "\r\n"
                + "Both, feel free to contact each other DIRECTLY (for example, if you would like to meet somewhere else or to arrange a virtual meeting). Thank you!\r\n"
                + "\r\n"
                + "Love,\r\n"
                + groupName;

            var emailSubject = row[7] + " Tutoring";
            MailApp.sendEmail(studentEmail + "," + tutorEmail, emailSubject, plainBody,{
                htmlBody: htmlbody
            });

            //ok now go ahead and cancel all active appointments the student had for this subject
            for (var j = 0; j < rangeArray.length; j++) {
                var row2 = rangeArray[j];
                var mustMatch = [2,4,5,6,7,10]; //column numbers that must match between row and row2
                var isAMatch = true;
                Logger.log(row2[0] + ": ");
                Logger.log(row2[16] === false);
                Logger.log("...");
                if (row2[0] == row[0] || row2[16] != true) { //id can't match and must not already be true
                    isAMatch = false;
                }

                mustMatch.forEach(function(colNumber) {
                    if (row2[colNumber] != row[colNumber]) {
                        isAMatch = false;
                    }
                });

                Logger.log("testing matches");
                if (isAMatch == true) {
                    Logger.log("matches");
                    MatcherCancelCommitment_(row2[0],"Student has a new tutor for this subject","STUDENT",row2[2] == row[2]);
                    //last param is true if we have the same tutor, which means to supress the email notification.
                }
            }
            break;
        }
    }
    if (foundATutor) {
        return {
            success: false,
            message: "Another tutor just accepted tutoring this student. Thanks though!"
        };
    }
    else if (!validId) {
        return {
            success: false,
            message: "The pairid was invalid"
        };
    }
    else {
        return {
            success: true
        };
    }
}