import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { loginUser } from "../../services/api/authApi";

import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

      const response = await loginUser({
        identifier: formData.identifier.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.success) {
        toast.success(response.message || "Login successful");

        await fetchCurrentUser();

        navigate("/");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to your CBNK account to continue shopping."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email or Username"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          placeholder="Enter email or username"
          autoComplete="username"
          error={errors.identifier}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading}>
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-neutral-900 hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
