import { useState } from "react";
import { useNavigate } from "react-router"
import { loginWithGoogle } from "../../services/authService";
import "./Login.css"

const Login = () => {

  const navigate = useNavigate();

  const [error,setError] =  useState("")

  const handleLogin = async() => {
    try{
      setError("")
      await  loginWithGoogle();
      navigate("/dashboard");
    } catch (error){
      console.log(error)
      setError("Unable to sign in!")
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">panda</div>
        <h2>Welcome Back!</h2>
        <p>Sign in to Continue</p>
        <button className="google-login-button" onClick={handleLogin}>
          Continue with Google
        </button>

        {error && (<p className="login-error">{error}</p>)}
      </div>
    </main>
  )
}

export default Login

