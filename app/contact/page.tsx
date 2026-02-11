import styles from './page.module.css';

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <div className={styles.backgroundWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/v5.mp4" type="video/mp4" />
        </video>
        <div className={styles.backgroundOverlay}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.infoSection}>
            <h1 className={styles.title}>Get in Touch</h1>
            <p className={styles.subtitle}>
              Whether you have a specific project in mind or just want to explore possibilities,
              we&apos;re here to help you create your perfect space.
            </p>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <h3>Visit Us</h3>
                <p>123 Design Avenue,<br />Indiranagar, Bangalore - 560038</p>
                <div className={styles.mapContainer}>
                  <iframe
                    className={styles.mapFrame}
                    src="https://maps.google.com/maps?q=Florix%20Technologies%20Bangalore&output=embed"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              <div className={styles.detailItem}>
                <h3>Contact</h3>
                <p>+91 98765 43210</p>
                <p>hello@arambha.com</p>
              </div>

              <div className={styles.detailItem}>
                <h3>Hours</h3>
                <p>Mon - Sat: 10:00 AM - 7:00 PM</p>
                <p>Sun: By Appointment</p>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" placeholder="Your Name" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Your Email" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={5} placeholder="Tell us about your project"></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}