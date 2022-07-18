const order = require("../../../models/order");

function orderController() {
  return {
    index(req, res) {
      order
        .find({ status: { $ne: "completed" } }, null, {
          sort: { createdAt: -1 },
        })
        .populate("customerId", "-password")
        .exec((err, orders) => {
          if (req.xhr) {
            return res.json(orders);
          } else {
            return res.render("admin/orders");
          }
        });
    },

    sendOrdersList7(req, res) {
      order
        .aggregate([
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              totalSales: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 7 },
        ])
        .then((orders) => {
          //  console.log(orders);
          return res.send({ orders: orders });
        });
    },

    sendOrdersList30(req, res) {
      order
        .aggregate([
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              totalSales: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 30 },
        ])
        .then((orders) => {
          //  console.log(orders);
          return res.send({ orders: orders });
        });
    },

    sendOrdersListMonthly(req, res) {
      order
        .aggregate([
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$createdAt" },
              },
              totalSales: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 12 },
          { $sort: { _id: 1 } },
        ])
        .then((orders) => {
          //  console.log(orders);
          return res.send({ orders: orders });
        });
    },

    sendOrdersListPieChart(req, res) {
      order
        .aggregate([
          {
            $group: {
              _id: "$paymentType",
              totalCount: { $sum: 1 },
            },
          },
        ])
        .then((orders) => {
          // console.log(orders);
          return res.send({ orders: orders });
        });
    },
  };
}

module.exports = orderController;
