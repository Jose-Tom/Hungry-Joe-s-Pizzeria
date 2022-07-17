import axios from "axios";
import Noty from "noty";
import moment from "moment";
import { initAdmin } from "./admin";

let addToCart = document.querySelectorAll(".add-to-cart");
let blockUser = document.querySelectorAll(".block-user");
let unblockUser = document.querySelectorAll(".unblock-user");
let removeUser = document.querySelectorAll(".remove-user");
let removeOffer = document.querySelectorAll(".remove-offer");
let makePayment = document.querySelectorAll(".make-payment");

function updateCart(pizza) {
  // console.log(pizza);
  axios
    .post("/cart/update", pizza)
    .then((res) => {
      // console.log(res);
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 1000,
        text: "Item added to cart",
        progressBar: false,
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    //  console.log(pizza);
    updateCart(pizza);
  });
});

blockUser.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let user = JSON.parse(btn.dataset.user);
    axios.post("/admin/blockuser", { user: user }).then((response) => {
      window.location.reload();
    });
  });
});

unblockUser.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let user = JSON.parse(btn.dataset.user);
    axios.post("/admin/unblockuser", { user: user }).then((response) => {
      window.location.reload();
    });
  });
});

removeUser.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let user = JSON.parse(btn.dataset.user);
    axios.post("/admin/removeuser", { user: user }).then((response) => {
      window.location.reload();
    });
  });
});

removeOffer.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let code = JSON.parse(btn.dataset.offer).code.toUpperCase();
    console.log(code);
    axios.post("/admin/removeoffer", { code: code }).then((response) => {
      window.location.reload();
    });
  });
});

makePayment.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let order = JSON.parse(btn.dataset.order);
    console.log(order);
    if (order.paymentType === "card") {
      // console.log(order);
      loadRazorpay();

      function loadRazorpay() {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onerror = () => {
          alert("Razorpay SDK failed to load. Are you online?");
        };
        script.onload = async () => {
          try {
            console.log(order.totalPrice);
            const result = await axios.post("/create-order", {
              amount: order.totalPrice,
            });

            const { amount, id: order_id, currency } = result.data;

            const {
              data: { key: razorpayKey },
            } = await axios.get("/get-razorpay-key");

            const options = {
              key: razorpayKey,
              amount: amount.toString(),
              currency: currency,
              name: order.phone,
              description: "example transaction",
              order_id: order_id,
              handler: async function (response) {
                const result = await axios
                  .post("/pay-order", {
                    amount: amount,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                    order: order,
                  })
                  .then(() => {
                    setTimeout(function () {
                      new Noty({
                        type: "success",
                        timeout: 1000,
                        text: res.data.message,
                        progressBar: false,
                      }).show();
                      window.location.href = "/";
                    }, 2000);
                  });
              },
              theme: {
                color: "#80c0f0",
              },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
          } catch (err) {
            console.log(err);
          }
        };
        document.body.appendChild(script);
      }
    } else if (order.paymentType === "paypal") {
      axios.post("/paypal/pay", {
        order: order,
      });
    }
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 5000);
}

initAdmin();

// Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });
  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm  YYYY-MM-DD A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

// Socket
let socket = io();
initAdmin(socket);
// Join
if (order) {
  socket.emit("join", `order_${order._id}`);
}
let adminAreaPath = window.location.pathname;
console.log(adminAreaPath);
if (adminAreaPath.includes("admin")) {
  socket.emit("join", "adminRoom");
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: "success",
    timeout: 1000,
    text: "Order updated",
    progressBar: false,
  }).show();
});
