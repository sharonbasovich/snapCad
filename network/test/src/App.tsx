import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  useEffect(() => {
    // Check backend health on component mount
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("http://localhost:5000/health");
      if (response.ok) {
        setBackendStatus("Online");
      } else {
        setBackendStatus("Offline");
      }
    } catch (err) {
      setBackendStatus("Offline");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image file");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("Processing your image...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/generate3d", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate 3D model");
      }

      // For file download, we need to handle the response as a blob
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `model_${Date.now()}.glb`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("3D model generated and downloaded successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred during processing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          3D Model Generator
        </h1>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Upload Image
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#666",
                marginTop: "0.25rem",
              }}
            >
              Supported formats: PNG, JPG, JPEG
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !file}
            style={{
              width: "100%",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              color: "white",
              fontWeight: "500",
              backgroundColor: isLoading || !file ? "#ccc" : "#3b82f6",
              cursor: isLoading || !file ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {isLoading ? "Processing..." : "Generate 3D Model"}
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#d1fae5",
              color: "#047857",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1.5rem",
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                border: "2px solid #ddd",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#666" }}>
        <p>
          Backend Status:
          <span
            style={{
              fontWeight: "500",
              color: backendStatus === "Online" ? "#16a34a" : "#dc2626",
              marginLeft: "0.25rem",
            }}
          >
            {backendStatus}
          </span>
        </p>
      </div>
    </div>
  );
}
