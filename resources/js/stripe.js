import { loadStripe } from "@stripe/stripe-js";
import { placeOrder } from "./apiService";
import { CardWidget } from "./CardWidget";

export async function initStripe() {
  const stripe = await loadStripe(
    "pk_test_51LI0OXFxtxuTio1GJzoFbum9YJz7NaspxBpxxsEJmudODjdqBpHg1AsqMCHCG7PhAA7gp2jkWQcw9RNKNJxSBhXg001xJA68pY"
  );
  let card = null;

  const paymentType = document.querySelector("#paymentType");
  if (!paymentType) {
    return;
  }
  paymentType.addEventListener("change", (e) => {
    if (e.target.value === "card") {
      // Display Widget
      card = new CardWidget(stripe);
      card.mount();
    } else {
      card.destroy();
    }
  });

  // Ajax call
  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let formData = new FormData(paymentForm);
      let formObject = {};
      for (let [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      if (!card) {
        // Ajax
        placeOrder(formObject);
        return;
      }

      const token = await card.createToken();
      formObject.stripeToken = token.id;
      placeOrder(formObject);
    });
  }
}
