import { useState } from "react";
import { Link, useNavigate } from "react-router";
import leftsideImage from "../../assets/auth/forgetpass.jpg";
import { GoArrowLeft } from "react-icons/go";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const ForgetPass = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword({ email });
      sessionStorage.setItem("pendingResetPasswordEmail", email);

      await Swal.fire({
        icon: "success",
        title: "Check your email",
        text: "If the email exists, we sent a reset code.",
        confirmButtonColor: "#0891b2",
      });

      navigate("/verify-code", { replace: true, state: { email } });
    } catch (err) {
      setError(err.message || "Unable to send reset email right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Left - Image */}
      <div className="hidden md:block w-1/2 h-full overflow-hidden">
        <img
          src={leftsideImage}
          className="w-full h-full ken-burns-image object-cover"
          alt="Forget Password"
        />
      </div>

      {/* Top-right Back Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => navigate("/login")}
          aria-label="Back to Login"
          className="flex items-center gap-0.5 duration-300 px-3 py-2 transition cursor-pointer hover:scale-105"
        >
          <GoArrowLeft className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">Back</span>
        </button>
      </div>

      {/* Right - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-10 overflow-y-auto">
        <div className="w-full max-w-sm form-stagger">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
            Forgot Password
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
            Enter your email address linked to your account.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                placeholder="Enter your registered email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={`input w-full bg-[#ebecf0] border-none focus:outline-none ${error ? "border! border-red-400!" : ""}`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-custom w-full text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-custom font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            New to Zephyr?{" "}
            <Link
              to="/register"
              className="text-custom font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPass;
