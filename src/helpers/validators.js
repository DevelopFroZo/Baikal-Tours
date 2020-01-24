export {
    validatePhone,
    validateMail
}

function validatePhone(e) {
    if (
        !(
            (e.key >= "0" && e.key <= "9") ||
            e.key == "+" ||
            e.key == "(" ||
            e.key == ")" ||
            e.key == "-" ||
            e.key == "ArrowLeft" ||
            e.key == "ArrowRight" ||
            e.key == "Delete" ||
            e.key == "Backspace" ||
            e.key == "Tab"
        )
    ) e.preventDefault();
}

function validateMail(mail){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(mail).toLowerCase());
}

