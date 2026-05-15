import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const emptyForm = {
  name: "",
  notes: "",
  category: "pantry",
  status: "needed",
  quantity: 1,
  purchase_by: "",
  brand: "",
};

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadItems = async () => {
    const res = await fetch(`${API_BASE_URL}/items`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const queryMatch =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.notes || "").toLowerCase().includes(query.toLowerCase()) ||
        (item.brand || "").toLowerCase().includes(query.toLowerCase());
      const statusMatch =
        statusFilter === "all" || item.status === statusFilter;
      const categoryMatch =
        categoryFilter === "all" || item.category === categoryFilter;
      return queryMatch && statusMatch && categoryMatch;
    });
  }, [items, query, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const bought = items.filter((item) => item.status === "bought").length;
    const needed = items.filter((item) => item.status === "needed").length;
    return { total, bought, needed };
  }, [items]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      purchase_by: form.purchase_by || null,
      brand: form.brand.trim() || null,
    };

    if (editingId) {
      await fetch(`${API_BASE_URL}/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    loadItems();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      notes: item.notes || "",
      category: item.category,
      status: item.status,
      quantity: item.quantity ?? 1,
      purchase_by: item.purchase_by || "",
      brand: item.brand || "",
    });
  };

  const handleDelete = async (itemId) => {
    await fetch(`${API_BASE_URL}/items/${itemId}`, { method: "DELETE" });
    loadItems();
  };

  const handleStatus = async (item, status) => {
    await fetch(`${API_BASE_URL}/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status }),
    });
    loadItems();
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <span className="pill">Grocery Checklist</span>
          <h1>Build your grocery list and mark items as bought.</h1>
          <p>
            Add ingredients, keep brand and aisle notes, and track what you
            still need for your next shopping trip.
          </p>
        </div>
        <div className="hero-card">
          <div>
            <p className="label">Items on list</p>
            <p className="stat">{stats.total}</p>
          </div>
          <div>
            <p className="label">Needed</p>
            <p className="stat">{stats.needed}</p>
          </div>
          <div>
            <p className="label">Bought</p>
            <p className="stat">{stats.bought}</p>
          </div>
        </div>
      </header>

      <section className="card form-card">
        <div className="card-header">
          <div>
            <h2>{editingId ? "Update item" : "Add grocery item"}</h2>
            <p className="muted">
              Add the product, quantity, brand, and purchase notes.
            </p>
          </div>
          {editingId && (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="name">Item</label>
            <input
              id="name"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Milk, apples, eggs"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
              placeholder="Choose low-fat, organic, or your preferred package size."
              rows={3}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
              >
                <option value="produce">Produce</option>
                <option value="dairy">Dairy</option>
                <option value="bakery">Bakery</option>
                <option value="pantry">Pantry</option>
                <option value="frozen">Frozen</option>
                <option value="beverages">Beverages</option>
                <option value="household">Household</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
              >
                <option value="needed">Needed</option>
                <option value="bought">Bought</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) =>
                  updateForm("quantity", Number(event.target.value) || 1)
                }
              />
            </div>
            <div className="field">
              <label htmlFor="purchase_by">Buy by</label>
              <input
                id="purchase_by"
                type="date"
                value={form.purchase_by}
                onChange={(event) =>
                  updateForm("purchase_by", event.target.value)
                }
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="brand">Brand / Aisle</label>
            <input
              id="brand"
              value={form.brand}
              onChange={(event) => updateForm("brand", event.target.value)}
              placeholder="Whole Foods, store brand, aisle 5"
            />
          </div>
          <button type="submit">{editingId ? "Save item" : "Add item"}</button>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Shopping list</h2>
            <p className="muted">
              Search, filter, and organize your next grocery run.
            </p>
          </div>
          <div className="filters">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search items"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              <option value="produce">Produce</option>
              <option value="dairy">Dairy</option>
              <option value="bakery">Bakery</option>
              <option value="pantry">Pantry</option>
              <option value="frozen">Frozen</option>
              <option value="beverages">Beverages</option>
              <option value="household">Household</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All status</option>
              <option value="needed">Needed</option>
              <option value="bought">Bought</option>
            </select>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <h3>No items yet</h3>
            <p>Add your first grocery item to start the list.</p>
          </div>
        ) : (
          <ul className="list">
            {filteredItems.map((item) => (
              <li key={item.id} className="list-item">
                <div className="entry">
                  <div>
                    <div className="entry-title">
                      <span className={`badge badge-${item.status}`}>
                        {item.status}
                      </span>
                      <span className={`badge badge-quantity`}>
                        {item.quantity}
                      </span>
                      <span className="badge badge-category">
                        {item.category}
                      </span>
                    </div>
                    <h3>{item.name}</h3>
                    <p className="muted">{item.notes || "No notes yet."}</p>
                    <div className="meta">
                      <span>
                        {item.purchase_by
                          ? `Buy by ${item.purchase_by}`
                          : "No buy-by date"}
                      </span>
                      <span>{item.brand || "No brand or aisle"}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="ghost" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button
                      className="ghost"
                      onClick={() =>
                        handleStatus(
                          item,
                          item.status === "needed" ? "bought" : "needed",
                        )
                      }
                    >
                      {item.status === "needed" ? "Mark bought" : "Mark needed"}
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
