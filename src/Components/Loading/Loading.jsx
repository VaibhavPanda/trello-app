import "./Loading.css";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>

        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
