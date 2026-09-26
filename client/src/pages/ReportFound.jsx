import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReportFound() {
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

      data.append("itemType", "Found");
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
          itemType: "Found",
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

  const showColor = formData.itemType === "Purse";

  const showCash = formData.itemType === "Cash";

  const showIdName = formData.itemType === "ID Card";

  const showKeyType = formData.itemType === "Keys";

  return (
    <div className="page">
      <div className="page-header">
        <div className="auth-icon">🤝</div>

        <h1>Report a Found Item</h1>

        <p>Help return someone's belongings to them.</p>
      </div>

      <div className="form-container">
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Item Type */}

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

          {/* Item Name */}

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

          {/* Company + Color */}

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

          {/* Purse Color */}

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

          {/* Cash */}

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

          {/* ID Card */}

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

          {/* Keys */}

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

          {/* Location */}

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

          {/* Date Found */}

          <div className="form-group">
            <label>📅 Date Found</label>

            <input
              type="date"
              name="itemDate"
              value={formData.itemDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}

          <div className="form-group">
            <label>📄 Description</label>

            <textarea
              name="description"
              placeholder="Describe the item and where you found it..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Item Image */}

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
            {loading ? "Submitting..." : "🤝 Report Found Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportFound;
