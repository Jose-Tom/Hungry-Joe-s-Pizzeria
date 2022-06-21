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

  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);

  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);

  app.post("/logout", authController().logout);
  app.post("/user/update", auth, authController().update);
  app.post("/user/delete", auth, authController().delete);

  // Customer routes
  // app.post("/orders", auth, orderController().store);
  app.post("/orders", auth, orderController().store);
  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
  app.post("/emptycart", cartController().delete);
  app.post("/cart/minusitem", cartController().minusitem);
  app.post("/cart/plusitem", cartController().plusitem);
  app.get("/customer/orders", auth, orderController().index);
  app.get("/customer/orders/:id", auth, orderController().show);
  app.get("/customer/profile", auth, authController().profile);

  // Admin routes
  app.get("/admin/orders", admin, adminOrderController().index);
  app.post("/admin/order/status", admin, statusController().update);
  app.get("/admin/customers", admin, dataController().showCustomers);
  app.get("/admin/menuitems", admin, dataController().menuItemsPage);
  app.get("/admin/additem", admin, dataController().addItemsPage);
  app.post(
    "/admin/additem",
    admin,
    upload.single("image"),
    dataController().addItem
  );
  app.post("/admin/deleteitem", admin, dataController().deleteItem);
  app.get("/admin/reports", admin, dataController().reports);
}

module.exports = initRoutes;
