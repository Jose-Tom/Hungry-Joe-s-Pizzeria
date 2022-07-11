const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");
const dataController = require("../app/http/controllers/admin/dataController");

// Middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");
const confirmpassword = require("../app/http/middlewares/confirmpassword");

const multer = require("multer");

//define storage for the images

const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, "./public/img");
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 10,
  },
});

function initRoutes(app) {
  // ROUTES
  app.get("/", homeController().index);
  app.get("/menu", auth, homeController().menu);

  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);

  app.get("/otplogin", authController().otploginpage);
  app.post("/otplogin", authController().otploginsend);
  app.get("/otploginverify", authController().otpverifypage);
  app.post("/otploginverify", authController().otploginverify);

  app.get("/register", guest, authController().register);
  app.post("/register", confirmpassword, authController().postRegister);

  app.post("/logout", authController().logout);
  app.post("/user/update", auth, authController().update);
  app.post("/user/delete", auth, authController().delete);

  // Customer routes

  app.post("/orders", auth, orderController().store);
  app.post("/coupon/apply", cartController().couponApply);
  app.get("/cart", cartController().index);
  app.post("/cart/update", cartController().update);
  app.post("/emptycart", cartController().delete);
  app.post("/cart/minusitem", cartController().minusitem);
  app.post("/cart/plusitem", cartController().plusitem);
  app.get("/customer/orders", auth, orderController().index);
  app.get("/customer/orders/:id", auth, orderController().show);
  app.get("/customer/profile", auth, authController().profile);

  // Admin routes
  app.get("/admin/orders", admin, adminOrderController().index);
  app.get(
    "/admin/orders/orderslist7",
    admin,
    adminOrderController().sendOrdersList7
  );
  app.get(
    "/admin/orders/orderslist30",
    admin,
    adminOrderController().sendOrdersList30
  );
  app.get(
    "/admin/orders/orderslistMonthly",
    admin,
    adminOrderController().sendOrdersListMonthly
  );
  app.get(
    "/admin/orders/orderslistPieChart",
    admin,
    adminOrderController().sendOrdersListPieChart
  );
  app.post("/admin/order/status", admin, statusController().update);
  app.get("/admin/customers", admin, dataController().showCustomers);
  app.get("/admin/offers", admin, dataController().offersPage);
  app.get("/admin/addoffer", admin, dataController().addofferPage);
  app.post("/admin/addoffer", admin, dataController().addoffer);
  app.post("/admin/editoffer", admin, dataController().editofferpage);
  app.post("/admin/removeoffer", admin, dataController().removeoffer);
  app.get("/admin/menuitems", admin, dataController().menuItemsPage);
  app.post("/admin/updateoffer", admin, dataController().updateoffer);
  app.get("/admin/additem", admin, dataController().addItemsPage);
  app.post(
    "/admin/additem",
    admin,
    upload.single("image"),
    dataController().addItem
  );

  app.post("/admin/edititem", admin, dataController().editItemPage);
  app.post("/admin/deleteitem", admin, dataController().deleteItem);
  app.post("/admin/restoreitem", admin, dataController().restoreItem);
  app.post(
    "/admin/updateitem",
    admin,
    upload.single("image"),
    dataController().updateitem
  );
  app.get("/admin/reports", admin, dataController().reports);

  app.post("/admin/blockuser", admin, authController().blockuser);
  app.post("/admin/unblockuser", admin, authController().unblockuser);
  app.post("/admin/removeuser", admin, authController().removeuser);
}

module.exports = initRoutes;
