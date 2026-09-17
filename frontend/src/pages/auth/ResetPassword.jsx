import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { resetPassword } from "../../services/api/authApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!token) {
      newErrors.token = "Invalid or missing reset token.";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(token, formData.newPassword);

      if (response.success) {
        setSuccess(true);

        toast.success(response.message || "Password reset successful");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Password reset failed. The link may be expired or invalid.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="The password reset link is missing or invalid."
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-sm leading-6 text-red-700">
            Please request a new password reset link.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-neutral-900 hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a new password for your CBNK account."
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            autoComplete="new-password"
            error={errors.newPassword}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={loading}>
            Reset Password
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
          <h3 className="text-lg font-semibold text-green-800">
            Password reset successful
          </h3>

          <p className="mt-2 text-sm leading-6 text-green-700">
            Your password has been updated successfully.
          </p>

          <p className="mt-3 text-xs text-green-600">
            Redirecting you to login...
          </p>
        </div>
      )}

      {!success && (
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-neutral-900 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
