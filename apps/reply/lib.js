exports.reply = function (options) {
  var keyboard = "textinput";
  try {
    keyboard = require(keyboard);
  } catch (e) {
    keyboard = null;
  }

  function constructReply(msg, replyText, resolve) {
    var responseMessage = {msg: replyText};
    if (msg.id) {
      responseMessage = { t: "notify", id: msg.id, n: "REPLY", msg: replyText };
    }
    E.showMenu();
    layout.setUI();
    layout.render();
    if (options.sendReply == null || options.sendReply) {
      Bluetooth.println(JSON.stringify(result));
    }
    resolve(responseMessage);
  }

  return new Promise((resolve, reject) => {
    var menu = {
      "": {
        title: options.title || /*LANG*/ "Reply with:",
        back: function () {
          E.showMenu();
          layout.setUI();
          layout.render();
          reject("User pressed back");
        },
      }, // options
      /*LANG*/ "Compose": function () {
        keyboard.input().then((result) => {
          constructReply(options.msg ?? {}, result, resolve);
        });
      },
    };
    var replies =
      require("Storage").readJSON(
        options.fileOverride || "replies.json",
        true
      ) || {};
    replies.forEach((reply) => {
      menu = Object.defineProperty(menu, reply.text, {
        value: () => constructReply(options.msg ?? {}, reply.text, resolve),
      });
    });
    if (!keyboard) delete menu[/*LANG*/ "Compose"];

    if (replies.length == 0) {
      if (!keyboard) {
        E.showPrompt(
          /*LANG*/ "Please install a keyboard app, or set a custom reply via the app loader!",
          {
            buttons: { Ok: true },
            remove: function () {
              layout.setUI();
              layout.render();
              reject(
                "Please install a keyboard app, or set a custom reply via the app loader!"
              );
            },
          }
        );
      } else {
        keyboard.input().then((result) => {
          constructReply(options.msg.id, result, resolve);
        });
      }
    }
    E.showMenu(menu);
  });
};
