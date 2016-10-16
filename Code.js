var params;

function doGet(e) {
    var page = "home";
    if (e.parameter.hasOwnProperty("page")) {
        page = e.parameter.page;
    }
    params = e.parameter;

    var title = page.split("-").join(" ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    return HtmlService.createTemplateFromFile(page).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(title + " - " + appName);
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).asTemplate().evaluate().getContent();
}

var email = Session.getActiveUser().getEmail();

function validateHash_(data) {
    try {
        return generateHash_(data.userEmail) == data.userHash;
    }
    catch(e) {
        return false;
    }
}
function generateHash_(emailAddr) {
    if (!emailAddr) {
        emailAddr = email;
    }
    return Sha256.hash(emailAddr + " " + secretKey);
}

function stripPhone(phoneNumber) {
    return phoneNumber.toString().split(".").join("").split("-").join("").split("(").join("").split(" ").join("").split(")").join("");
}

function formatPhone(phoneNumber) {
    var bareNumber = phoneNumber.toString().split(".").join("").split("-").join("").split("(").join("").split(" ").join("").split(")").join("");
    return bareNumber.substring(0,3) + "." + bareNumber.substring(3,6) + "." + bareNumber.substring(6,10);
}

function isLoggedIn() {
    if (!email) {
        return false;
    }
    return email != "";

}

function modu(num,div) {
    return ((num%div)+div)%div;
}



function getDayName(day) {
    switch(day) {
        case "MON":
            return "Monday";
            break;
        case "TUE":
            return "Tuesday";
            break;
        case "WED":
            return "Wednesday";
            break;
        case "THU":
            return "Thursday";
            break;
        case "FRI":
            return "Friday";
            break;
        case "SAT":
            return "Saturday";
            break;
        case "SUN":
            return "Sunday";
            break;
    }
}

function getLocationName(location) {
    var locationName;
    if (location == "onCampus") {
        locationName = "On Campus";
    }
    else {
        locationName = "Virtually Off Campus";
    }
    return locationName;
}

function getMoveJargon(tfb) {
    return tfb === true ? "Reschedule the commitment" : tfb === false ? "Reinstate this commitment" : "Change duration / free periods";
}