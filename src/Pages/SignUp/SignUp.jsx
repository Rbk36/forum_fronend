import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { axiosInstance } from "../../utility/axios";
import classes from "./signUp.module.css";
import { useNavigate } from "react-router-dom";

function Signup({ onSwitch }) {
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  function validateUserData(fname, lname) {
    const isValidFname = /^[A-Za-z]{2,}$/.test(fname.trim());
    const isValidLname = /^[A-Za-z]{2,}$/.test(lname.trim());
    return isValidFname && isValidLname;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUserData(formData.firstName, formData.lastName)) {
      await Swal.fire({
        title: "Error",
        text: "Please enter valid first and last name. Names should contain only letters and be at least two characters.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/user/register", {
        username: formData.username,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        setSuccess("User registered successfully.");
        setError(null);

        await Swal.fire({
          title: "Success!",
          text: "User registered successfully! Logging in...",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Navigate **after** the alert
        navigate("/login");

        // Auto login after successful registration
        try {
          const loginResponse = await axiosInstance.post("/user/login", {
            email: formData.email,
            password: formData.password,
          });
          if (loginResponse.status === 200) {
            localStorage.setItem("Evangadi_Forum", loginResponse.data.token);
            navigate("/"); // redirect to home or dashboard
          } else {
            setError(
              loginResponse.data.msg || "Login failed. Please try again."
            );
          }
        } catch (loginErr) {
          console.error("Login error:", loginErr);
          setError("An error occurred during login. Please try again.");
        }
      } else {
        setError(response.data.Msg || "Registration failed.");
        setSuccess(null);
        await Swal.fire({
          title: "Error",
          text:
            response.data.Msg || "Error submitting the form. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Registration API error:", err);
      const msg =
        err.response?.data?.Msg ||
        "Error submitting the form. Please try again.";
      setError(msg);
      setSuccess(null);
      await Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className={classes.formcontainer}>
      <h2>Join the network</h2>
      <p className="signin-text">
        Already have an account?{" "}
        <a onClick={onSwitch} style={{ cursor: "pointer", color: "#ff6600" }}>
          Sign in
        </a>
      </p>
      {error && <p className={classes.error}>{error}</p>}
      {success && <p className={classes.success}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <div className={classes.nameinputs}>
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div className={classes.passwordinput}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={handleTogglePassword}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          <div style={{ padding: "5px", fontSize: "14px" }}>
            I agree to the <Link to="/privacyPolicy">privacy policy</Link> and{" "}
            <Link to="/terms">terms of service</Link>.
          </div>
        </div>
        <button type="submit" className={classes.submitbtn}>
          Agree and Join
        </button>
        <p className={classes.signintext}>
          <a
            onClick={onSwitch}
            style={{ cursor: "pointer", color: "var(--primary-color)" }}
          >
            Already have an account?
          </a>
        </p>
      </form>
    </div>
  );
}

export default Signup;
