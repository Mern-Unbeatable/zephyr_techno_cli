import React from "react";
import { Link } from "react-router";
import { FiXCircle, FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import Container from "../../../layout/Container";

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="max-w-xl mx-auto py-16">
          <div className="flex flex-col items-center gap-4 text-center mb-10">
            <FiXCircle className="w-20 h-20 text-orange-400" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-gray-900">Payment Cancelled</h1>
            <p className="text-gray-500 text-base max-w-md">
              Your payment was not completed. No worries - your cart items are still saved.
            </p>
          </div>

          <div className="bg-[#F6F7F9] rounded-xl p-6 mb-8 space-y-3">
            <p className="text-sm text-gray-700">
              You can safely return to checkout and try again.
            </p>
            <p className="text-sm text-gray-500">
              If this keeps happening, please try another payment method or contact support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/checkout"
              className="flex-1 text-center bg-custom hover:bg-[#349eab] text-white py-3 rounded-md text-[15px] font-medium transition-colors"
            >
              Retry Payment
            </Link>
            <Link
              to="/cart"
              className="flex-1 text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-md text-[15px] font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <FiShoppingCart className="w-4 h-4" />
              Back to Cart
            </Link>
          </div>

          <div className="mt-4">
            <Link
              to="/products"
              className="text-sm text-gray-500 hover:text-custom transition-colors inline-flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CheckoutCancel;
