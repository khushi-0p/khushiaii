import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      // Send the email silently in the background using formsubmit.co
      await fetch("https://formsubmit.co/ajax/khushipayal2720@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _captcha: "false" // Disable captcha for smoother UX
        }),
      });

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 4 seconds
      setTimeout(() => setStatus("idle"), 4000);
    } catch (error) {
      console.error("Failed to send message:", error);
      // We'll just reset status if it fails for simplicity in this mock
      setStatus("idle");
    }
  };

  return (
    <main className="contact-page container animate-fadeIn">
      <div className="contact-wrapper">
        <section className="contact-info">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have questions about Khushi AI? Want to suggest a new feature? We'd love to hear from you.
          </p>

          <div className="contact-methods">
            <div className="method-item glass-card">
              <span className="method-icon">📧</span>
              <div>
                <h3>Email Us</h3>
                <p>khushipayal2720@gmail.com</p>
              </div>
            </div>

            <div className="method-item glass-card">
              <span className="method-icon">🐦</span>
              <div>
                <h3>Twitter</h3>
                <p>@KhushiAI_Music</p>
              </div>
            </div>

            <div className="method-item glass-card">
              <span className="method-icon">📍</span>
              <div>
                <h3>Location</h3>
                <p>Global (Remote)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-form-section glass-card">
          <h2>Send a Message</h2>
          
          {status === "success" && (
            <div className="contact-success animate-scaleIn">
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
              />
            </div>

            <div className="input-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary contact-submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
