import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createOrder } from "../services/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, total, shippingAddress } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    // Redirect if required data is missing
    if (!cart || !total || !shippingAddress) {
      toast.error("Missing payment details. Redirecting to checkout...");
      navigate("/checkout");
    }
  }, [cart, total, shippingAddress, navigate]);

  const handleConfirmPayment = async () => {
    // Validate payment method selection
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    setProcessing(true);

    try {
      // 1. Prepare the sanitized items array from your cart or order data
      const sanitizedItems = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
      }));

      // 2. Prepare the shipping info from your form or stored state
      const shippingInfo = {
        street: shippingAddress.street,
        city: shippingAddress.city,
        country: shippingAddress.country,
        postalCode: shippingAddress.postalCode,
      };

      // 3. Calculate or parse the total amount
      const orderTotal = total;

      // 4. Simulate payment processing based on method
      let transactionId = null;
      if (paymentMethod === "click") {
        transactionId = `CLICK-${Date.now()}`; // Mock transaction ID for Click
        toast.success(
          `Please transfer $${orderTotal} to phone number +962799999999. Transaction ID: ${transactionId}`
        );
      } else if (paymentMethod === "visa") {
        // Validate card details (basic check)
        if (
          !cardDetails.cardNumber ||
          !cardDetails.expiryDate ||
          !cardDetails.cvv ||
          cardDetails.cardNumber.length !== 16 ||
          cardDetails.expiryDate.length !== 5 ||
          cardDetails.cvv.length !== 3
        ) {
          toast.error("Please enter valid card details.");
          setProcessing(false);
          return;
        }
        transactionId = `VISA-${Date.now()}`; // Mock transaction ID for Visa
        toast.success("Payment processed successfully! Transaction ID: " + transactionId);
      }

      // 5. Create the orderData object with correct structure
      const orderData = {
        items: sanitizedItems,
        shippingAddress: shippingInfo,
        totalAmount: parseFloat(orderTotal),
        paymentMethod: paymentMethod,
        transactionId: transactionId,
      };

      console.log("Order data to send:", orderData);

      // 6. Call your API with the orderData
      const response = await createOrder(orderData);

      // 7. Clear the cart from localStorage
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        localStorage.removeItem("cart");
        console.log("Cart cleared successfully after order creation.");
      } else {
        console.log("No cart found in localStorage to clear.");
      }

      // 8. On success, redirect to order confirmation
      navigate("/order-confirmation", {
        state: { orderId: response.data._id, cart },
      });
      console.log("Navigating to /order-confirmation with orderId:", response.data._id);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment or order creation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#bc7265]">Payment Page</h1>

        {/* Order Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#bc7265]">Order Summary</h2>
          {cart?.map((item, index) => {
            const product = item.product || item;
            const quantity = item.quantity || 1;
            const price = product.discountedPrice || product.price || 0;

            return (
              <div key={index} className="flex justify-between mb-1">
                <span>{product.name} x {quantity}</span>
                <span>${(price * quantity).toFixed(2)}</span>
              </div>
            );
          })}
          <div className="flex justify-between font-semibold mt-4">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#bc7265]">Select Payment Method</h2>
          <div className="flex gap-4 justify-center">
            {/* Click Payment Option */}
            <div
              className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                paymentMethod === "click"
                  ? "border-[#bc7265] bg-[#f9f1f0]"
                  : "border-gray-300 hover:border-[#d39c94]"
              }`}
              onClick={() => setPaymentMethod("click")}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6 text-[#bc7265]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm0 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm0 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Click</span>
              </div>
            </div>

            {/* Visa Card Payment Option */}
            <div
              className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                paymentMethod === "visa"
                  ? "border-[#bc7265] bg-[#f9f1f0]"
                  : "border-gray-300 hover:border-[#d39c94]"
              }`}
              onClick={() => setPaymentMethod("visa")}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6 text-[#bc7265]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M3 6h18M3 14h18M3 18h18"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Visa Card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details Based on Method */}
        {paymentMethod === "click" && (
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold text-[#bc7265]">
              Please transfer ${total} to phone number: +962799999999
            </p>
            <p className="text-gray-600">
              After transferring, click "Confirm Payment" to complete your order.
            </p>
          </div>
        )}

        {paymentMethod === "visa" && (
          <div className="mb-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#bc7265]">Enter Card Details</h2>
            <input
              type="text"
              value={cardDetails.cardNumber}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, cardNumber: e.target.value })
              }
              placeholder="Card Number (16 digits)"
              className="w-full p-2 border rounded"
              maxLength={16}
            />
            <div className="flex gap-4">
              <input
                type="text"
                value={cardDetails.expiryDate}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                }
                placeholder="MM/YY"
                className="w-1/2 p-2 border rounded"
                maxLength={5}
              />
              <input
                type="text"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cvv: e.target.value })
                }
                placeholder="CVV (3 digits)"
                className="w-1/2 p-2 border rounded"
                maxLength={3}
              />
            </div>
          </div>
        )}

        {/* Confirm Payment Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={processing}
          className={`w-full px-6 py-3 bg-[#bc7265] text-white rounded-lg hover:bg-[#d39c94] transition-colors ${
            processing ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {processing ? "Processing..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;