const Order = require("../../../../app/models/order");

function statusController() {
  return {
    update(req, res) {
      Order.updateOne(
        { _id: req.body.orderId },
        { status: req.body.status },
        async (err, data) => {
          if (err) {
            return res.redirect("/admin/orders");
          }
          // Emit event
          const eventEmitter = await req.app.get("eventEmitter");
          eventEmitter?.emit("orderUpdated", {
            id: req.body.orderId,
            status: req.body.status,
          });
          return res.redirect("/admin/orders");
        }
      );
    },
  };
}

module.exports = statusController;
