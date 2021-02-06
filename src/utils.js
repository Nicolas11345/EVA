export function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
}

export function formatDate(date){
    date = new Date(date);

    let dd = date.getDate();
    let mm = date.getMonth()+1; 
    let yyyy = date.getFullYear();

    if (dd < 10) {
        dd='0'+dd;
    }
    if (mm < 10) {
        mm='0'+mm;
    } 

    date = dd+'/'+mm+'/'+yyyy;
    return date;
}

export function isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}