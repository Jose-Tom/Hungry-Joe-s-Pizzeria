import axios from "axios";
import Noty from "noty";
import moment from "moment";
import { initAdmin } from "./admin";

let addToCart = document.querySelectorAll(".add-to-cart");
let blockUser = document.querySelectorAll(".block-user");
let unblockUser = document.querySelectorAll(".unblock-user");
let removeUser = document.querySelectorAll(".remove-user");
let removeOffer = document.querySelectorAll(".remove-offer");

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
      time.innerText = moment(order.updatedAt).format("hh:mm A");
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
