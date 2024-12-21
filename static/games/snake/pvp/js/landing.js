const codeInput = document.querySelector("#inputCode");

document.forms[0].onsubmit = function setCookie() {

    const date = new Date();
    date.setTime(date.getTime() + (30*24*60*60*1000));
    const code = document.querySelector("#inputCode").value
    CookieUtil.set("code", code, 30);
}

window.onload = function() {
    const code = CookieUtil.get("code");
    if (code) {
        codeInput.value = code;
    }
}
