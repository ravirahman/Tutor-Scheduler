function processStudentRequest(data) {
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
                if (keyParts[0] == "times" && data[key] != false && data[key] != "false" && (data[key] == "onCampus" || data[key] == "offCampus")) {
                    scheduleData[keyParts[1]] = data[key];
                }
            }
        }
        //validate the data
        //course: should have a value
        var courseValue = data.course;
        if (!courseValue || courseValue == "false") {
            throw "Please select a course.";
        }

        //teacher-email: should be an email
        var teacherEmail = data["teacher-email"];
        if (! /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(teacherEmail) || teacherEmail.substr(teacherEmail.length - 11) != "@" + domain) {
            throw "Please enter your teacher's email address";
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
        var tutorSheet = SpreadsheetApp.openById(sheetId);
        var pairingAssignments = tutorSheet.getSheetByName("PairingAssignments");
        var nextRow = pairingAssignments.getLastRow() + 1;
        var courseInfo = JSON.parse(courseValue);
        var tutorFindResults = MatcherFind_(courseInfo.subject,courseInfo.class,courseInfo.level,courseInfo.name,teacherEmail,scheduleData,duration,[]);
        if (tutorFindResults.success == false) {
            return {
                success: false,
                message: tutorFindResults.message
            };
        }

        var values = [[nextRow,new Date().toLocaleString(),data.userEmail,cellPhone,courseInfo.subject,courseInfo.class,courseInfo.level,courseInfo.name,teacherEmail,JSON.stringify(scheduleData),duration,description,JSON.stringify(tutorFindResults.tutors)]];


        var thisAssignmentRange = pairingAssignments.getRange(nextRow, 1, 1, 13);
        thisAssignmentRange.setValues(values);

        tutorFindResults.tutors.forEach(function(tutor) {
            MatcherContactTutor_(nextRow,tutor.tutorEmail);
        });

        return {
            success: true
        };
    }
    catch(e) {
        return {
            success: false,
            message: e
        };
    }
}
