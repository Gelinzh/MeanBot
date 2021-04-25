function sendEmail(subject) {
  var address = "Acelych@foxmail.com"
  var message = new Date() + " Telegram Bot Log";
  MailApp.sendEmail(address, message, subject);
}
