import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { forgotPassword } from "../../services/api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(trimmedEmail);

      if (response.success) {
        setSubmitted(true);
        toast.success(
          response.message ||
            "If this email exists, a password reset link has been sent.",
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to process your request. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your registered email and we’ll help you reset your password."
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="Enter your registered email"
            autoComplete="email"
            error={error}
          />

          <Button type="submit" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
          <h3 className="text-lg font-semibold text-neutral-900">
            Check your email
          </h3>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            If an account exists with this email address, you will receive
            instructions to reset your password.
          </p>

          <p className="mt-3 text-xs text-neutral-500">
            Please also check your Spam or Promotions folder.
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm font-semibold text-neutral-900 hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
