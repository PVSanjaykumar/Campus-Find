import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReportLost() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemType: "",
    itemName: "",
    location: "",
    itemDate: "",
    description: "",
    company: "",
    color: "",
    cash: "",
    idName: "",
    keyType: "",
  });
  const [image, setImage] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("itemType", "Lost");
      data.append("itemName", formData.itemName);
      data.append("location", formData.location);
      data.append("itemDate", formData.itemDate);
      data.append("description", formData.description || "");

      data.append(
        "details",
        JSON.stringify({
          company: formData.company || "",
          color: formData.color || "",
          cash: formData.cash ? Number(formData.cash) : null,
          idName: formData.idName || "",
          keyType: formData.keyType || "",
        }),
      );

      // Add image only if the user selected one
      if (image) {
        data.append("image", image);
      }

      await API.post("/items", data);

      navigate("/submission-success", {
        state: {
          itemType: "Lost",
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to report the item.");
    } finally {
      setLoading(false);
    }
  };

  const showCompanyColor = ["Mobile", "Laptop", "Earbuds"].includes(
    formData.itemType,
  );

  const showColor = ["Purse"].includes(formData.itemType);

  const showCash = formData.itemType === "Cash";

  const showIdName = formData.itemType === "ID Card";

  const showKeyType = formData.itemType === "Keys";

  return (
    <div className="page">
      <div className="page-header">
        <div className="auth-icon">📢</div>

        <h1>Report a Lost Item</h1>

        <p>Tell us what you lost and where you last saw it.</p>
      </div>

      <div className="form-container">
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📦 Item Type</label>

            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              required
            >
              <option value="">Select item type</option>

              <option value="Mobile">📱 Mobile</option>

              <option value="Laptop">💻 Laptop</option>

              <option value="Earbuds">🎧 Earbuds</option>

              <option value="Purse">👛 Purse</option>

              <option value="ID Card">🪪 ID Card</option>

              <option value="Keys">🔑 Keys</option>

              <option value="Cash">💰 Cash</option>
            </select>
          </div>

          <div className="form-group">
            <label>📝 Item Name</label>

            <input
              type="text"
              name="itemName"
              placeholder="Example: Samsung Galaxy S24"
              value={formData.itemName}
              onChange={handleChange}
              required
            />
          </div>

          {showCompanyColor && (
            <>
              <div className="form-group">
                <label>🏷️ Company / Brand</label>

                <input
                  type="text"
                  name="company"
                  placeholder="Example: Samsung"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>🎨 Color</label>

                <input
                  type="text"
                  name="color"
                  placeholder="Example: Black"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {showColor && (
            <div className="form-group">
              <label>🎨 Color</label>

              <input
                type="text"
                name="color"
                placeholder="Example: Brown"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          )}

          {showCash && (
            <div className="form-group">
              <label>💰 Amount</label>

              <input
                type="number"
                name="cash"
                placeholder="Enter amount"
                min="0"
                value={formData.cash}
                onChange={handleChange}
              />
            </div>
          )}

          {showIdName && (
            <div className="form-group">
              <label>🪪 Name on ID Card</label>

              <input
                type="text"
                name="idName"
                placeholder="Enter name printed on ID"
                value={formData.idName}
                onChange={handleChange}
              />
            </div>
          )}

          {showKeyType && (
            <div className="form-group">
              <label>🔑 Key Type</label>

              <input
                type="text"
                name="keyType"
                placeholder="Example: Room key"
                value={formData.keyType}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>📍 Location</label>

            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              <option value="">Select location</option>

              <option value="Library">📚 Library</option>

              <option value="Canteen">🍽️ Canteen</option>

              <option value="Academic Block 1">🏫 Academic Block 1</option>

              <option value="Academic Block 2">🏫 Academic Block 2</option>

              <option value="Boys Hostel 2">🏠 Boys Hostel 2</option>

              <option value="Girls Hostel 2">🏠 Girls Hostel 2</option>
            </select>
          </div>

          <div className="form-group">
            <label>📅 Date Lost</label>

            <input
              type="date"
              name="itemDate"
              value={formData.itemDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>📄 Description</label>

            <textarea
              name="description"
              placeholder="Describe the item and where you lost it..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              📷 Item Image <span>(Optional)</span>
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <small>JPG, PNG or WEBP. Maximum size: 5 MB.</small>
          </div>

          <button
            type="submit"
            className="btn btn-primary form-submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "📢 Report Lost Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportLost;
