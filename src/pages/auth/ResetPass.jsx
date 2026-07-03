import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import leftsideImage from "../../assets/auth/resetPass.jpg";
import { GoArrowLeft } from "react-icons/go";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const ResetPass = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email] = useState(
    location.state?.email || sessionStorage.getItem("verifiedResetPasswordEmail") || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate("/forget-password", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Must be at least 8 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!email) {
      setErrors({ submit: "Email is missing. Please request a new reset code." });
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ email, newPassword: formData.password });
      sessionStorage.removeItem("verifiedResetPasswordEmail");

      await Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "You can now sign in with your new password.",
        confirmButtonColor: "#0891b2",
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Unable to reset your password right now.",
      }));
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
          alt="Reset Password"
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
            Reset Password
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
            Create a new password. It must be at least 8 characters.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8+ characters"
                  className={`input w-full bg-[#ebecf0] border-none focus:outline-none pr-10 ${errors.password ? "border! border-red-400!" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`input w-full bg-[#ebecf0] border-none focus:outline-none pr-10 ${errors.confirmPassword ? "border! border-red-400!" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-custom w-full text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Updating..." : "Reset Password →"}
            </button>
            {errors.submit ? (
              <p className="text-red-500 text-xs mt-3">{errors.submit}</p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
